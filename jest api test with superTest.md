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
const database = process.env.NODE_ENV === "test" ? "studentstest" : "students";

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "secret",
  database: database,
  port: 8081,
});

module.exports = pool;
```

## Testing app.js

Created `__test__` folder in root directory and `app.test.js` file inside `__test__` folder

```js
const request = require("supertest");
const app = require("../app");

// First Test on GET /
describe("GET /", () => {
  test("It should respond with an array of students", async () => {
    const response = await request(app).get("/");
    expect(response.body).toEqual(["Elie", "Matt", "Joel", "Michael"]);
    expect(response.statusCode).toEqual(200);
  });
});
```

## Creating Routes for database

creating `routes` folder for all routes

```js
// Inside routes/student.js

const router = require("express").Router();
const db = require("../db");

router.get("/", async (req, res) => {
  const data = await db.query("SELECT * FROM students");
  return res.json(data.rows);
});

router.post("/", async (req, res) => {
  const data = await db.query(
    "INSERT INTO students (name) VALUES ($1) RETURNING *",
    [req.body.name]
  );
  return res.json(data.rows[0]);
});

router.patch("/:id", async (req, res) => {
  const data = await db.query(
    "UPDATE students SET name=$1 WHERE id=$2 RETURNING *",
    [req.body.name, req.params.id]
  );
  return res.json(data.rows[0]);
});

router.delete("/:id", async (req, res) => {
  const data = await db.query("DELETE FROM students WHERE id=$1", [
    req.params.id,
  ]);
  return res.json({ message: "Deleted" });
});

module.exports = router;
```

Now connecting router with app.js file

```js
// Inside app.js file
// Routes
const studentsRoute = require("./routes/students");
app.use("/students", studentsRoute);
```

## Testing with database

now testing routes with database

Creating `__test__/student.test.js` file

```js
// Inside __test__/student.test.js file
process.env.NODE_ENV = "test";
const db = require("../db");
const request = require("supertest");
const app = require("../app");

// beforeAll - called once before all tests.
// beforeEach - called before each of these test
// afterEach - called after each of these test
// afterAll - called once after all tests.

beforeAll(async () => {
  await db.query("CREATE TABLE students (id SERIAL PRIMARY KEY, name TEXT)");
});

beforeEach(async () => {
  // seed with some data
  await db.query("INSERT INTO students (name) VALUES ('Elie'), ('Matt')");
});

afterEach(async () => {
  await db.query("DELETE FROM students");
});

afterAll(async () => {
  await db.query("DROP TABLE students");
  db.end();
});

// Tests
describe("GET /students", () => {
  test("It responsds with an array of students", async () => {
    const response = await request(app).get("/students");
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty("id");
    expect(response.body[0]).toHaveProperty("name");
    expect(response.statusCode).toBe(200);
  });
});
```

## Testing all Student routes

```js
// Inside __test__/students.test.js file

// Add New Student
describe("POST /students", () => {
  test("It responds with the newly created student", async () => {
    const newStudent = await request(app)
      .post("/students")
      .send({ name: "New Student" });

    // Make sure we add it correctly
    expect(newStudent.body).toHaveProperty("id");
    expect(newStudent.body.name).toBe("New Student");
    expect(newStudent.statusCode).toBe(200);

    // Make sure we have 3 students
    const response = await request(app).get("/students");
    expect(response.body.length).toBe(3);
  });
});

// Update Student
describe("PATCH /students/1", () => {
  test("It responds with an updated student", async () => {
    const newStudent = await request(app)
      .post("/students")
      .send({ name: "Another one" });

    const updateStudent = await request(app)
      .patch(`/students/${newStudent.body.id}`)
      .send({ name: "updated" });

    expect(updateStudent.body.name).toBe("updated");
    expect(updateStudent.body).toHaveProperty("id");
    expect(updateStudent.statusCode).toBe(200);

    // Make sure we have 3 students
    const response = await request(app).get("/students");
    expect(response.body.length).toBe(3);
  });
});

// Delete Student
describe("DELETE /students/1", () => {
  test("It responds with a message of Deleted", async () => {
    const newStudent = await request(app)
      .post("/students")
      .send({ name: "Another one" });

    const removedStudent = await request(app).delete(
      `/students/${newStudent.body.id}`
    );
    expect(removedStudent.body).toEqual({ message: "Deleted" });
    expect(removedStudent.statusCode).toBe(200);

    // Make sure we still have 2 students
    const reponse = await request(app).get("/students");
    expect(reponse.body.length).toBe(2);
  });
});
```
