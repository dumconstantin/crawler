FROM node:4.7.2

RUN mkdir /app
WORKDIR /app
ADD . /app

RUN npm install

CMD ["node", "server.js"]
