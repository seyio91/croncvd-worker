require('dotenv').config()
REDIS_HOST = process.env.REDIS_HOST;
REDIS_PORT = process.env.REDIS_PORT;
module.exports = {
    REDIS_HOST,
    REDIS_PORT
  };