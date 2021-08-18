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

// Get all Students
describe("GET /students", () => {
  test("It responsds with an array of students", async () => {
    const response = await request(app).get("/students");
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty("id");
    expect(response.body[0]).toHaveProperty("name");
    expect(response.statusCode).toBe(200);
  });
});

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
