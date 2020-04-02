import os
from flask import Flask, redirect, url_for, request, render_template
from pymongo import MongoClient

app = Flask(__name__)

# I think this is the default port for mongodb
client = MongoClient(os.environ['DB_PORT_27017_TCP_ADDR'], 27017)
db = client.tododb

PROJECT_PATH = '/usr/src/app'

@app.route('/')
def todo():

    _items = db.tododb.find()
    items = [item for item in _items]

    print('hitting here.')
    template_path = os.path.join(PROJECT_PATH, 'templates/todo.html')
    # template_path = 'templates/todo.html'
    print(template_path)

    try:
        with open(template_path, 'r') as fin:
            print('success')
            print(fin.readlines())
    except Exception as exc:
        print('failure', exc)

    return render_template('todo.html', items=items)


@app.route('/new', methods=['POST'])
def new():

    item_doc = {
        'name': request.form['name'],
        'description': request.form['description']
    }
    db.tododb.insert_one(item_doc)

    return redirect(url_for('todo'))

if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True)