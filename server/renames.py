
import os
from os.path import join, isfile, isdir

dirpaths = [p for p in os.listdir('cities') if '.' not in p]
print(dirpaths)

for dirpath in dirpaths:
	paths = os.listdir(join('cities', dirpath))
	for p in paths:
		oldpath = join('cities', dirpath, p)
		newpath = oldpath.lower().replace('-', '_')
		os.rename(oldpath, newpath)
