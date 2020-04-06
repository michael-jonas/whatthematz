
import os
from os.path import join, isfile, isdir
import shutil

def sanitize(s):
	return s.lower().replace(' ', '-')

def rename_under_dir(base):
	paths = [p for p in os.listdir(base)]

	for p in paths:
		path = join(base, p)
		if isdir(path):
			rename_under_dir(path)
		shutil.move(path, sanitize(path))

rename_under_dir('cities')

# dirpaths = [p for p in os.listdir('cities') if '.' not in p]
# print(dirpaths)

# for dirpath in dirpaths:
# 	paths = os.listdir(join('cities', dirpath))
# 	for p in paths:
# 		oldpath = join('cities', dirpath, p)
# 		newpath = oldpath.lower().replace('-', '_')
# 		os.rename(oldpath, newpath)
