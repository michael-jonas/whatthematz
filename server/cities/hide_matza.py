import cv2
import random
from PIL import Image
import numpy as np
import csv



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
'Paris',
'Melbourne'
]

def cartoonify(img, numDownSamples=0, numBilateralFilters=1, skip=True):

	# -- STEP 1 --
	# downsample image using Gaussian pyramid
	img_rgb = img
	img_color = img
	for _ in range(numDownSamples):
	    img_color = cv2.pyrDown(img_color)

	# repeatedly apply small bilateral filter instead of applying
	# one large filter
	for _ in range(numBilateralFilters):
	    img_color = cv2.bilateralFilter(img_color, 1, 1, 1)

	# upsample image to original size
	for _ in range(numDownSamples):
	    img_color = cv2.pyrUp(img_color)

	# -- STEPS 2 and 3 --
	# convert to grayscale and apply median blur
	if (skip is False):
		return img_color
	img_gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
	img_blur = cv2.medianBlur(img_gray, 3)

	# -- STEP 4 --
	# detect and enhance edges
	img_edge = cv2.adaptiveThreshold(img_blur, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 3, 2)

	# -- STEP 5 --
	# convert back to color so that it can be bit-ANDed
	# with color image
	img_edge = cv2.cvtColor(img_edge, cv2.COLOR_GRAY2RGB)
	new_img = cv2.bitwise_and(img_rgb, img_edge)
	return new_img


# mouse callback function
def draw_circle(event,x,y,flags,param):
    global ix,iy
    if event == cv2.EVENT_LBUTTONDBLCLK:
        cv2.circle(img,(x,y),50,(255,0,0),-1)
        ix,iy = x,y

ix,iy = -1,-1


# a window and bind the function to window
# cv2.namedWindow('city')
# cv2.setMouseCallback('city', draw_circle)

# while(1):
# for city in cities:

# 	city = city.lower().replace(" ", "_")
# 	print(city)
# 	img = cv2.imread(city + "/img/" + city + ".jpg", cv2.IMREAD_UNCHANGED)
# 	for i in range(1,5):
# 		cv2.imshow('city', img)
# 		k = cv2.waitKey() & 0xFF
# 		if k == 27:
# 			break
# 		elif k == ord('a'):
# 			print (ix,iy)
# 			with open(city + "/img/" + "matza_xy.txt", 'w') as file:
# 				csv.writer(file, delimiter=',').writerow((ix, iy))
# cv2.destroyAllWindows()


matza = cv2.imread("../resources/afikomen.png", cv2.IMREAD_UNCHANGED)
scale_percent = 12 # percent of original size
matza_width = int(matza.shape[1] * scale_percent / 100)
matza_height = int(matza.shape[0] * scale_percent / 100)
dim = (matza_width, matza_height)
matza = cv2.resize(matza, dim, interpolation = cv2.INTER_AREA)

for city in cities:
	city = city.lower().replace(" ", "_")
	

	with open(city + "/img/matza_xy.txt", 'w', newline='') as file:
		

		x_offset_prev = 0
		y_offset_prev = 0
		for i in range(0,5):
			city_img = cv2.imread(city + "/img/" + city + ".jpg", cv2.IMREAD_UNCHANGED)
			city_img = cartoonify(city_img)
			city_width = int(city_img.shape[1])
			city_height = int(city_img.shape[0])

			max_y_pos = city_height - matza_height
			min_y_pos = matza_height
			max_x_pos = city_width - matza_width
			min_x_pos = matza_width

			new_x_threshold = city_width/5
			new_y_threshold = city_width/10
			# coords = file.readline().split(',')
			# print(city)
			# x_offset = int(coords[0])
			# y_offset = int(coords[1])	

			# Set coordinates of matza
			print(city)
			while( True ):
				y_offset = random.randint(min_y_pos, max_y_pos)
				x_offset = random.randint(min_x_pos, max_x_pos)
				if (abs(y_offset-y_offset_prev) > new_y_threshold) and (abs(y_offset-y_offset_prev) > new_y_threshold):
					break
			y1, y2 = y_offset, y_offset + matza.shape[0]
			x1, x2 = x_offset, x_offset + matza.shape[1]

			alpha_s = matza[:, :, 3] / 255.0
			alpha_l = 1.0 - alpha_s

			for c in range(0, 3):
			    city_img[y1:y2, x1:x2, c] = (alpha_s * matza[:, :, c] +
			                              alpha_l * city_img[y1:y2, x1:x2, c])

			# city_img = cartoonify(city_img)
			# cv2.imshow("image", city_img)
			# cv2.waitKey()

			csv.writer(file, delimiter=',').writerow((x_offset, y_offset))
			x_offset_prev = x_offset
			y_offset_prev = y_offset
			# city_img = cartoonify(city_img)

			cv2.imwrite(city + "/img/" + city + "_hidden" + str(i) + ".jpg", city_img)