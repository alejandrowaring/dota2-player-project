import os
from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)
import pymongo
import json
from bson.json_util import ObjectId

# Setup Flask
app = Flask(__name__)
# #create connection variable
conn = 'mongodb://localhost:27017'
client = pymongo.MongoClient(conn)
db = client.dota_db

#Clear the collections
db.heroes.drop()
#db.items.drop()

#Read the hero json file
hero_json_file = os.path.join(".","data","heroes.json")
with open(hero_json_file) as json_file:
    data = json.load(json_file)
    for i in range(len(data)):
        currDict = data[i]
        currDict["img"] = "./static/images/heroes/" + str(currDict["id"])
        db.heroes.insert_one(currDict)


class MyEncoder(json.JSONEncoder):

    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super(MyEncoder, self).default(obj)


app.json_encoder = MyEncoder



#create route that renders the index.html
@app.route("/")
def home():
    return render_template("index.html")


#Route to request heros data
@app.route("/api/heroes")
def heroes():
    hero_data = list(db.heroes.find())
    return jsonify(hero_data)

# @app.route("/api/items")
# def items():
#     item_data = ""
#     return jsonify(item_data)

if __name__ == "__main__":
    app.run(debug=True)