process.env.NODE_ENV = "test";
const db = require("../db");
const request = require("supertest");
const app = require("../app");

// POST /users/auth - returns a JWT when a successful username and password are sent
// GET /users/ - returns all of the users, requires a valid JWT
// GET /users/secure/:id - returns a simple messages, requires a valid JWT and the id in the URL has to match the id stored in the JWT

// for decoding the token and easily extracting the id from the payload
const jsonwebtoken = require("jsonwebtoken");
// for hashing the password successfully when we create users
const bcrypt = require("bcrypt");

// our global object for storing auth information
let auth = {};

// before everything - create the table
beforeAll(async () => {
  await db.query(
    "CREATE TABLE users (id SERIAL PRIMARY KEY, username TEXT, password TEXT)"
  );
});

// before each request, create a user and log them in
beforeEach(async () => {
  const hashedPassword = await bcrypt.hash("secret", 1);
  await db.query("INSERT INTO users (username, password) VALUES ('test', $1)", [
    hashedPassword,
  ]);
  const response = await request(app)
    .post("/users/auth")
    .send({ username: "test", password: "secret" });

  // take the result of the POST /users/auth which is a JWT
  // store it in the auth object
  auth.token = response.body.token;
  // store the id from the token in the auth object
  auth.current_user_id = jsonwebtoken.decode(auth.token).user_id;
});

// remove all the users
afterEach(async () => {
  await db.query("DELETE FROM users");
});

// drop the table and close the connection
afterAll(async () => {
  await db.query("DROP TABLE users");
  db.end();
});

describe("GET /users", () => {
  test("returns a list of users", async () => {
    const response = await request(app)
      .get("/users")
      // add an authorization header with the token
      .set("authorization", auth.token);
    expect(response.body.length).toBe(1);
    expect(response.statusCode).toBe(200);
  });
});

describe("GET /users without auth", () => {
  test("requires login", async () => {
    // don't add an authorization header with the token...see what happens!
    const response = await request(app).get("/users/");
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("unauthorized");
  });
});

describe("GET /secure/:id", () => {
  test("authorizes only correct users", async () => {
    const response = await request(app)
      // add an authorization header with the token, but go to a different id than the stored in the token
      .get(`/users/secure/100`)
      .set("authorization", auth.token);
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("unauthorized");
  });
});

describe("GET /secure/:id", () => {
  test("authorizes only correct users", async () => {
    const response = await request(app)
      // add an authorization header with the token, and go to the same ID as the one stored in the token
      .get(`/users/secure/${auth.current_user_id}`)
      .set("authorization", auth.token);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("You made it!");
  });
});
