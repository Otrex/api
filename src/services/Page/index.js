const {
  ServiceError,
  AuthorizationError
} = require("../../errors");
const wrapServiceAction = require("../_core/wrapServiceAction");

const ObjectId = require("mongoose").Types.ObjectId;

const utils = require("../../utils");

const models = require("../../db").models;

const omit = require("lodash/omit");
const pick = require("lodash/pick");

/*
* Validation Helpers
* */
const { email, string, any, objectId } = require("../../validation");
const createAndUpdateParams = {
  $$strict: "remove",
  accountId: { ...objectId },
  name: {
    ...string,
    min: 4
  },
  description: {
    ...string,
    min: 8
  },
  shortName: {
    ...string,
    min: 2
  },
  image: {
    ...string,
    optional: true
  },
  coverImage: {
    ...string,
    optional: true
  },
  pageType: { ...string },
  industry: { ...string },
  services: {
    type: "array",
    items: "string",
    optional: true
  },
  tags: {
    type: "array",
    items: "string",
    optional: true
  },
  streetAddress: {
    ...string,
    optional: true
  },
  contactPhoneNumbers: {
    type: "array",
    items: "string",
    optional: true
  },
  contactEmails: {
    type: "array",
    items: "string",
    optional: true
  }
};

/*
* Service Dependencies
* */
const PhotoService = require("../Photo");
const ProjectService = require("../Project");
const EventService = require("../Event");
const LocationService = require("../Location");

/*
* Service Actions
* */
module.exports.createPage = wrapServiceAction({
  params: {
    username: {
      ...string,
      min: 3,
      max: 16,
      lowercase: true,
      pattern: /^[a-z0-9_]+$/,
      messages: {
        stringMin: "your username should be more than 2 characters",
        stringMax: "your username should not be at more than 16 characters",
        stringPattern: "your username should only contain letters, numbers and underscores"
      },
      optional: true
    },
    ...createAndUpdateParams
  },
  async handler (params) {
    params.username = params.username || params.name.toLowerCase().replace(/[^a-z0-9_]+/g, "");
    // check if username already exists
    const usernameTakenByPage = await models.Page.findOne({
      username: params.username
    });
    const usernameTakenByAccount = await models.Account.findOne({
      username: params.username
    });
    if (usernameTakenByPage || usernameTakenByAccount) {
      throw new ServiceError("an account with this username already exists");
    }
    // check if page with this name already exists
    const account = await models.Account.findById(params.accountId);
    // check if page with this name already exists
    const exists = await models.Page.findOne({
      accountId: params.accountId,
      name: params.name
    });
    if (exists) {
      throw new ServiceError("you have already created a page with this name");
    }
    const page = await models.Page.create({
      ...omit(params, ["accountId"])
    });
    page.teamMembers.push({
      accountId: params.accountId,
      role: "owner",
      email: account.email,
      assignedObjects: [
        {
          objectType: "*",
          objectPath: "*"
        }
      ]
    });
    await page.save();

    if (params.image) {
      await models.PendingUpload.deleteOne({
        filename: params.image,
      });
    }
    if (params.coverImage) {
      await models.PendingUpload.deleteOne({
        filename: params.coverImage
      });
    }
    return true;
  }
});

module.exports.getPage = wrapServiceAction({
  params: {
    $$strict: "remove",
    accountId: { ...objectId },
    pageId: { ...objectId }
  },
  async handler (params) {
    const projects = await ProjectService.getPageProjects({
      pageId: params.pageId
    });
    const events = await EventService.getPageEvents({
      pageId: params.pageId
    });
    const locations = await LocationService.getPageLocations({
      pageId: params.pageId
    });
    const page = await models.Page.findOne({
      _id: params.pageId,
      "teamMembers.accountId": params.accountId
    }).select({
      teamMembers: 0
    });
    return {
      ...page.toObject(),
      locations,
      projects,
      events
    };
  }
});

module.exports.updatePage = wrapServiceAction({
  params: {
    pageId: { ...objectId },
    ...createAndUpdateParams
  },
  async handler (params) {
    const page = await models.Page.findById(params.pageId);
    if (!page) {
      throw new ServiceError("page not found");
    }
    const updatedPage = await models.Page.findByIdAndUpdate(page._id, {
      ...omit(params, ["accountId", "pageId"])
    }, {
      new: true,
      fields: { teamMembers: 0 }
    });
    if (page.image && params.image && page.image !== params.image) {
      await utils.deleteUploadedFile(page.image);
      await models.PendingUpload.deleteOne({
        filename: params.image,
      });
    }
    if (page.coverImage && params.coverImage && page.coverImage !== params.coverImage) {
      await utils.deleteUploadedFile(page.coverImage);
      await models.PendingUpload.deleteOne({
        filename: params.coverImage
      });
    }
    return updatedPage;
  }
});

