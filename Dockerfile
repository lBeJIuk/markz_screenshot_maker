FROM node:buster-slim

RUN apt-get update -y && apt-get install -y \
  libx11-6 \
  libx11-xcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxi6 \
  libxtst6 \
  libgtk-3-0 \
  libnss3 \
  libxss1 \
  libasound2

#  libpangocairo-1.0-0 \
#  libcups2 \
#  libxrandr2 \
#  libgconf-2-4 \
#  libatk1.0-0 \
#  gconf-service \
#  libappindicator1 \
#  libc6 \
#  libcairo2 \
#  libcups2 \
#  libdbus-1-3 \
#  libexpat1 \
#  libfontconfig1 \
#  libgcc1 \
#  libgdk-pixbuf2.0-0 \
#  libglib2.0-0 \
#  libnspr4 \
#  libpango-1.0-0 \
#  libstdc++6 \
#  libxcb1 \
#  libxfixes3 \
#  libxrender1 \

RUN rm -rf /var/lib/apt/lists/*

WORKDIR /screenmaker
COPY . .

ENTRYPOINT npm i && node /screenmaker/index.js
