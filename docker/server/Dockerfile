FROM python:3

WORKDIR /usr/src/app

# updates
RUN apt-get update
RUN apt-get install -y python vim
RUN apt-get install -y python-setuptools python-dev build-essential python-pip

# Yes, do this twice so it get's cached
RUN pip install --upgrade pip

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
