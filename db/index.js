const config = require('../config');
const { Pool } = require("pg");
const pool = new Pool({
    user: config.DBUsername,
    host: config.DBHost,
    database: config.DBDatabase,
    password: config.DBPassword,
    port: config.DBPort
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
  }