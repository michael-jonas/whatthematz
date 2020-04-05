from geopy.geocoders import Nominatim
import json
import os
from collections import OrderedDict

geolocator = Nominatim(user_agent="test")


cities = [
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

def generate_city_json():
	for city in cities:
		city_json = OrderedDict([
			("name", city),
			("country", ''),
			("easyHints", []),
			("mediumHints", []),
			("hardHints", []),
			("latitude", geolocator.geocode(city).latitude),
			("longitude", geolocator.geocode(city).longitude)
		])
		if not os.path.exists(city):
			os.makedirs(city)
			os.makedirs(city+'/img')

		with open(city+'/' + city + '.json', 'w') as file:
			json.dump(city_json, file, indent=4)

if __name__ == '__main__':
	generate_city_json()
