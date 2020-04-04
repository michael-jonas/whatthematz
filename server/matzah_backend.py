import os
import io
from datetime import datetime
import random
import string
import json

from profanityfilter import ProfanityFilter
from flask import Flask, redirect, url_for, request, render_template, jsonify, send_file
from flask_api import status
from pymongo import MongoClient, ReturnDocument
from bson.objectid import ObjectId

from imaging import *

DEBUG = True
DEFAULT_WIN_COUNT = 0
CITIES = ['Toronto']
app = Flask(__name__)

# MEMBERS idxs of components
M_NICKNAME = 0
M_WINS = 1
M_AVATAR = 2

# I think this is the default port for mongodb
client = MongoClient(os.environ['DB_PORT_27017_TCP_ADDR'], 27017)
db = client.tododb

def SederData(
    name, roomCode='', huntIds=None,
    creationTime=None, members=None):

    return {
        'name': name,
        'roomCode': str(roomCode),
        'huntIds': [],
        'creationTime': creationTime or datetime.now(),
        'huntQueue': [],
        # maps a Unique Id to a List
        # that List contains [nickname, wins, avatar]
        'members': members or dict(),
    }

def HuntData(
    sederId, isActive=False, participants=None,
    city=None, imageId=None, winner=-1, finders=None,
    creationTime=None, startTime=None, isFinished=False):
    
    return {
        'sederId': sederId,
        'isActive': isActive,
        # a list of Unique Ids (nicknames stored in Seder)
        'participants': participants or [],
        'city': city or '',
        'imageId': imageId,
        'winner': winner,
        'creationTime': creationTime or datetime.now(),
        'startTime': startTime,
        'isFinished': isFinished,
    }

def ImageData(img, rect):
    return {
        'img': img,
        'rect': rect,
    }

