const {
  beforeAll,
  expect,
  it,
  afterAll
} = require("@jest/globals");

const AccountService = require("../../../src/services/Account");
const PhoneVerificationService = require("../../../src/services/PhoneVerification");
const state = {};

jest.mock("../../../src/services/PhoneVerification");

beforeAll(async () => {
  const db = require("../../../src/db");
  state.connection = await db.createConnection();
  await state.connection.dropDatabase();
});

afterAll(async () => {
  await state.connection.close();
});

it("should call #createAccount without errors", async () => {
  const data = {
    email: "test@example.com",
    username: "test",
    password: "password",
    countryCode: "+234",
    phoneNumber: "8012345678",
    phoneNumberVerificationToken: "ac3c29cb9ea9dbf7ea2dfe8278ad1e82"
  };
  PhoneVerificationService.checkVerificationToken.mockResolvedValue(true);
  const result = await AccountService.createAccount(data);
  console.log(result);
});

it("should call #createLoginSession passing email without errors", async () => {
  const data = {
    identifier: "test@example.com",
    password: "password"
  };
  const result = await AccountService.createLoginSession(data);
  console.log(result);
});

it("should call #createLoginSession passing username without errors", async () => {
  const data = {
    identifier: "test",
    password: "password"
  };
  const result = await AccountService.createLoginSession(data);
  console.log(result);
});
