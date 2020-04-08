import json
from os.path import join, isdir
import os

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
    'Paris',
    'Melbourne'
]

def get_json_files(base):
	paths = [p for p in os.listdir(base)]

	# print(base)
	# print(paths)
	result = []
	for p in paths:
		p = join(base, p)
		if len(p) > 5 and p[-5:] == '.json':
			result.append(p)

		elif isdir(p):
			result.extend(get_json_files(p))

	return result

def process():
	json_paths = get_json_files('cities')
	# print(json_paths)
	result = []
	for path in json_paths:
		with open(path, 'r') as fin:
			data = json.load(fin)
		result.append([data['name'], data["latitude"], data["longitude"]])

	allnames = [x[0] for x in result]

	# print(allnames)
	# print(CITIES)
	assert set(allnames) == set(CITIES)

	print(result)

if __name__ == '__main__':
	process()
			
