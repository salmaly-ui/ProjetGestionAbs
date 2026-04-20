const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const absenceRoutes = require("./routes/absenceRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));


// routes
app.use("/api/auth", authRoutes);
app.use("/api/absences", absenceRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("API OK");
});

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:5000");
});