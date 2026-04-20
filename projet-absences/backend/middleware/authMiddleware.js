const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "SECRET123";

const verifyToken = (req, res, next) => {
  const header = req.headers["authorization"];
  const token  = header && header.split(" ")[1]; // "Bearer <token>"

  if (!token)
    return res.status(401).json({ message: "Token manquant" });

  try {
    req.user = jwt.verify(token, SECRET_KEY);
    next();
  } catch {
    return res.status(403).json({ message: "Token invalide ou expiré" });
  }
};

module.exports = { verifyToken };