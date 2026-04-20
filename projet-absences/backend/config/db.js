const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "absences_db"
});

db.connect(err => {
  if (err) {
    console.log("  DB error:", err);
  } else {
    console.log("  MySQL connecté");
  }
});

module.exports = db;