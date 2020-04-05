import os
import io
from datetime import datetime
import random
import string
import json
from enum import Enum

import PIL
from profanityfilter import ProfanityFilter
from flask import Flask, redirect, url_for, request, render_template, jsonify, send_file
from flask_socketio import SocketIO
from flask_socketio import join_room, leave_room
from flask_api import status
from pymongo import MongoClient, ReturnDocument
from bson.objectid import ObjectId

from imaging import *

DEBUG = True
DEFAULT_WIN_COUNT = 0
CITIES = [
'Toronto',
'Montreal',
'Tel Aviv',
'Amsterdam',
'New York City',
'Los Angeles',
'Kiev',
'Vancouver',
'Berlin',
'Prague',
'Florence',
'Warsaw',
'Jerusalem',
'Chicago',
'Philadelphia',
'Buenos Aires',
'London',
'Addis Ababa',
'Paris',
'Melbourne'
]

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)


L_ROOMCODES = 4

# I think this is the default port for mongodb
client = MongoClient(os.environ['DB_PORT_27017_TCP_ADDR'], 27017)
db = client.tododb

SEDER_NAME = 'sederName'

def SederData(
    sederName, roomCode='', huntIds=None,
    creationTime=None, members=None):

    assert sederName
    roomCode = str(roomCode)
    if roomCode:
        assert len(roomCode) == L_ROOMCODES

    return {
        SEDER_NAME: sederName,
        'roomCode': roomCode,
        'huntIds': [],
        'creationTime': creationTime or datetime.now(),
        # 'huntQueue': [],
        # a list of UIDs to the users table
        'members': members or list(),
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

# MEMBERS idxs of components
M_NICKNAME = 'nickname'
M_WINS = 'score'
M_AVATAR = 'avatar'

def User(nickname, score, avatar):
    return {
        M_NICKNAME: nickname,
        M_SCORE: score,
        M_AVATAR: avatar,
    }

def ImageData(imgOrBytes, rect):

    if isinstance(imgOrBytes, PIL.Image):
        imgByteArr = io.BytesIO()
        imgOrBytes.save(imgByteArr, format='PNG')
        imgByteArr = imgByteArr.getvalue()
    else:
        imgByteArr = imgOrBytes

    return {
        'imgBytes': imgByteArr,
        'rect': rect,
    }

if __name__ == '__main__' and DEBUG:
    names = ['jonas', 'david', 'daniel', 'allison']
    rooms = ['ADCD', 'DCBA', 'AAAA', 'BBBB']
    idxs = range(len(names))

    db.seders.delete_many({})
    db.hunts.delete_many({})
    db.users.delete_many({})

    userIds = []
    for i, name in enumerate(names):
        uid = db.users.insert_one(User(name, 0, i))
        userIds.append(uid)

    for i, name, room in zip(idxs, names, rooms):
        startTime = datetime.now() if i == 2 else None

        # create a seder
        result = db.seders.insert_one(SederData(
            sederName=f"{name}'s seder",
            roomCode=room,
            huntIds=[],
            members=[],
            # members=userIds if i == 1 else None,
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

    for k, v in result.items():
        if isinstance(v, ObjectId):
            result[k] = str(v)

    return (result, status.HTTP_200_OK)

class BEVENTS(Enum):
    USER_JOINED = 1
    USER_LEFT = 2

# @socketio.on('join')
# def on_join(data):
#     username = data['username']
#     room = data['room']
#     join_room(room)
#     send(username + ' has entered the room.', room=room)

# @socketio.on('leave')
# def on_leave(data):
#     username = data['username']
#     room = data['room']
#     leave_room(room)
#     send(username + ' has left the room.', room=room)

@app.route('/get_seder_details', methods=['GET'])
def getSederDetails():
    sederId = parseIdArg(request.args.get('sederId'))
    # userId is optional!
    userId = parseIdArg(request.args.get('userId'))

    if not sederId:
        return badResponse('Bad args.')
    sederData = db.seders.find_one({"_id": sederId})
    if not sederData:
        return badResponse('No seder with given id')

    currentHuntId = db.hunts.find({"sederId": sederId}).sort([("$natural",-1)]).limit(1)[0]
    huntData = getHuntById(currentHuntId)
    isHuntActive = huntData['isActive']

    response = {'currentHuntId': currentHuntId, 'isHuntActive': isHuntActive}

    if userId:
        participants = huntData['participants']
        response['isUserInHunt'] = userId in participants

    return goodResponse(response)

@app.route('/get_player_list', methods=['GET'])
def getPlayerList():
    # get parameters and sanitize
    huntId = request.args.get('huntId')
    hunt = getHuntById(huntId)
    if not hunt:
        return badResponse('Bad args')

    # sederId = hunt['sederId']
    # if isinstance(sederId, str):
    #     sederId = ObjectId(sederId)

    players = hunt['participants']
    # sederData = db.seders.find_one({"_id": sederId})
    # members = sederData['members']

    # convert our data format into a dictionary
    def _foo(pid):
        # helper that just reformats the db result
        uuid = ObjectId(pid)
        l = db.users.find_one({'_id': uuid})
        return {
            'name': l[M_NICKNAME],
            'score': l[M_SCORE],
            'avatar': l[M_AVATAR],
        }

    result = [_foo(pid) for pid in players]
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
    fpath = os.path.join('cities', city.lower() + '.json')
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
    hunt = getHuntById(huntIdArg)

    if not hunt or not locationName:
        return badResponse('Bad args')

    # if the hunt doesn't exist or hasn't started return a 400
    if not hunt['isActive']:
        return badResponse('Invalid hunt!')

    # check if they got the right one
    if hunt['city'].lower() == locationName.lower():
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

    return goodResponse(response)

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
    roomCode = request.args.get('roomCode')
    nickname = request.args.get('nickname')

    if nickname is None:
        response = {'ok': False, 'message': 'You need a nickname homie'}
        return (response, status.HTTP_400_BAD_REQUEST)

    # Grab the seder document that matches the roomcode
    sederData = db.seders.find_one({"roomCode": roomCode})

    # Check that the seder exists
    if sederData is None:
        return badRequest('Seder not found!')
    
    # Mazel tov, it exists. Now get the unique mongo id (i.e. _id)
    sederId = sederData['_id']

    # Find a hunt in the database that corresponds to the seder that is being joined AND is the most recent.
    # @Jonas are you sure this works as expected? Sorting after the limit statement?
    currentHunt = db.hunts.find({"sederId": sederId}).limit(1).sort([("$natural",-1)])[0]
    # Get unique mongo _id of the hunt
    currentHuntId = currentHunt['_id']

    # generate a new user
    avatar = random.randint(0,9)
    user_uuid = db.users.insert_one(User(nickname, 0, avatar)).inserted_id

    # Check to see if the hunt has started
    # if currentHunt['isActive']:
    #     # If the hunt has started, user is not allowed to join. Add them to the hunt queue.
    #     sederUpdates = {"$push": {"huntQueue": user_uuid, 'members': user_uuid}}
    #     sederData = db.seders.find_one_and_update({"_id": sederId}, sederUpdates, return_document=ReturnDocument.AFTER)
    #     print(sederData)
    #     response = {
    #         'queued': True,
    #         'huntId': str(currentHuntId),
    #         'sederId': str(sederId),
    #         SEDER_NAME: sederData[SEDER_NAME],
    #         'userId': str(user_uuid)
    #     }
    #     # response = db.seders.find_one({"_id": sederId})

    # else:
    if True:
        # Hunt hasn't started yet, add them as a participant in the hunt
        print(sederData['members'])
        str_uid = str(user_uuid)
        db.seders.update_one({"_id": sederId}, {"$push": {'members': str_uid}})
        # db.hunts.update_one({"_id": currentHuntId}, { "$push": {"participants": str_uid}})
        response = {
            'queued': False,
            'huntId': str(currentHuntId),
            'sederId': str(sederId),
            # SEDER_NAME: sederData[SEDER_NAME],
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

# def createHuntInSeder(sederData, queuedPlayers, currentHuntData=None):
#     sederId = sederData['_id']

#     # get the last hunt from DB if not given to us
#     if not currentHuntData and sederData['huntIds']:
#         lastHuntId = sederData['huntIds'][-1]
#         currentHuntData = db.hunts.find_one({"_id": currentHuntId})

#     # create players from previous and queued
#     prevPlayers = []
#     if currentHuntData:
#         prevPlayers = currentHuntData['participants']
#     participants = prevPlayers + list(queuedPlayers)

#     # create the new hunt and add it to the seder
#     insertData = HuntData(sederId=sederId, participants=participants)
#     newHuntId = db.hunts.insert_one(insertData).inserted_id
#     db.seders.update_one({'_id': sederId}, { "$push": {"huntIds": newHuntId}})

#     return newHuntId

def setupHunt(huntId, city=None, matzahXY=None):
    """Sets up the hunt by generating the image based
    on params and storing it in DB.

    If city and matzahXY are None, generates a random image
    Stores the result in the images DB
    Returns the UID in the images DB for convenience?
    """

    # by default generate a random hunt
    if not city and not matzahXY:
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


# @app.route('/conclude_hunt', methods=['PUT'])
# def concludeHuntAndCreateNewHunt():
#     # this guy takes people off the seder queue and puts them in this hunt

#     # get parameters and sanitize
#     huntToConcludeId = request.args.get('huntId')
#     roomCode        = request.args.get('roomCode')
#     winnerId           = request.args.get('winnerId')

#     huntToConcludeId = parseIdArg(huntToConcludeId)
#     if not huntToConcludeId:
#         response = {'Error': "Whoops! Bad args"}
#         return (response, status.HTTP_400_BAD_REQUEST)

#     # 1. Update the hunt that just concluded
#     # # a) isActive = False
#     # # b) isFinished = True
#     # # c) winner = winner_nickname
#     updates = {'$set': {'isActive': False, 'isFinished': True, 'winner': winnerId}}
#     hunt = db.hunts.find_one_and_update({'_id': huntToConcludeId}, updates, return_document=ReturnDocument.AFTER)
#     prevParticipants = hunt['participants']

#     # 2. Create a new hunt
#     # # a) increment winner count
#     # # b) Pop manz off the huntQueue from the seder and into the finders list
#     # # c) Create new mongo hunt document
#     sederData = db.seders.find_one({"roomCode": roomCode})

#     # Check that the seder exists
#     if sederData is None:
#         response = {'ok': False, 'message': 'Seder not found'}
#         return (response, status.HTTP_400_BAD_REQUEST)

#     # TODO update to use db.users
#     sederId = sederData['_id']
#     members = sederData['members']
#     members[winnerId][M_WINS] += 1

#     # pops the player queue for the next hunt
#     newHuntParticipants = tuple(sederData['huntQueue'])
#     newHuntId = createHuntInSeder(sederData, newHuntParticipants, hunt)
#     # sets up new hunt with random image (by setting args None)
#     setupHunt(newHuntId, city=None, matzahXY=None)

#     # updates the seder with the newest hunt
#     updates = {'$set': {'huntQueue': []}, 'members': members, "$push": {"huntIds": newHuntId}}
#     db.seders.update_one({'_id': sederId}, updates)
#     response = {'ok:': True}
#     return (response, status.HTTP_200_OK)

# @app.route('/create_seder', methods=['POST'])
# def createSeder():
#     sederName        = request.args.get(SEDER_NAME)
#     nickname         = request.args.get("nickname")

#     if( (sederName is None) or (nickname is None) ):
#         response = {'Error': "Whoops! Bad args"}
#         return (response, status.HTTP_400_BAD_REQUEST)

#     # 1. Create a seder
#     roomCode = getRoomCode()
#     avatar = random.randint(0,9)
#     userId = ObjectId()
#     insertSederData = SederData(name = sederName, roomCode = roomCode, members={str(userId): [nickname, DEFAULT_WIN_COUNT, avatar]}) 
#     sederData = db.seders.insert_one(insertSederData)
#     sederId = sederData.inserted_id
    
#     # 2. Create a hunt and update seders to include the hunt
#     city = CITIES[random.randint(0,len(CITIES)-1)]
#     insertHuntData = HuntData(sederId=sederId, participants=[userId], city=city)
#     newHunt = db.hunts.insert_one(insertHuntData)
#     newHuntId = newHunt.inserted_id
#     db.seders.update_one({'_id': sederId}, {"$push": {"huntIds": str(newHuntId)} })

#     response = {
#         'sederId': sederId,
#         SEDER_NAME: sederName,
#         'roomCode': roomCode,
#         'huntId': newHuntId,
#     }
#     return goodResponse(response)

def getRoomCode(stringLength = 4):
    pf = ProfanityFilter()
    letters = string.ascii_uppercase
    roomCode =  ''.join(random.choice(letters) for i in range(stringLength))
    # need to check also whether the room code is already being used
    while (pf.is_profane(roomCode)):
        roomCode =  ''.join(random.choice(letters) for i in range(stringLength))
    return roomCode

@app.route('/get_cities', methods=['GET'])
def getCities():
    # returns: list of tuples, each tuple contains (city name, lat, lon)
    cities = []
    for city in CITIES:
        fpath = os.path.join('cities', city.lower() + '.json')
        print(fpath)
        if os.path.exists(fpath) and os.path.isfile(fpath):
            with open(fpath) as f:
                data = json.load(f)
            lat = data['latitude']
            lon = data['longitude']
            cityLatLon = (city, lat, lon)
            cities.append(cityLatLon)
        else:
            # return bad if no json found
            return badResponse('Invalid Resource, city JSON not found')
    return goodResponse(cities)

# @app.route('/get_hunts', methods=['GET'])
# def getHunts():
#     hunts = db.hunts.find({})
#     huntList = []
#     for hunt in hunts:
#         huntList.append(hunt)
#     return str(huntList)

# @app.route('/get_seders', methods=['GET'])
# def getSeders():
#     seders = db.seders.find({})
#     sederList = []
#     for seder in seders:
#         sederList.append(seder)
#     return str(sederList)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=DEBUG)
    # socketio.run(app)