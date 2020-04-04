import os
import io
from datetime import datetime
import random
from imaging import *


from flask import Flask, redirect, url_for, request, render_template, jsonify, send_file
from flask_api import status

from pymongo import MongoClient, ReturnDocument
from bson.objectid import ObjectId

DEBUG = True
DEFAULT_WIN_COUNT = 0
CITIES = ['Toronto']
app = Flask(__name__)

# I think this is the default port for mongodb
client = MongoClient(os.environ['DB_PORT_27017_TCP_ADDR'], 27017)
db = client.tododb

def SederData(
    name, roomCode='', huntIds=None,
    creationTime=None):

    return {
        'name': name,
        'roomCode': str(roomCode),
        'huntIds': [],
        'creationTime': creationTime or datetime.now(),
        'huntQueue': [],
        'members': {}
    }

def HuntData(
    sederId, isActive=False, participants=None,
    city=None, matzahXY=None, winner=-1, finders=None,
    creationTime=None, startTime = None, isFinished=False):

    return {
        'sederId': sederId,
        'isActive': isActive,
        'participants': participants or [],
        'city': city or '',
        'matzahXY': matzahXY or (0,0),
        'winner': winner,
        'creationTime': creationTime or datetime.now(),
        'startTime': startTime,
        'isFinished': finished
    }

if DEBUG:
    names = ['jonas', 'david', 'daniel', 'allison']
    rooms = [123, 321, 222, 666]
    for name, room in zip(names, rooms):
        # create a seder
        result = db.seders.insert_one(SederData(
            name=f"{name}'s seder",
            roomCode=room,
            huntIds=[],

        ))
        # create the hunt
        seder_uid = result.inserted_id
        huntResult = db.hunts.insert_one(HuntData(
            sederId=seder_uid,
            isActive=True,
            city='toronto',
        ))
        updated_fields = {'huntIds': [huntResult.inserted_id]}
        db.seders.update_one(
            filter={'_id': seder_uid},
            update={'$set': updated_fields},
        )

        print(name, room, result.inserted_id, huntResult.inserted_id)


PROJECT_PATH = '/usr/src/app'

def get_image_id(huntDoc):
    """Finds the image_id needed for loading an image from db"""
    return -1

def parseIdArg(idArg):
    try:
        result = ObjectId(idArg)
    except:
        result = None
    return result

@app.route('/check_location', methods=['GET'])
def checkLocation():
    """User hits this endpoint when they click on a location.

    The result is whether the location is found or not
    Also any additional info needed for the follow up GET
    in the event that they are correct"""

    # get parameters and sanitize
    huntIdArg = request.args.get('huntId')
    locationName = request.args.get('locationName')

    try:
        huntId = ObjectId(huntIdArg)
        failedToParse = False
    except:
        huntId = None
        failedToParse = True

    if(not huntId or not locationName):
        response = {'Error': "Whoops! Bad args"}
        error_result = (response, status.HTTP_400_BAD_REQUEST)
        return error_result

    result = db.hunts.find_one({'_id': huntId})

    # if the hunt doesn't exist or hasn't started return a 400
    if not result or not result['isActive']:
        response = {'Error': "Whoops! invalid hunt"}
        error_result = (response, status.HTTP_400_BAD_REQUEST)
        return error_result

    # check if they got the right one
    if result['city'].lower() == locationName.lower():
        image_id = get_image_id(result)
        response = {
            'found': True,
            'image_id': image_id,
        }
    else:
        response = {
            'found': False,
            'image_id': -1,
        }

    return (response, status.HTTP_200_OK)

@app.route('/get_image')
def getImage():

    response = {'Error': "Whoops! invalid hunt"}
    error_result = (response, status.HTTP_400_BAD_REQUEST)

    huntIdArg = request.args.get('huntId')
    huntId = parseIdArg(huntIdArg)

    if not huntId:
        return error_result

    result = db.hunts.find_one({'_id': huntId})

    if not result or not result['city']:
        return error_result

    # TODO don't just do a random image?
    img = getRandomImage(result['city'])
    matzahImg = getMatzahImage()
    randomHide(img, matzahImg)
    if not img:
        response = {'Error': "Whoops! couldn't find an image"}
        error_result = (response, status.HTTP_500_INTERNAL_SERVER_ERROR)
        return error_result

    imgByteArr = io.BytesIO()
    img.save(imgByteArr, format='JPEG')
    imgByteArr = imgByteArr.getvalue()
    return send_file(
        io.BytesIO(imgByteArr),
        mimetype='image/jpg',
    )