module.exports.getPages = wrapServiceAction({
  params: {
    $$strict: "remove",
    accountId: { ...objectId }
  },
  async handler (params) {
    return await models.Page.find({
      "teamMembers.accountId": params.accountId,
      status: "active"
    }).select({
      name: 1,
      username: 1,
      image: 1,
      followersCount: 1
    });
  }
});

module.exports.followPage = wrapServiceAction({
  params: {
    $$strict: "remove",
    pageId: { ...objectId },
    followerId: { ...objectId }
  },
  async handler (params) {
    const page = await models.Page.findById(params.pageId);
    const follower = await models.Account.findById(params.followerId);
    if (!page) {
      throw new ServiceError("page not found");
    }
    if (!follower) {
      throw new ServiceError("account not found");
    }

    const record = await models.PageFollower.findOne({
      pageId: params.pageId,
      followerId: params.followerId
    });

    if (record) {
      throw new ServiceError("you are already following this page");
    }

    page.followersCount++;

    await Promise.all([
      page.save()
    ]);

    // log action
    await models.Action.create({
      actorId: params.followerId,
      actorType: "account",
      type: "page.follow",
      description: `${follower.username} followed your page ${page.name}`,
      data: {
        followerAccount: pick(follower, ["_id", "username", "profileImage"]),
        followedPage: pick(page, ["_id", "name"])
      }
    });

    return await models.PageFollower.findOneAndUpdate({
      pageId: params.pageId,
      followerId: params.followerId
    }, {}, {
      upsert: true,
      new: true
    });
  }
});

module.exports.unfollowPage = wrapServiceAction({
  params: {
    $$strict: "remove",
    pageId: { ...objectId },
    followerId: { ...objectId }
  },
  async handler (params) {
    const page = await models.Page.findById(params.pageId);
    const follower = await models.Account.findById(params.followerId);
    if (!page) {
      throw new ServiceError("page not found");
    }
    if (!follower) {
      throw new ServiceError("account not found");
    }

    const record = await models.PageFollower.findOne({
      pageId: params.pageId,
      followerId: params.followerId
    });

    if (!record) {
      throw new ServiceError("you are not following this page");
    }

    page.followersCount--;

    await Promise.all([
      page.save()
    ]);
    return await models.PageFollower.findOneAndDelete({
      pageId: params.pageId,
      followerId: params.followerId
    });
  }
});

module.exports.getPageFollowers = wrapServiceAction({
  params: {
    $$strict: "remove",
    pageId: { ...objectId }
  },
  async handler (params) {
    return models.PageFollower.aggregate([
      { $match: { pageId: ObjectId(params.pageId) } },
      {
        $lookup: {
          from: models.Account.collection.collectionName,
          localField: "followerId",
          foreignField: "_id",
          as: "follower",
        }
      },
      {
        $replaceRoot: {
          newRoot: { $arrayElemAt: ["$follower", 0] }
        }
      },
      {
        $project: {
          username: 1,
          profileImage: 1
        }
      }
    ]);
  }
});

module.exports.sendPageTeamMemberInvitation = wrapServiceAction({
  params: {
    $$strict: "remove",
    accountId: { ...objectId },
    pageId: { ...objectId },
    email: { ...email }
  },
  async handler (params) {
    const page = await models.Page.findById(params.pageId);
    const account = await models.Account.findById(params.accountId);
    if (!page) {
      throw new ServiceError("page not found");
    }
    const isPageOwner = page.teamMembers.find(m => {
      return (m.accountId.toString() === params.accountId.toString()) &&
        (m.role === "owner");
    });
    if (!isPageOwner) {
      throw new AuthorizationError();
    }
    if (account.email === params.email) {
      throw new ServiceError("you cannot invite yourself");
    }
    const record = await models.PageTeamMemberInvitation.findOne({
      pageId: params.pageId,
      inviteeEmail: params.email,
      inviteStatus: {
        $in: ["pending", "accepted"]
      }
    });
    if (record) {
      throw new ServiceError("you have already invited this person");
    }
    const inviteToken = utils.generateRandomCode(32);
    await models.PageTeamMemberInvitation.create({
      pageId: params.pageId,
      inviteeEmail: params.email,
      inviteToken: inviteToken,
      inviteStatus: "pending"
    });
    const MailerService = require("../Mailer");
    await MailerService.send(MailerService.events.PAGE_TEAM_MEMBER_INVITED, params.email, {
      page: page.toObject(),
      link: `https://dev.pointograph.com/pages/${page.id}/invite/${inviteToken}/accept`
    });
    return true;
  }
});

