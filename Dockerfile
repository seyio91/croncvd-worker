FROM node:13-alpine

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

USER node

ENV REDIS_HOST=$REDIS_HOST
ENV REDIS_PORT=6379

WORKDIR /home/node/app

COPY package*.json ./

RUN npm install

COPY . .
RUN rm Dockerfile README.md

CMD npm run start
