/* eslint-disable */
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

const utils = require("../../src/utils");
const db = require("../../src/db");
const app = require("../../src/app");
const request = require("supertest");
const _ = require("lodash");

const errorWithResponse = (err, res) => errorWithResponse(err, res);
;

/*
* Mocks
* */
const random = require("lodash/random");

jest.mock("lodash/random");
random.mockReturnValue(1234);

beforeAll(async () => {
  state.connection = await db.createConnection();
  for (const model in db.models) {
    // eslint-disable-next-line no-prototype-builtins
    if (db.models.hasOwnProperty(model)) {
      await db.models[model].deleteMany({});
    }
  }
  await new Promise(resolve => setTimeout(resolve, 5000));
});

afterAll(async () => {
  await state.connection.close();
  renderDocumentation();
  await new Promise(resolve => setTimeout(resolve, 5000));
});

const state = {
  sessions: []
};

const users = [
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
  {
    countryCode: "NG",
    phoneNumber: "+2348023456710",
    email: "test3@example.com",
    username: "test3",
    password: "password",
  },
];

describe("verification", () => {

  jest.setTimeout(30000);

  it("/verification/phone/send", async () => {
    const responses = await Promise.all(users.map(data => {
      return request(app)
        .post("/verification/phone/send")
        .send({
          ...(_.pick(data, ["countryCode", "phoneNumber"]))
        });
    }));
    for (const res of responses) {
      try {
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe("success");
        addEndpoint(res, {
          tags: ["verification"]
        });
      } catch (err) {
        err.message = errorWithResponse(err, res);
        throw err;
      }
    }
  });

  it("/verification/phone/check", async () => {
    const responses = await Promise.all(users.map(data => {
      return request(app)
        .post("/verification/phone/check")
        .send({
          ...(_.pick(data, ["countryCode", "phoneNumber"])),
          verificationCode: "1234"
        });
    }));

    for (const [index, res] of responses.entries()) {
      try {
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe("success");
        state.sessions[index] = {};
        state.sessions[index].verificationToken = res.body.data.verificationToken;
        addEndpoint(res, {
          tags: ["verification"]
        });
      } catch (err) {
        err.message = errorWithResponse(err, res);
        throw err;
      }
    }
  });
});

describe("auth", () => {

  jest.setTimeout(30000);

  it("/auth/register", async () => {
    const responses = await Promise.all(users.map((data, index) => {
      return request(app)
        .post("/auth/register")
        .send({
          ...data,
          phoneNumberVerificationToken: state.sessions[index].verificationToken
        });
    }));
    for (const [index, res] of responses.entries()) {
      try {
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe("success");
        addEndpoint(res, {
          tags: ["auth"]
        });
      } catch (err) {
        err.message = errorWithResponse(err, res);
        throw err;
      }
    }
  });

  it("/auth/login - with username", async () => {
    const responses = await Promise.all(users.map((data, index) => {
      return request(app)
        .post("/auth/login")
        .send({
          identifier: data.username,
          password: data.password
        });
    }));
    for (const [index, res] of responses.entries()) {
      try {
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe("success");
        addEndpoint(res, {
          tags: ["auth"]
        });
      } catch (err) {
        err.message = errorWithResponse(err, res);
        throw err;
      }
    }
  });

  it("/auth/login - with phone number", async () => {
    const responses = await Promise.all(users.map((data, index) => {
      return request(app)
        .post("/auth/login")
        .send({
          identifier: data.phoneNumber,
          password: data.password
        });
    }));
    for (const [index, res] of responses.entries()) {
      try {
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe("success");
        state.sessions[index].account = res.body.data.account;
        state.sessions[index].token = res.body.data.token;
        addEndpoint(res, {
          tags: ["auth"]
        });
      } catch (err) {
        err.message = errorWithResponse(err, res);
        throw err;
      }
    }
  });

  it("/auth/reset-password/initiate", async () => {
    const responses = await Promise.all(users.map((data, index) => {
      return request(app)
        .post("/auth/reset-password/initiate")
        .send({
          email: data.email
        });
    }));
    for (const [index, res] of responses.entries()) {
      try {
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe("success");
        addEndpoint(res, {
          tags: ["auth"]
        });
      } catch (err) {
        err.message = errorWithResponse(err, res);
        throw err;
      }
    }

  });
});

