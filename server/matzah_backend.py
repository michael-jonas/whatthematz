import os
from datetime import datetime

from flask import Flask, redirect, url_for, request, render_template
from flask_api import status

from pymongo import MongoClient

DEBUG = True
app = Flask(__name__)

# I think this is the default port for mongodb
client = MongoClient(os.environ['DB_PORT_27017_TCP_ADDR'], 27017)
db = client.tododb

def SederData(
    name, roomCode=None, huntIds=None,
    creationTime=None):

    return {
        'name': name,
        'roomCode': roomCode or 0,
        'huntIds': [],
        'creationTime': creationTime or datetime.now(),
    }

def HuntData(
    sederId, isActive=False, participants=None,
    city=None, matzahXY=None, winner=-1, finders=None,
    creationTime=None):

    return {
        'sederId': sederId,
        'isActive': isActive,
        'participants': participants or [],
        'city': city or '',
        'matzahXY': matzahXY or (0,0),
        'winner': winner,
        'finders': finders or [],
        'creationTime': creationTime or datetime.now()
    }

if DEBUG:
    names = ['jonas', 'david', 'daniel', 'allison']
    rooms = [123, 321, 222, 666]
    for name, room in zip(names, rooms):
        result = db.seders.insert_one(SederData(
            name=f"{name}'s seder",
            roomCode=room,
            huntIds=[],

        ))
        seder_uid = result.inserted_id
        huntResult = db.hunts.insert_one(HuntData(sederId=seder_uid))
        updated_fields = {'huntIds': [huntResult.inserted_id]}
        db.seders.update_one(
            filter={'_id': seder_uid},
            update={'$set': updated_fields},
        )


PROJECT_PATH = '/usr/src/app'

def get_image_id(huntDoc):
    """Finds the image_id needed for loading an image from db"""
    return -1

@app.route('/check_location', methods=['GET'])
def checkLocation():
    """User hits this endpoint when they click on a location.

    The result is whether the location is found or not
    Also any additional info needed for the follow up GET
    in the event that they are correct"""

    response = {'Error': "Whoops! We seem to have gotten lost"}
    error_result = (response, status.HTTP_400_BAD_REQUEST)

    # get parameters and sanitize
    huntId = request.form['huntId']
    locationName = request.form['locationName']

    if not huntId or not locationName:
        return error_result

    result = db.hunts.find_one(filter={'_id': huntId})

    # if the hunt doesn't exist or hasn't started return a 400
    if not result or not result['isActive']:
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


@app.route('/')
def todo():

    content = {'please move along': 'nothing to see here'}
    return content, status.HTTP_404_NOT_FOUND

@app.route('/new', methods=['POST'])
def new():

    item_doc = {
        'name': request.form['name'],
        'description': request.form['description']
    }
    db.tododb.insert_one(item_doc)

    return redirect(url_for('todo'))

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=DEBUG)