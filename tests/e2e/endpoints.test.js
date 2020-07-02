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
  for (const model in db.models) {
    await db.models[model].deleteMany({});
  }
  await new Promise(resolve => setTimeout(resolve, 5000));
});

afterAll(async () => {
  await state.connection.close();
  renderDocumentation();
  await new Promise(resolve => setTimeout(resolve, 5000));
});

describe("accounts", () => {
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

    it("/accounts/profile" + " - " + index, async () => {
      const res = await request(app)
        .get("/accounts/profile")
        .set("x-api-token", state.sessions[index].token);
      try {
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe("success");
        addEndpoint(res);
      } catch (err) {
        err.message = `${err.message}\n\nResponse: ${JSON.stringify(res.body, undefined, 2)}`;
        throw err;
      }
    });

    it("/accounts/profile/update" + " - " + index, async () => {
      const res = await request(app)
        .post("/accounts/profile/update")
        .set("x-api-token", state.sessions[index].token)
        .send({
          location: "Choba, Port Harcourt"
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

  it("/auth/reset-password/initiate", async () => {
    const res = await request(app)
      .post("/auth/reset-password/initiate")
      .send({
        email: data[0].email
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

describe("locations and search", () => {
  // eslint-disable-next-line no-undef
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
      addEndpoint(res);
    } catch (err) {
      err.message = `${err.message}\n\nResponse: ${JSON.stringify(res.body, undefined, 2)}`;
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
        coordinates: {
          latitude: 4.384938,
          longitude: 4.89898
        }
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

  it("/locations - get", async () => {
    const res = await request(app)
      .get("/locations")
      .set("x-api-token", state.sessions[0].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      state.locations = res.body.data;
      addEndpoint(res);
    } catch (err) {
      err.message = `${err.message}\n\nResponse: ${JSON.stringify(res.body, undefined, 2)}`;
      throw err;
    }
  });

  it("/photos - add photo to location", async () => {
    await request(app)
      .post("/photos")
      .set("x-api-token", state.sessions[0].token)
      .send({
        ownerId: state.locations[0]._id,
        ownerType: "location",
        filename: "3eo9sh3vh03g0fe3eh7n09ihu39d8fk3wu4dt4uh8.jpeg",
        description: "1975"
      });
    const res = await request(app)
      .post("/photos")
      .set("x-api-token", state.sessions[0].token)
      .send({
        ownerId: state.locations[0]._id,
        ownerType: "location",
        filename: "dt4ui3eh7f9sh3vhk3eo39d8093wu4hgn308hu0fe.jpeg",
        description: "1955"
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

  it("/locations/{username}/{eddress} - get", async () => {
    const res = await request(app)
      .get(`/locations/${state.sessions[0].account.username}/${"myhouse"}`)
      .set("x-api-token", state.sessions[0].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      state.photo = res.body.data.photos[0];
      addEndpoint(res);
    } catch (err) {
      err.message = `${err.message}\n\nResponse: ${JSON.stringify(res.body, undefined, 2)}`;
      throw err;
    }
  });

  it("/photos - remove photo", async () => {
    const res = await request(app)
      .post(`/photos/${state.photo._id}/delete`)
      .set("x-api-token", state.sessions[0].token);
    try {
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe("success");
      addEndpoint(res);
    } catch (err) {
      err.message = `${err.message}\n\nResponse: ${JSON.stringify(res.body, undefined, 2)}`;
      throw err;
    }
  });

  it("/accounts/profile", async () => {
    const res = await request(app)
      .get("/accounts/profile")
      .set("x-api-token", state.sessions[0].token);
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

describe("territory", () => {
  // eslint-disable-next-line no-undef
  jest.setTimeout(30000);

  it("/territories/track", async () => {
    // populate territories
    const countries = require("../../src/lib/countries.json");
    for (const feature of countries.features) {
      if (feature.properties.ADMIN === "Antarctica") {
        continue;
      }
      await db.models.Territory.create({
        name: feature.properties.ADMIN,
        description: feature.properties.ADMIN,
        properties: feature.properties,
        geometry: feature.geometry
      }).catch(console.error);
    }
    state.territories = await db.models.Territory.find();
    const res = await request(app)
      .post("/territories/track")
      .set("x-api-token", state.sessions[1].token)
      .send({
        territoryId: state.territories[0]._id
      });
    await request(app)
      .post("/territories/track")
      .set("x-api-token", state.sessions[1].token)
      .send({
        territoryId: state.territories[1]._id
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

  it("/territories/untrack", async () => {
    const res = await request(app)
      .post("/territories/untrack")
      .set("x-api-token", state.sessions[1].token)
      .send({
        territoryId: state.territories[0]._id
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

it("/search", async () => {
  const res = await request(app)
    .post("/search")
    .set("x-api-token", state.sessions[1].token)
    .send({
      query: "test"
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
    addEndpoint(res);
  } catch (err) {
    err.message = `${err.message}\n\nResponse: ${JSON.stringify(res.body, undefined, 2)}`;
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
    addEndpoint(res);
  } catch (err) {
    err.message = `${err.message}\n\nResponse: ${JSON.stringify(res.body, undefined, 2)}`;
    throw err;
  }
});