describe("accounts", () => {

  jest.setTimeout(30000);

  it("/accounts/{username}/profile", async () => {
    const responses = await Promise.all(users.map((data, index) => {
      return request(app)
        .get(`/accounts/${data.username}/profile`)
        .set("x-api-token", state.sessions[index].token);
    }));
    for (const [index, res] of responses.entries()) {
      try {
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe("success");
        addEndpoint(res, {
          tags: ["accounts"],
          pathParameters: [
            {
              name: "username",
              description: "username of the account",
              index: 1
            }
          ]
        });
      } catch (err) {
        err.message = errorWithResponse(err, res);
        throw err;
      }
    }
  });

  it("/accounts/profile", async () => {
    const responses = await Promise.all(users.map((data, index) => {
      return request(app)
        .get("/accounts/profile")
        .set("x-api-token", state.sessions[index].token);
    }));
    for (const [index, res] of responses.entries()) {
      try {
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe("success");
        addEndpoint(res, {
          tags: ["accounts"],
          pathParameters: []
        });
      } catch (err) {
        err.message = errorWithResponse(err, res);
        throw err;
      }
    }
  });

  it("/accounts/profile/update", async () => {
    const responses = await Promise.all(users.map((data, index) => {
      return request(app)
        .post("/accounts/profile/update")
        .set("x-api-token", state.sessions[index].token)
        .send({
          profileImage: utils.generateRandomCode(16) + ".png",
          location: "Choba, Port Harcourt"
        });
    }));
    for (const [index, res] of responses.entries()) {
      try {
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe("success");
        addEndpoint(res, {
          tags: ["accounts"],
          pathParameters: []
        });
      } catch (err) {
        err.message = errorWithResponse(err, res);
        throw err;
      }
    }
  });

  it("/accounts/password/change", async () => {
    const responses = await Promise.all(users.map((data, index) => {
      return request(app)
        .post("/accounts/password/change")
        .set("x-api-token", state.sessions[index].token)
        .send({
          currentPassword: "password",
          password: "newPassword"
        });
    }));
    for (const [index, res] of responses.entries()) {
      try {
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe("success");
        addEndpoint(res, {
          tags: ["accounts"]
        });
      } catch (err) {
        err.message = errorWithResponse(err, res);
        throw err;
      }
    }
  });

  it("/accounts/{accountId}/follow", async () => {
    const res = await request(app)
      .post(`/accounts/${state.sessions[1].account._id}/follow`)
      .set("x-api-token", state.sessions[0].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res, {
        tags: ["accounts"],
        pathParameters: [
          {
            name: "accountId",
            description: "id of the account",
            index: 1
          }
        ]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });

  it("/accounts/{accountId}/follow", async () => {
    const res = await request(app)
      .post(`/accounts/${state.sessions[0].account._id}/follow`)
      .set("x-api-token", state.sessions[1].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
    } catch (err) {
      err.message = errorWithResponse(err, res);
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
      addEndpoint(res, {
        tags: ["accounts"]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
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
      addEndpoint(res, {
        tags: ["accounts"]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });

  it("/accounts/{accountId}/followers", async () => {
    const res = await request(app)
      .get(`/accounts/${state.sessions[1].account._id}/followers`)
      .set("x-api-token", state.sessions[0].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res, {
        tags: ["accounts"],
        pathParameters: [
          {
            name: "accountId",
            description: "id of the account",
            index: 1
          }
        ]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });

  it("/accounts/{accountId}/followings", async () => {
    const res = await request(app)
      .get(`/accounts/${state.sessions[0].account._id}/followings`)
      .set("x-api-token", state.sessions[1].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res, {
        tags: ["accounts"],
        pathParameters: [
          {
            name: "accountId",
            description: "id of the account",
            index: 1
          }
        ]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });

  it("/accounts/{accountId}/unfollow", async () => {
    const res = await request(app)
      .post(`/accounts/${state.sessions[1].account._id}/unfollow`)
      .set("x-api-token", state.sessions[0].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res, {
        tags: ["accounts"],
        pathParameters: [
          {
            name: "accountId",
            description: "id of the account",
            index: 1
          }
        ]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });
});
