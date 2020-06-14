const {
  beforeAll,
  expect,
  it,
  afterAll
} = require("@jest/globals");

const db = require("../../src/db");
const app = require("../../src/app");
const request = require("supertest");

const state = {};

beforeAll(async () => {
  state.connection = await db.createConnection();
  await state.connection.dropDatabase();
});

afterAll(async () => {
  await state.connection.close();
});


describe("account registration", () => {
  const data = {

  };

  it("", async () => {
    const res = await request(app)
      .post("/verification/phone/send")
      .send(credentials);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
    } catch (err) {
      err.message = `${err.message}\n\nResponse: ${JSON.stringify(res.body, undefined, 2)}`;
      throw err;
    }
  });
});
