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





	if __name__ == '__main__':