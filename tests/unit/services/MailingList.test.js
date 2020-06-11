const {
  beforeAll,
  expect,
  it,
  afterAll
} = require("@jest/globals");

const MailingListService = require("../../../src/services/MailingList");
const state = {};

beforeAll(async () => {
  const db = require("../../../src/db");
  state.connection = await db.createConnection();
  await state.connection.dropDatabase();
});

afterAll(async () => {
  await state.connection.close();
});

it("should call #addEmailToMailingList without errors", async () => {
  const data = {
    email: "test@example.com",
  };
  const result = await MailingListService.addEmailToMailingList(data);
  console.log(result);
});
