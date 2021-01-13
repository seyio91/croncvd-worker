const pg = require('pg');
const dotenv = require('dotenv');

pg.defaults.ssl = true;

dotenv.config();

const databaseConfig = { connectionString: process.env.DATABASE_URL };
const pool = new pg.Pool(databaseConfig);

module.exports = pool;