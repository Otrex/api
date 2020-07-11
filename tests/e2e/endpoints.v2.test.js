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

const errorWithResponse = (err, res) => `${err.message}\n\nResponse: ${JSON.stringify(res.body, undefined, 2)}`;

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

  it("/accounts/{accountId}/follow - 1", async () => {
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

  it("/accounts/{accountId}/follow - 2", async () => {
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

  it("/accounts/followers - 1", async () => {
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

  it("/accounts/following - 2", async () => {
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

  it("/accounts/{accountId}/followers - 1", async () => {
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

  it("/accounts/{accountId}/followings - 2", async () => {
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

describe("pages", () => {

  jest.setTimeout(30000);

  it("/pages - post", async () => {
    const res = await request(app)
      .post("/pages")
      .set("x-api-token", state.sessions[1].token)
      .send({
        name: "United Bank of Africa",
        description: "United Bank of Africa",
        shortName: "UBA",
        pageType: "bank",
        industry: "finance",
        image: "image.jpg",
        coverImage: "cover-image.jpg",
        services: ["money lending", "money doubling"],
        tags: ["money", "bank", "loan", "finance"],
        streetAddress: "33 Road Lane Street",
        contactPhoneNumbers: ["+234909099009", "+234909099001"],
        contactEmails: ["contact@uba.com", "help@uba.com"]
      });
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res, {
        tags: ["pages"]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });

  it("/pages - get", async () => {
    const res = await request(app)
      .get("/pages")
      .set("x-api-token", state.sessions[1].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      state.pages = res.body.data;
      addEndpoint(res, {
        tags: ["pages"]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });

  it("/pages/{pageId}/update", async () => {
    const res = await request(app)
      .post(`/pages/${state.pages[0]._id}/update`)
      .set("x-api-token", state.sessions[1].token)
      .send({
        name: "United Bank of Africa",
        description: "United Bank of Africa with a modified description",
        shortName: "UBA",
        pageType: "bank",
        industry: "finance",
        image: "image.jpg",
        coverImage: "cover-image.jpg",
        services: ["money lending", "money doubling"],
        tags: ["money", "bank", "loan", "finance"],
        streetAddress: "33 Road Lane Street",
        contactPhoneNumbers: ["+234909099009", "+234909099001"],
        contactEmails: ["contact@uba.com", "help@uba.com"]
      });
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res, {
        tags: ["pages"],
        pathParameters: [
          {
            name: "pageId",
            description: "id of the page",
            index: 1
          }
        ]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });

  it("/pages/{pageId}/follow", async () => {
    const res = await request(app)
      .post(`/pages/${state.pages[0]._id}/follow`)
      .set("x-api-token", state.sessions[1].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res, {
        tags: ["pages"],
        pathParameters: [
          {
            name: "pageId",
            description: "id of the page",
            index: 1
          }
        ]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });

  it("/pages/{pageId}/follow", async () => {
    const res = await request(app)
      .post(`/pages/${state.pages[0]._id}/follow`)
      .set("x-api-token", state.sessions[0].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res, {
        tags: ["pages"],
        pathParameters: [
          {
            name: "pageId",
            description: "id of the page",
            index: 1
          }
        ]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });

  it("/pages/{pageId}/follow", async () => {
    const res = await request(app)
      .post(`/pages/${state.pages[0]._id}/follow`)
      .set("x-api-token", state.sessions[2].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res, {
        tags: ["pages"],
        pathParameters: [
          {
            name: "pageId",
            description: "id of the page",
            index: 1
          }
        ]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });

  it("/pages/{pageId}/unfollow", async () => {
    const res = await request(app)
      .post(`/pages/${state.pages[0]._id}/unfollow`)
      .set("x-api-token", state.sessions[1].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res, {
        tags: ["pages"],
        pathParameters: [
          {
            name: "pageId",
            description: "id of the page",
            index: 1
          }
        ]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });

  it("/pages/{pageId}/followers", async () => {
    const res = await request(app)
      .get(`/pages/${state.pages[0]._id}/followers`)
      .set("x-api-token", state.sessions[1].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res, {
        tags: ["pages"],
        pathParameters: [
          {
            name: "pageId",
            description: "id of the page",
            index: 1
          }
        ]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });

  it("/pages/{pageId}/team/invites", async () => {
    const res = await request(app)
      .post(`/pages/${state.pages[0]._id}/team/invites`)
      .set("x-api-token", state.sessions[1].token)
      .send({
        email: users[0].email
      });
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res, {
        tags: ["pages"],
        pathParameters: [
          {
            name: "pageId",
            description: "id of the page",
            index: 1
          }
        ]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });

  it("/pages/{pageId}/team/invites/{inviteToken}/accept", async () => {
    const invite = await db.models.PageTeamMemberInvitation.findOne();
    const res = await request(app)
      .post(`/pages/${state.pages[0]._id}/team/invites/${invite.inviteToken}/accept`)
      .set("x-api-token", state.sessions[0].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res, {
        tags: ["pages"],
        pathParameters: [
          {
            name: "pageId",
            description: "id of the page",
            index: 1
          },
          {
            name: "inviteToken",
            description: "page invite token",
            index: 4
          }
        ]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });

  it("/pages/{pageId}/team/invites/{inviteToken}/reject", async () => {
    const invite = await db.models.PageTeamMemberInvitation.findOne();
    const res = await request(app)
      .post(`/pages/${state.pages[0]._id}/team/invites/${invite.inviteToken}/reject`)
      .set("x-api-token", state.sessions[0].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("error");
      addEndpoint(res, {
        tags: ["pages"],
        pathParameters: [
          {
            name: "pageId",
            description: "id of the page",
            index: 1
          },
          {
            name: "inviteToken",
            description: "page invite token",
            index: 4
          }
        ]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });

  it("/pages/{pageId}/team", async () => {
    const res = await request(app)
      .get(`/pages/${state.pages[0]._id}/team`)
      .set("x-api-token", state.sessions[1].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      state.pages[0].team = res.body.data;
      addEndpoint(res, {
        tags: ["pages"],
        pathParameters: [
          {
            name: "pageId",
            description: "id of the page",
            index: 1
          }
        ]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });

  it("pages/{pageId}/team/{memberId}/objects", async () => {
    const res = await request(app)
      .post(`/pages/${state.pages[0]._id}/team/${state.pages[0].team[0]._id}/objects`)
      .set("x-api-token", state.sessions[1].token)
      .send({
        objects: [
          {
            objectType: "location"
          },
          {
            objectType: "event",
            objectPath: state.pages[0].team[0]._id
          },
          {
            objectType: "project",
            objectPath: state.pages[0].team[0]._id
          }
        ]
      });
    const pagesRes = await request(app)
      .get(`/pages/${state.pages[0]._id}/team`)
      .set("x-api-token", state.sessions[1].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      expect(pagesRes.statusCode).toEqual(200);
      expect(pagesRes.body.status).toBe("success");
      state.pages[0].team = pagesRes.body.data;
      addEndpoint(res, {
        tags: ["pages"],
        pathParameters: [
          {
            name: "pageId",
            description: "id of the page",
            index: 1
          },
          {
            name: "memberId",
            description: "id of the page team member",
            index: 3
          }
        ]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });

  it("pages/{pageId}/team/{memberId}/objects/{objectId}/remove", async () => {
    const res = await request(app)
      .post(`/pages/${state.pages[0]._id}/team/${state.pages[0].team[0]._id}/objects/${state.pages[0].team[0].assignedObjects[0]._id}/remove`)
      .set("x-api-token", state.sessions[1].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res, {
        tags: ["pages"],
        pathParameters: [
          {
            name: "pageId",
            description: "id of the page",
            index: 1
          },
          {
            name: "memberId",
            description: "id of the page team member",
            index: 3
          },
          {
            name: "objectId",
            description: "id of the page team member's assigned object",
            index: 5
          }
        ]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });

  it("pages/{pageId}/team/{memberId}/remove", async () => {
    const res = await request(app)
      .post(`/pages/${state.pages[0]._id}/team/${state.pages[0].team[0]._id}/remove`)
      .set("x-api-token", state.sessions[1].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res, {
        tags: ["pages"],
        pathParameters: [
          {
            name: "pageId",
            description: "id of the page",
            index: 1
          },
          {
            name: "memberId",
            description: "id of the page team member",
            index: 3
          }
        ]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });
});

describe("locations", () => {

  jest.setTimeout(30000);

  it("/locations/categories", async () => {
    state.locationCategories = await db.models.LocationCategory.insertMany([
      { name: "Office / Business Premises" },
      { name: "Event Venue" },
      { name: "Project Site" },
      { name: "Property for Sale/Lease/Rent" },
      { name: "Place of Worship / Religion" },
      { name: "Others" }
    ]);
    const res = await request(app)
      .get("/locations/categories")
      .set("x-api-token", state.sessions[0].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res, {
        tags: ["locations"]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });

  it("/locations - post", async () => {
    const res = await request(app)
      .post("/locations")
      .set("x-api-token", state.sessions[0].token)
      .send({
        name: "my house",
        description: "my house at bayelsa test",
        categoryId: state.locationCategories.pop()._id,
        visibility: "public",
        eddress: "myhouse",
        tags: ["home", "village"],
        coordinates: {
          latitude: 4.384938,
          longitude: 4.89898
        }
      });
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      state.locations = [
        res.body.data
      ];
      addEndpoint(res, {
        tags: ["locations"]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });

  it("/locations/{locationId}/update", async () => {
    const res = await request(app)
      .post(`/locations/${state.locations[0]._id}/update`)
      .set("x-api-token", state.sessions[0].token)
      .send({
        name: "my house",
        description: "my new house at Bayelsa test",
        categoryId: state.locationCategories.pop()._id,
        visibility: "private",
        tags: ["home", "village"]
      });
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.description).toBe("my new house at Bayelsa test");
      expect(res.body.data.visibility).toBe("private");
      addEndpoint(res, {
        tags: ["locations"],
        pathParameters: [
          {
            name: "locationId",
            description: "id of the location",
            index: 1
          }
        ]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });

  it("/locations - get", async () => {
    const res = await request(app)
      .get("/locations")
      .set("x-api-token", state.sessions[0].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res, {
        tags: ["locations"]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });

  it("/locations/{locationId}/follow", async () => {
    const responses = await Promise.all(users.map((data, index) => {
      return request(app)
        .post(`/locations/${state.locations[0]._id}/follow`)
        .set("x-api-token", state.sessions[index].token);
    }));
    for (const [index, res] of responses.entries()) {
      try {
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe("success");
        addEndpoint(res, {
          tags: ["locations"],
          pathParameters: [
            {
              name: "locationId",
              description: "id of the location",
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

  it("/locations/{locationId}/unfollow", async () => {
    const res = await request(app)
      .post(`/locations/${state.locations[0]._id}/unfollow`)
      .set("x-api-token", state.sessions[0].token);

    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res, {
        tags: ["locations"],
        pathParameters: [
          {
            name: "locationId",
            description: "id of the location",
            index: 1
          }
        ]
      });
    } catch (err) {
      err.message = errorWithResponse(err, res);
      throw err;
    }
  });

  it("/locations/{locationId}/followers", async () => {
    const res = await request(app)
      .get(`/locations/${state.locations[0]._id}/followers`)
      .set("x-api-token", state.sessions[0].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res, {
        tags: ["locations"],
        pathParameters: [
          {
            name: "locationId",
            description: "id of the location",
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
