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
        'creationTime': creationTime or datetime.now()
    }

def HuntData(
    sederId, isActive=False, participants=None,
    city=None, matzahXY=None, winner=-1, finders=None,
    creationTime=None):

    return {
        'sederId': sederId
        'isActive': isActive,
        'participants': participants or [],
        'city': city or '',
        'matzahXY': matzahXY or (0,0),
        'winner': winner
        'finders': finders or []
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
        db.seders.update_one(
            filter={'_id': seder_uid},
            huntIds=[huntResult.inserted_id],
        )

PROJECT_PATH = '/usr/src/app'

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