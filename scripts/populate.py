import requests
from datetime import datetime, timedelta
import random
import json
from dotenv import load_dotenv
import os

load_dotenv()

sportsEvents = [
    {
        "name": "Sport Festival",
        "description": "Some description of a sport festival.",
    },
    {
        "name": "UBC Thunderbirds",
        "description": "Description."
    }
]
sportsTags = json.dumps(["sports"])

gamesEvents = [
    {
        "name": "Super Smash Bros Tournament",
        "description": "Some description of a tournament.",
    },
    {
        "name": "DotA 2 LAN",
        "description": "Dendi's got pos 5 now."
    }
]
gamesTags = json.dumps(["games"])

partyEvents = [

]
partyTags = json.dumps(["party"])


studyEvents = [

]
studyTags = json.dumps(["study"])


allEvents = [
    (sportsEvents, sportsTags),
    (gamesEvents, gamesTags),
    (partyEvents, partyTags),
    (studyEvents, studyTags)
]

startTime = datetime.utcnow()
startTime += timedelta(days=5)
endTime = datetime.utcnow()
endTime += timedelta(days=6, minutes=10)
lat = 49.2606052
lng = -123.2481825


def getDates():
    startTime = datetime.utcnow()
    startTime += timedelta(days=random.randint(4, 20))
    endTime = startTime
    endTime += timedelta(days=random.randint(0, 2), hours=random.randint(1, 5))
    return {toDateString(startTime), toDateString(endTime)}


def toDateString(obj):
    return obj.strftime("%m-%d-%Y %H:%M:%S GMT")


def randomizeLocation():
    newLat = lat + random.random() / 100 * (-1 if round(random.random()) == 1 else 1)
    newLng = lng + random.random() / 100 * (-1 if round(random.random()) == 1 else 1)
    return str(newLat) + "," + str(newLng)


for events, tagList in allEvents:
    for event in events:
        name = event['name']
        description = event['description']
        startTime, endTime = getDates()
        location = randomizeLocation()
        r = requests.post("https://api.evnt.me/events/api",
                          json={"name": name, "description": description, "startTime": startTime,
                                "endTime": endTime, "location": location, "host": os.getenv("USERID"), "tagList": tagList},
                          headers={"accessToken": os.getenv("TOKEN"), "userId": os.getenv("USERID"), "Content-Type": "application/json"})
