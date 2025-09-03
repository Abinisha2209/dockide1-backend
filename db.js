// db.js
const mysql = require("mysql2/promise");
require("dotenv").config();
const pool = mysql.createPool({
  host: "localhost",       // 👈 fix here
  user: "root",
  password: "MySQL",
  database: "dockide",
});


module.exports = pool;
