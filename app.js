const express = require("express");

const app = express();

// Midleware's
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const students = ["Elie", "Matt", "Joel", "Michael"];

app.get("/", (req, res) => {
  return res.status(200).json(students);
});

// Routes
const studentsRoute = require("./routes/students");

app.use("/students", studentsRoute);

module.exports = app;