@app.route('/join_seder', methods=['PUT'])
def joinSeder():

    # Get data from the HTTP request
    sederCode = request.args.get('roomCode')
    nickname = request.args.get('nickname')

    if nickname is None:
        response = {'ok': False, 'message': 'You need a nickname homie'}
        return (response, status.HTTP_400_BAD_REQUEST)

    # Grab the entire seder document that matches the roomcode
    sederData = db.seders.find_one({"roomCode": sederCode})


    # Check that the seder exists
    if sederData is None:
        response = {'ok': False, 'message': 'Seder not found'}
        return (response, status.HTTP_400_BAD_REQUEST)
    
    # Mazel tov, it exists. Now get the unique mongo id (i.e. _id)
    sederId = sederData['_id']

    # Find a hunt in the database that corresponds to the seder that is being joined AND is the most recent.
    currentHunt = db.hunts.find({"sederId": sederId}).limit(1).sort([("$natural",-1)])[0]

    # Get unique mongo _id of the hunt
    currentHuntId = currentHunt['_id']
    avatar = random.randint(0,9)
    user_uuid = ObjectId()
    sederUpdates = {"$push": {"huntQueue": user_uuid}, {'members': {user_uuid: [nickname, DEFAULT_WIN_COUNT, avatar] } } }

    # Check to see if the hunt has started
    if currentHunt['isActive'] is True:
        # If the hunt has started, user is not allowed to join. Add them to the hunt queue.
        sederData = db.seders.find_one_and_update({"_id": sederId}, sederUpdates, return_document=ReturnDocument.AFTER)
        response = {
            'queued': True,
            'hunt_id': str(currentHuntId)
        }
        # response = db.seders.find_one({"_id": sederId})

    else:
        # Hunt hasn't started yet, add them as a participant in the hunt
        currentHunt = db.hunts.find_one_and_update({"_id": currentHuntId}, { "$push": {"participants": user_uuid} }, return_document=ReturnDocument.AFTER)
        sederData = db.seders.find_one_and_update({"_id": sederId}, sederUpdates, return_document=ReturnDocument.AFTER)
        response = {
            'queued': False,
            'hunt_id': str(currentHuntId)
        }
        # response = db.hunts.find_one({"_id": currentHuntId})

    return (response, status.HTTP_200_OK)

@app.route('/start_hunt', methods=['PUT'])
def startHunt():
    """ 
    Owner of seder clicks start hunt

    Input: hunt_id
    Returns: 
    """

    # get parameters and sanitize
    huntIdArg = request.args.get('huntId')

    try:
        huntId = ObjectId(huntIdArg)
        failedToParse = False
    except:
        huntId = None
        failedToParse = True

    if(not huntId):
        response = {'Error': "Whoops! Bad args"}
        return (response, status.HTTP_400_BAD_REQUEST)

    # 1. Get the hunt and update it
    hunt = db.hunts.find_one_and_update({'_id': huntId}, {'isActive': True, 'startTime': datetime.now()+10}, return_document=ReturnDocument.AFTER)

    if hunt is None:
        response = {'ok': False, 'message': 'Hunt not found'}
        return (response, status.HTTP_400_BAD_REQUEST)

    response = {'ok:': True, 'participants': hunt['participants']}
    return (response, status.HTTP_200_OK)

@app.route('/conclude_hunt', methods=['PUT'])
def concludeHuntAndCreateNewHunt():
    # this guy takes people off the seder queue and puts them in this hunt

    # get parameters and sanitize
    huntToConcludeId = request.args.get('huntId')
    sederCode        = request.args.get('roomCode')
    winner           = request.args.get('winnerName')

    try:
        huntToConcludeId = ObjectId(huntIdArg)
        failedToParse = False
    except:
        huntId = None
        failedToParse = True

    if(not huntToConcludeId):
        response = {'Error': "Whoops! Bad args"}
        return (response, status.HTTP_400_BAD_REQUEST)

    # 1. Update the hunt that just concluded
    # # a) isActive = False
    # # b) isFinished = True
    # # c) winner = winner_nickname
    updates = {'isActive': False, 'isFinished': True, 'winner': winner}
    hunt = db.hunts.find_one_and_update({'_id': huntToConcludeId}, updates, return_document=ReturnDocument.AFTER)
    prevParticipants = hunt.participants

    # 2. Create a new hunt
    # # a) increment winner count
    # # b) Pop manz off the huntQueue from the seder and into the finders list
    # # c) Create new mongo hunt document
    sederData = db.seders.find_one({"roomCode": sederCode} )

    # Check that the seder exists
    if sederData is None:
        response = {'ok': False, 'message': 'Seder not found'}
        return (response, status.HTTP_400_BAD_REQUEST)

    sederId = sederData['_id']
    members = sederData['members']
    members.winner[1] += 1
    newHuntParticipants = sederData['huntQueue']
    participantsToInsert = prevParticipants + newHuntParticipants
    city = CITIES[random.randint(0,len(CITIES)-1)]

    updates = {"$set": {"huntQueue": []}, members}
    db.seders.update_one( {'_id': sederId}, updates)

    insertData = HuntData(sederId=sederId, participants=participantsToInsert, city=city)
    newHuntId = db.hunts.insert_one(insertData).inserted_id
    response = {'ok:': True}
    return (response, status.HTTP_200_OK)

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=DEBUG)