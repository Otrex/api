const {
  beforeAll,
  expect,
  it,
  afterAll
} = require("@jest/globals");

const PhoneVerificationService = require("../../../src/services/PhoneVerification");
const state = {};

beforeAll(async () => {
  const db = require("../../../src/db");
  state.connection = await db.createConnection();
  await state.connection.dropDatabase();
});

afterAll(async () => {
  await state.connection.close();
});

it("should call #sendVerificationCode without errors", async () => {
  const data = {
    countryCode: "+234",
    phoneNumber: "8012345678",
  };
  const result = await PhoneVerificationService.sendVerificationCode(data);
  console.log(result);
});
