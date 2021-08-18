const Pool = require("pg").Pool;

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "secret",
  database: "demotest1",
  port: 8081,
});

module.exports = pool;
