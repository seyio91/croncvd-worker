FROM node:13-alpine

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

USER node

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY . .

CMD npm run start
