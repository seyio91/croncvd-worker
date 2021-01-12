const asyncRedis = require("async-redis");
const { prod, dev, env } = require('./keys')
let redisConfig = env == 'PROD'? prod : dev;
const client = asyncRedis.createClient(redisConfig);

module.exports = client