const mysql =  require("mysql2");
const { host, user, password, database, port } = require( "../config.js");

const pool = mysql.createPool({
    host: host,
    user: user,
    password: password,
    database: database,
    port: port
});

module.exports = pool;