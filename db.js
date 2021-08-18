const Pool = require("pg").Pool;
const database = process.env.NODE_ENV === "test" ? "studentstest" : "students";

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "secret",
  database: database,
  port: 8081,
});

module.exports = pool;