module.exports.getPageTeamMemberInvitations = wrapServiceAction({
  params: {
    $$strict: "remove",
    accountId: { ...any },
    pageId: { ...any }
  },
  async handler (params) {
    const page = models.Page.findById(params.pageId);
    if (!page) {
      throw new ServiceError("page not found");
    }
    const isPageOwner = page.teamMembers.find(m => {
      return (m.accountId.toString() === params.accountId.toString()) &&
        (m.role === "owner");
    });
    if (!isPageOwner) {
      throw new AuthorizationError();
    }
    return await models.PageTeamMemberInvitation.find({
      pageId: params.pageId
    });
  }
});

module.exports.acceptPageTeamMemberInvitation = wrapServiceAction({
  params: {
    $$strict: "remove",
    pageId: { ...any },
    accountId: { ...any },
    inviteToken: { ...any }
  },
  async handler (params) {
    const account = await models.Account.findById(params.accountId);
    if (!account) {
      throw new ServiceError("account not found");
    }
    const pageTeamMemberInvitation = await models.PageTeamMemberInvitation.findOne({
      pageId: params.pageId,
      inviteToken: params.inviteToken,
      inviteeEmail: account.email,
      inviteStatus: "pending"
    });
    if (!pageTeamMemberInvitation) {
      throw new ServiceError("invitation has expired or has been revoked");
    }
    pageTeamMemberInvitation.inviteStatus = "accepted";
    await pageTeamMemberInvitation.save();
    const page = await models.Page.findById(pageTeamMemberInvitation.pageId);
    if (!page) {
      throw new ServiceError("page not found");
    }
    page.teamMembers.push({
      accountId: account._id,
      email: account.email,
      role: "maintainer",
      assignedObjects: pageTeamMemberInvitation.assignedObjects
    });
    await page.save();
    return true;
  }
});

module.exports.rejectPageTeamMemberInvitation = wrapServiceAction({
  params: {
    $$strict: "remove",
    pageId: { ...any },
    accountId: { ...any },
    inviteToken: { ...any }
  },
  async handler (params) {
    const account = await models.Account.findById(params.accountId);
    if (!account) {
      throw new ServiceError("account not found");
    }
    const pageTeamMemberInvitation = await models.PageTeamMemberInvitation.findOne({
      pageId: params.pageId,
      inviteToken: params.inviteToken,
      inviteeEmail: account.email,
      inviteStatus: "pending"
    });
    if (!pageTeamMemberInvitation) {
      throw new ServiceError("invitation has expired or has been revoked");
    }
    pageTeamMemberInvitation.inviteStatus = "rejected";
    return true;
  }
});

module.exports.getPageTeamMembers = wrapServiceAction({
  params: {
    $$strict: "remove",
    pageId: { ...any },
    accountId: { ...any }
  },
  async handler (params) {
    const page = await models.Page.findById(params.pageId);
    if (!page) {
      throw new ServiceError("page not found");
    }
    const isPageOwner = page.teamMembers.find(m => {
      return (m.accountId.toString() === params.accountId.toString()) &&
        (m.role === "owner");
    });
    if (!isPageOwner) {
      throw new AuthorizationError();
    }
    return page.teamMembers.filter(m => m.role !== "owner");
  }
});

module.exports.updatePageTeamMember = wrapServiceAction({
  params: {
    $$strict: "remove",
    pageId: { ...any },
    accountId: { ...any },
    memberId: { ...any },
    objects: {
      type: "array",
      items: {
        type: "object",
        props: {
          objectType: {
            type: "enum",
            values: ["location", "event", "project"]
          },
          objectPath: {
            ...string,
            optional: true
          }
        }
      }
    }
  },
  async handler (params) {
    const page = await models.Page.findById(params.pageId);
    if (!page) {
      throw new ServiceError("page not found");
    }
    const isPageOwner = page.teamMembers.find(m => {
      return (m.accountId.toString() === params.accountId.toString()) &&
        (m.role === "owner");
    });
    if (!isPageOwner) {
      throw new AuthorizationError();
    }
    const teamMember = page.teamMembers.find(m => m._id.toString() === params.memberId.toString());
    const teamMemberIndex = page.teamMembers.findIndex(m => m._id.toString() === params.memberId.toString());
    if (!teamMember) {
      throw new ServiceError("user is not managing this page");
    }
    teamMember.assignedObjects = params.objects.map(object => ({
      objectType: object.objectType,
      objectPath: object.objectPath || "*"
    }));
    page.teamMembers[teamMemberIndex] = teamMember;
    await page.save();
    return true;
  }
});

