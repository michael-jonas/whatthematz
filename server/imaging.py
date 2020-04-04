from PIL import Image
from os import listdir
from os.path import join, isfile
import random
import time

def getImageDirPath(cityName):
	return join('cities', cityName, 'img')

def getMatzahImage():
	imgPath = join('resources', 'afikomen.png')
	img = Image.open(imgPath)
	W, H = img.size
	scale = 3
	img = img.resize((int(W/scale), int(H/scale)), Image.ANTIALIAS)
	return img

def getRandomImage(cityName):
	dirPath = getImageDirPath(cityName)
	imagePaths = [f for f in listdir(dirPath) if isfile(join(dirPath, f))]
	idx = random.randint(0, len(imagePaths)-1)
	idx = 0
	path = join(dirPath, imagePaths[idx])
	return Image.open(path)

def randomHide(cityImg, matzahImg):
	W, H = cityImg.size
	w, h = matzahImg.size
	x = random.randint(0, W-w)
	y = random.randint(0, H-h)
	cityImg.paste(matzahImg, (x, y), matzahImg)

if __name__ == '__main__':
	# run a little test
	torontoImg = getRandomImage('toronto')
	matzahImg = getMatzahImage()
	randomHide(torontoImg, matzahImg)
	torontoImg.show()
	time.sleep(5)


