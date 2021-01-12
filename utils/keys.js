require('dotenv').config()
REDIS_HOST = process.env.REDIS_HOST;
REDIS_PORT = process.env.REDIS_PORT;
REDIS_PASSWORD = process.env.REDIS_PASSWORD;
module.exports = {
    REDIS_HOST,
    REDIS_PORT,
    REDIS_PASSWORD
  };