if DEBUG:
    names = ['jonas', 'david', 'daniel', 'allison']
    rooms = [123, 321, 222, 666]
    idxs = range(len(names))
    for i, name, room in zip(idxs, names, rooms):
        startTime = datetime.now() if i == 2 else None

        memberNicks = [n for n in names if n != name]
        memberIds = list(range(len(memberNicks)))
        members = dict((str(mid), [nick, 0, 0]) for mid, nick in zip(memberIds, memberNicks))

        # create a seder
        result = db.seders.insert_one(SederData(
            name=f"{name}'s seder",
            roomCode=room,
            huntIds=[],
            members=members if i == 1 else None,
        ))
        # create the hunt
        seder_uid = result.inserted_id
        huntResult = db.hunts.insert_one(HuntData(
            sederId=seder_uid,
            isActive=True,
            city='toronto',
            startTime=startTime,
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

def getHuntById(huntId):
    if isinstance(huntId, str):
        huntId = parseIdArg(huntId)

    if not huntId or not isinstance(huntId, ObjectId):
        return None

    return db.hunts.find_one({'_id': huntId})

def badResponse(bad='Bad args'):
    error = f'Whoops! {bad}.'
    response = {'Error': error}
    error_result = (response, status.HTTP_400_BAD_REQUEST)
    return error_result

def goodResponse(result):
    if not isinstance(result, dict):
        result = {'result': result}

    return (result, status.HTTP_200_OK)

@app.route('/get_player_list', methods=['GET'])
def getPlayerList():
    # get parameters and sanitize
    huntId = request.args.get('huntId')
    hunt = getHuntById(huntId)
    if not hunt:
        return badResponse('Bad args')

    sederId = hunt['sederId']
    if isinstance(sederId, str):
        sederId = ObjectId(sederId)

    players = hunt['participants']
    sederData = db.seders.find_one({"_id": sederId})
    members = sederData['members']

    # convert our data format into a dictionary
    def _foo(l):
        return {
            'nickname': l[M_NICKNAME],
            'wins': l[M_WINS],
            'avatar': l[M_AVATAR],
        }

    result = dict((pid, _foo(members[str(pid)])) for pid in players)
    return goodResponse(members)


@app.route('/hunt_start_time', methods=['GET'])
def huntStartTime():
    # get parameters and sanitize
    huntId = request.args.get('huntId')
    hunt = getHuntById(huntId)
    startTime = hunt['startTime'] if hunt else None

    if not hunt:
        return badResponse('Bad args')
    if not startTime:
        return badResponse('Invalid Hunt, hunt has no city associated')

    return goodResponse(startTime.isoformat())

@app.route('/get_hints', methods=['GET'])
def getHints():
    # get parameters and sanitize
    huntId = request.args.get('huntId')
    hunt = getHuntById(huntId)
    city = hunt['city'] if hunt else ''

    if not hunt:
        return badResponse('Bad args')

    if not city:
        return badResponse('Invalid Hunt, hunt has no city associated')

    # open the json
    fpath = os.path.join('cities', city + '.json')
    if os.path.exists(fpath) and os.path.isfile(fpath):
        with open(fpath) as f:
            data = json.load(f)
        hints = data['easyHints'] + data['mediumHints'] + data['hardHints']
        return goodResponse(hints)
    else:
        # return bad if no json found
        return badResponse('Invalid Resource, city JSON not found')

@app.route('/check_location', methods=['GET'])
def checkLocation():
    """User hits this endpoint when they click on a location.

    The result is whether the location is found or not
    Also any additional info needed for the follow up GET
    in the event that they are correct"""

    # get parameters and sanitize
    huntIdArg = request.args.get('huntId')
    locationName = request.args.get('locationName')
    huntId = parseIdArg(huntIdArg)

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

@app.route('/get_image', methods=['GET'])
def getImage():

    response = {'Error': "Whoops! invalid hunt"}
    error_result = (response, status.HTTP_400_BAD_REQUEST)

    huntIdArg = request.args.get('huntId')
    huntId = parseIdArg(huntIdArg)

    returnsRect = bool(request.args.get('getRect'))

    if not huntId:
        return error_result

    result = db.hunts.find_one({'_id': huntId})

    if not result:
        return badResponse('Could not find hunt')
    if not result['imageId']:
        return badResponse('Hunt has no image associated')

    imageId = result['imageId']
    hidden_image = db.hidden_images.find_one({'_id': imageId})
    if not hidden_image:
        return badResponse('Could not find image in DB')

    imageBytes = hidden_images['imgBytes']
    rect = hidden_image['rect']

    # # TODO don't just do a random image?
    # img = getRandomImage(result['city'])
    # matzahImg = getMatzahImage()
    # randomHide(img, matzahImg)
    # if not img:
    #     response = {'Error': "Whoops! couldn't find an image"}
    #     error_result = (response, status.HTTP_500_INTERNAL_SERVER_ERROR)
    #     return error_result

    # imgByteArr = io.BytesIO()
    # img.save(imgByteArr, format='JPEG')
    # imgByteArr = imgByteArr.getvalue()
    if returnsRect:
        return goodResponse(rect)

    return send_file(
        io.BytesIO(imgByteArr),
        mimetype='image/jpg',
    )

@app.route('/join_seder', methods=['POST'])
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
    # @Jonas are you sure this works as expected? Sorting after the limit statement?
    currentHunt = db.hunts.find({"sederId": sederId}).limit(1).sort([("$natural",-1)])[0]
    # Get unique mongo _id of the hunt
    currentHuntId = currentHunt['_id']
    avatar = random.randint(0,9)
    user_uuid = ObjectId()
    

    # Check to see if the hunt has started
    if currentHunt['isActive'] is True:
        # If the hunt has started, user is not allowed to join. Add them to the hunt queue.
        sederUpdates = { "$push": {"huntQueue": user_uuid}, '$set': {'members.'+str(user_uuid): [nickname, DEFAULT_WIN_COUNT, avatar] } }
        sederData = db.seders.find_one_and_update({"_id": sederId}, sederUpdates, return_document=ReturnDocument.AFTER)
        response = {
            'queued': True,
            'huntId': str(currentHuntId),
            'sederId': str(sederId),
            'userId': str(user_uuid)
        }
        # response = db.seders.find_one({"_id": sederId})

    else:
        # Hunt hasn't started yet, add them as a participant in the hunt
        sederUpdates = {'members': {user_uuid: [nickname, DEFAULT_WIN_COUNT, avatar] } } 
        currentHunt = db.hunts.find_one_and_update({"_id": currentHuntId}, { "$push": {"participants": str(user_uuid)} }, return_document=ReturnDocument.AFTER)
        sederData = db.seders.find_one_and_update({"_id": sederId}, sederUpdates, return_document=ReturnDocument.AFTER)
        response = {
            'queued': False,
            'huntId': str(currentHuntId),
            'sederId': str(sederId),
            'userId': str(user_uuid)
        }
        # response = db.hunts.find_one({"_id": currentHuntId})

    return (response, status.HTTP_200_OK)

@app.route('/trigger_hunt', methods=['PUT'])
def triggerHunt():
    """ 
    Owner of seder clicks start hunt

    Input: hunt_id
    Returns: 
    """

    # get parameters and sanitize
    huntIdArg = request.args.get('huntId')
    hunt = getHuntById(huntIdArg)

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

def createHuntInSeder(sederData, queuedPlayers, currentHuntData=None):
    sederId = sederData['_id']

    # get the last hunt from DB if not given to us
    if not currentHuntData and sederData['huntQueue']:
        lastHuntId = sederData['huntQueue'][-1]
        currentHuntData = db.hunts.find_one({"_id": currentHuntId})

    # create players from previous and queued
    prevPlayers = []
    if currentHuntData:
        prevPlayers = currentHuntData['participants']
    participants = prevPlayers + list(queuedPlayers)

    # create the new hunt and add it to the seder
    insertData = HuntData(sederId=sederId, participants=participants)
    newHuntId = db.hunts.insert_one(insertData).inserted_id
    db.seders.find_one_and_update( {'_id': sederId}, { "$push": {"huntIds": newHuntId} })

    return newHuntId

def setupHunt(huntId, city=None, matzahXY=None):
    """Sets up the hunt by generating the image based
    on params and storing it in DB.

    If city and matzahXY are None, generates a random image
    Stores the result in the images DB
    Returns the UID in the images DB for convenience?
    """

    # by default generate a random hunt
    if not city and not matzahRect:
        city = CITIES[random.randint(0,len(CITIES)-1)]
        img, rect = getRandomHide(city)

    # otherwise generate the hunt based on params
    else:
        img = getCityImage(city)
        matzahImg = getMatzahImage()
        img.paste(matzahImg, matzahXY, matzahImg)
        x, y, w, h = matzahXY, matzahImg.size
        rect = (x, y, w, h)

    # put the image in the images db, and link to it from the hunt
    imageId = db.hidden_images.insert_one(ImageData(img, rect)).inserted_id
    db.hunts.find_one_and_update({'_id': huntId}, {'imageId': imageId})
    return imageId


@app.route('/conclude_hunt', methods=['PUT'])
def concludeHuntAndCreateNewHunt():
    # this guy takes people off the seder queue and puts them in this hunt

    # get parameters and sanitize
    huntToConcludeId = request.args.get('huntId')
    sederCode        = request.args.get('roomCode')
    winner           = request.args.get('winnerName')

    huntToConcludeId = parseIdArg(huntToConcludeId)
    if not huntToConcludeId:
        response = {'Error': "Whoops! Bad args"}
        return (response, status.HTTP_400_BAD_REQUEST)

    # 1. Update the hunt that just concluded
    # # a) isActive = False
    # # b) isFinished = True
    # @ Jonas you will need to use the winners UID not their nickname
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
    # How does this work @Jonas
    # sederData.members doesn't have an attribute winner?
    # also get rid of magic numbers
    members.winner[M_WINS] += 1

    # pops the player queue for the next hunt
    newHuntParticipants = tuple(sederData['huntQueue'])
    # @Jonas why the difference in syntax here
    # set one, pass the other one?
    # we can probably aggregate this call to db.seders.update_one 
    # with the later one
    updates = {'$set': {'huntQueue': []}, 'members': members}
    db.seders.update_one( {'_id': sederId}, updates)

    newHuntId = createHuntInSeder(sederData, newHuntParticipants, hunt)
    # sets up new hunt with random image (by setting args None)
    setupHunt(newHuntId, city=None, matzahXY=None)

    # updates the seder with the newest hunt
    db.seders.update_one( {'_id': sederId}, { "$push": {"huntIds": newHuntId}})
    response = {'ok:': True}
    return (response, status.HTTP_200_OK)

@app.route('/create_seder', methods=['POST'])
def createSeder():
    sederName        = request.args.get('sederName')
    nickname         = request.args.get("nickname")

    if( (sederName is None) or (nickname is None) ):
        response = {'Error': "Whoops! Bad args"}
        return (response, status.HTTP_400_BAD_REQUEST)

    
    # 1. Create a seder
    roomCode = get_room_code()
    avatar = random.randint(0,9)
    userId = ObjectId()
    insertSederData = SederData(name = sederName, roomCode = roomCode, members={str(userId): [nickname, DEFAULT_WIN_COUNT, avatar]}) 
    sederData = db.seders.insert_one(insertSederData)
    sederId = sederData.inserted_id
    

    # 2. Create a hunt and update seders to include the hunt
    city = CITIES[random.randint(0,len(CITIES)-1)]
    insertHuntData = HuntData(sederId=sederId, participants=[userId], city=city)
    newHunt = db.hunts.insert_one(insertHuntData)
    newHuntId = newHunt.inserted_id
    result = db.seders.find_one_and_update( {'_id': sederId}, { "$push": {"huntIds": str(newHuntId)} }, return_document=ReturnDocument.AFTER)
    response = {'ok:': True}
    return ( response, status.HTTP_200_OK)

def get_room_code(stringLength = 4):
    pf = ProfanityFilter()
    letters = string.ascii_uppercase
    roomCode =  ''.join(random.choice(letters) for i in range(stringLength))
    while (pf.is_profane(roomCode)):
        roomCode =  ''.join(random.choice(letters) for i in range(stringLength))
    return roomCode


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=DEBUG)