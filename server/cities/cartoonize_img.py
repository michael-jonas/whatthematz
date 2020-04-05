#step 1
#Use bilateral filter for edge-aware smoothing.
import cv2
import random
from PIL import Image



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
	    img_color = cv2.bilateralFilter(img_color, 3, 150, 150)

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
	img_edge = cv2.adaptiveThreshold(img_blur, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 9, 2)

	# -- STEP 5 --
	# convert back to color so that it can be bit-ANDed
	# with color image
	img_edge = cv2.cvtColor(img_edge, cv2.COLOR_GRAY2RGB)
	new_img = cv2.bitwise_and(img_rgb, img_edge)
	return new_img


if __name__ == '__main__':

	city = cv2.imread("Toronto/img/nathan_phillip.jpg", cv2.IMREAD_UNCHANGED)
	matza = cv2.imread("../resources/afikomen.png", cv2.IMREAD_UNCHANGED)
	# city = cartoonify(city)
	# cv2.imwrite("Toronto/img/new_city.jpg", city)
	# matza = cartoonify(matza)
	# cv2.imwrite("Toronto/img/new_matza.jpg", matza)

	# Matza resizing 
	scale_percent = 10 # percent of original size
	width = int(matza.shape[1] * scale_percent / 100)
	height = int(matza.shape[0] * scale_percent / 100)
	dim = (width, height)
	matza = cv2.resize(matza, dim, interpolation = cv2.INTER_AREA)

	# Matza remove background
	# tmp = cv2.cvtColor(matza, cv2.COLOR_BGR2GRAY)
	# _,alpha = cv2.threshold(tmp,0,255,cv2.THRESH_BINARY)
	# b, g, r = cv2.split(matza)
	# rgba = [b,g,r, alpha]
	# matza = cv2.merge(rgba,4)

	
	max_x_offset = city.shape[1]
	max_y_offset = city.shape[0]
	min_y_offset = min_x_offset = 0
	x_offset = random.randint(min_x_offset, max_x_offset)
	y_offset = random.randint(min_y_offset, max_y_offset)

	y1, y2 = y_offset, y_offset + matza.shape[0]
	x1, x2 = x_offset, x_offset + matza.shape[1]

	# Fancy channel stuff
	if(matza.shape[2] == 4):

		alpha_s = matza[:, :, 3] / 255.0
		alpha_l = 1.0 - alpha_s

		for c in range(0, 3):
		    city[y1:y2, x1:x2, c] = (alpha_s * matza[:, :, c] +
		                              alpha_l * city[y1:y2, x1:x2, c])
	else:
	# This doesnt do fancy channel stuff, adds city and matza
		city[y_offset:y_offset+matza.shape[0], x_offset:x_offset+matza.shape[1]] = matza

	cv2.imshow("Toronto/img/cartoon.jpg", cartoonify(city))
	cv2.waitKey()