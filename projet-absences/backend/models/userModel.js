const db = require("../config/db");

exports.getAll = (cb) => {
  db.query("SELECT * FROM users", cb);
};