module.exports.assignObjectsToPageTeamMember = wrapServiceAction({
  params: {
    $$strict: "remove",
    pageId: { ...any },
    accountId: { ...any },
    memberId: { ...any },
    objects: {
      type: "array",
      items: {
        type: "object",
        props: {
          objectType: {
            type: "enum",
            values: ["location", "event", "project"]
          },
          objectPath: {
            ...string,
            optional: true
          }
        }
      }
    }
  },
  async handler (params) {
    const page = await models.Page.findById(params.pageId);
    if (!page) {
      throw new ServiceError("page not found");
    }
    const isPageOwner = page.teamMembers.find(m => {
      return (m.accountId.toString() === params.accountId.toString()) &&
        (m.role === "owner");
    });
    if (!isPageOwner) {
      throw new AuthorizationError();
    }
    const teamMember = page.teamMembers.find(m => m._id.toString() === params.memberId.toString());
    const teamMemberIndex = page.teamMembers.findIndex(m => m._id.toString() === params.memberId.toString());
    if (!teamMember) {
      throw new ServiceError("user is not managing this page");
    }
    teamMember.assignedObjects = teamMember.assignedObjects.concat(params.objects.map(object => ({
      objectType: object.objectType,
      objectPath: object.objectPath || "*"
    })));
    page.teamMembers[teamMemberIndex] = teamMember;
    await page.save();
    return true;
  }
});

module.exports.removeAssignedObjectFromPageTeamMember = wrapServiceAction({
  params: {
    $$strict: "remove",
    pageId: { ...any },
    accountId: { ...any },
    memberId: { ...any },
    assignedObjectId: { ...any }
  },
  async handler (params) {
    const page = await models.Page.findById(params.pageId);
    if (!page) {
      throw new ServiceError("page not found");
    }
    const isPageOwner = page.teamMembers.find(m => {
      return (m.accountId.toString() === params.accountId.toString()) &&
        (m.role === "owner");
    });
    if (!isPageOwner) {
      throw new AuthorizationError();
    }
    const teamMember = page.teamMembers.find(m => m._id.toString() === params.memberId.toString());
    const teamMemberIndex = page.teamMembers.findIndex(m => m._id.toString() === params.memberId.toString());
    if (!teamMember) {
      throw new ServiceError("user is not managing this page");
    }
    teamMember.assignedObjects = teamMember.assignedObjects.filter(object => object._id.toString() !== params.assignedObjectId);
    page.teamMembers[teamMemberIndex] = teamMember;
    await page.save();
    return true;
  }
});

module.exports.removePageTeamMember = wrapServiceAction({
  params: {
    $$strict: "remove",
    pageId: { ...any },
    accountId: { ...any },
    memberId: { ...any }
  },
  async handler (params) {
    const page = await models.Page.findById(params.pageId);
    if (!page) {
      throw new ServiceError("page not found");
    }
    const isPageOwner = page.teamMembers.find(m => {
      return (m.accountId.toString() === params.accountId.toString()) &&
        (m.role === "owner");
    });
    if (!isPageOwner) {
      throw new AuthorizationError();
    }
    page.teamMembers = page.teamMembers.filter(m => m._id.toString() !== params.memberId.toString());
    await page.save();
    return true;
  }
});

module.exports.removePage = wrapServiceAction({
  params: {
    $$strict: "remove",
    pageId: { ...any },
    accountId: { ...any },
    password: { ...string }
  },
  async handler (params) {
    const page = await models.Page.findById(params.pageId);
    if (!page) {
      throw new ServiceError("page not found");
    }
    const account = await models.Account.findById(params.accountId);
    if (!(await utils.bcryptCompare(params.password, account.password))) {
      throw new ServiceError("password is incorrect");
    }
    const isPageOwner = page.teamMembers.find(m => {
      return (m.accountId.toString() === params.accountId.toString()) &&
        (m.role === "owner");
    });
    if (!isPageOwner) {
      throw new AuthorizationError();
    }
    page.status = "inactive";
    await page.save();
    return true;
  }
});


