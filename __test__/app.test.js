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
