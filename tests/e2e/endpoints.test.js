const {
  beforeAll,
  describe,
  expect,
  it,
  afterAll
} = require("@jest/globals");

const {
  addEndpoint,
  renderDocumentation
} = require("../documentation");

const db = require("../../src/db");
const app = require("../../src/app");
const request = require("supertest");
const _ = require("lodash");

const state = {
  sessions: []
};

/*
* Mocks
* */
const random = require("lodash/random");
// eslint-disable-next-line no-undef
jest.mock("lodash/random");
random.mockReturnValue(1234);

beforeAll(async () => {
  state.connection = await db.createConnection();
  await state.connection.dropDatabase();
  await new Promise(resolve => setTimeout(resolve, 5000));
});

afterAll(async () => {
  await state.connection.close();
  renderDocumentation();
  await new Promise(resolve => setTimeout(resolve, 5000));
});


describe("account registration", () => {
  // eslint-disable-next-line no-undef
  jest.setTimeout(30000);

  const data = [
    {
      countryCode: "NG",
      phoneNumber: "+2348012345678",
      email: "test1@example.com",
      username: "test1",
      password: "password",
    },
    {
      countryCode: "NG",
      phoneNumber: "+2348023456789",
      email: "test2@example.com",
      username: "test2",
      password: "password",
    },
  ];
  data.forEach((data, index) => {
    it("/verification/phone/send" + " - " + index, async () => {
      const res = await request(app)
        .post("/verification/phone/send")
        .send({
          ...(_.pick(data, ["countryCode", "phoneNumber"]))
        });
      try {
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe("success");
        addEndpoint(res);
      } catch (err) {
        err.message = `${err.message}\n\nResponse: ${JSON.stringify(res.body, undefined, 2)}`;
        throw err;
      }
    });

    it("/verification/phone/check" + " - " + index, async () => {
      const res = await request(app)
        .post("/verification/phone/check")
        .send({
          ...(_.pick(data, ["countryCode", "phoneNumber"])),
          verificationCode: "1234"
        });
      try {
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe("success");
        state.sessions[index] = {};
        state.sessions[index].verificationToken = res.body.data.verificationToken;
        addEndpoint(res);
      } catch (err) {
        err.message = `${err.message}\n\nResponse: ${JSON.stringify(res.body, undefined, 2)}`;
        throw err;
      }
    });

    it("/auth/register" + " - " + index, async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({
          ...data,
          phoneNumberVerificationToken: state.sessions[index].verificationToken
        });
      try {
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe("success");
        addEndpoint(res);
      } catch (err) {
        err.message = `${err.message}\n\nResponse: ${JSON.stringify(res.body, undefined, 2)}`;
        throw err;
      }
    });

    it("/auth/login - with username" + " - " + index, async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({
          identifier: data.username,
          password: data.password
        });
      try {
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe("success");
        addEndpoint(res);
      } catch (err) {
        err.message = `${err.message}\n\nResponse: ${JSON.stringify(res.body, undefined, 2)}`;
        throw err;
      }
    });

    it("/auth/login - with phone number" + " - " + index, async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({
          identifier: data.phoneNumber,
          password: data.password
        });
      try {
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe("success");
        state.sessions[index].account = res.body.data.account;
        state.sessions[index].token = res.body.data.token;
        addEndpoint(res);
      } catch (err) {
        err.message = `${err.message}\n\nResponse: ${JSON.stringify(res.body, undefined, 2)}`;
        throw err;
      }
    });
  });
});


describe("followings and followers", () => {
  // eslint-disable-next-line no-undef
  jest.setTimeout(30000);

  it("/accounts/follow", async () => {
    const res = await request(app)
      .post("/accounts/follow")
      .set("x-api-token", state.sessions[0].token)
      .send({
        accountId: state.sessions[1].account._id
      });
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res);
    } catch (err) {
      err.message = `${err.message}\n\nResponse: ${JSON.stringify(res.body, undefined, 2)}`;
      throw err;
    }
  });

  it("/accounts/follow", async () => {
    const res = await request(app)
      .post("/accounts/follow")
      .set("x-api-token", state.sessions[1].token)
      .send({
        accountId: state.sessions[0].account._id
      });
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res);
    } catch (err) {
      err.message = `${err.message}\n\nResponse: ${JSON.stringify(res.body, undefined, 2)}`;
      throw err;
    }
  });

  it("/accounts/followers", async () => {
    const res = await request(app)
      .get("/accounts/followers")
      .set("x-api-token", state.sessions[1].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res);
      console.log(res.body)
    } catch (err) {
      err.message = `${err.message}\n\nResponse: ${JSON.stringify(res.body, undefined, 2)}`;
      throw err;
    }
  });

  it("/accounts/followings", async () => {
    const res = await request(app)
      .get("/accounts/followings")
      .set("x-api-token", state.sessions[0].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res);
      console.log(res.body)
    } catch (err) {
      err.message = `${err.message}\n\nResponse: ${JSON.stringify(res.body, undefined, 2)}`;
      throw err;
    }
  });

  it("/accounts/unfollow", async () => {
    const res = await request(app)
      .post("/accounts/unfollow")
      .set("x-api-token", state.sessions[0].token)
      .send({
        accountId: state.sessions[1].account._id
      });
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res);
    } catch (err) {
      err.message = `${err.message}\n\nResponse: ${JSON.stringify(res.body, undefined, 2)}`;
      throw err;
    }
  });
});