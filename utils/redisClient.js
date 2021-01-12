const asyncRedis = require("async-redis");
const { REDIS_HOST, REDIS_PORT,REDIS_PASSWORD } = require('./keys')
// const connectionString = { host: REDIS_HOST, port: REDIS_PORT }
const client = asyncRedis.createClient({ host: REDIS_HOST, port: REDIS_PORT, password: REDIS_PASSWORD });

module.exports = client