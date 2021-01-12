require('dotenv').config()
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

const config = {
  prod: {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    db: 0,
    keyPrefix: "",
    tls: {
      host: REDIS_HOST,
    },
  },
  dev: {
    host: REDIS_HOST,
    port: REDIS_PORT
  },
  env: process.env.NODE_ENV
}
module.exports = config