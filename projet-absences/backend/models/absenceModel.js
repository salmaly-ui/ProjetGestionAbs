const db = require("../config/db");

// GET ALL
exports.getAll = (callback) => {
  db.query(
    `SELECT ma.*, u.nom 
     FROM medical_absences ma
     JOIN users u ON ma.student_id = u.id
     ORDER BY ma.created_at DESC`,
    callback
  );
};

// UPDATE STATUS
exports.updateStatus = (id, status, comment, callback) => {
  db.query(
    "UPDATE medical_absences SET status=?, agent_comment=? WHERE id=?",
    [status, comment, id],
    callback
  );
};