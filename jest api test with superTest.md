# Testing with Jest and Supertest

## Initial Work

```bash
mkdir jestTest
cd jestTest
npm init -y
```

### Create Express Server

```bash
npm install express
```

Creating `app.js` file

```js
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());

const students = ["Elie", "Matt", "Joel", "Michael"];

app.get("/", (req, res) => {
  return res.json(students);
});

module.exports = app;
```

Creating `server.js` file for starting server

```js
const app = require("./app");

app.listen(3000, () => console.log("server starting on port 3000"));
```

### Creating Database (PostgreSQL)

```bash
npm install pg
```

Creating `db.js` file for database pool

```js
const Pool = require("pg").Pool;

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "secret",
  database: "demotest1",
  port: 8081,
});

module.exports = pool;
```
