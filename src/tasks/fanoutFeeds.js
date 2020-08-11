const db = require("../db");
const models = db.models;

const actionTypes = {
  ACCOUNT_FOLLOW: "account.follow",
  PAGE_FOLLOW: "page.follow",
  LOCATION_ADD: "location.add",
  PROJECT_ADD: "project.add",
  EVENT_ADD: "event.add",
};

const getActionAudience = {
  [actionTypes.ACCOUNT_FOLLOW]: async (action) => {
    return [
      {
        id: action.data.followedAccount._id,
        type: "account"
      }
    ];
  },
  [actionTypes.PAGE_FOLLOW]: async (action) => {
    return [
      {
        id: action.data.followedPage._id,
        type: "page"
      }
    ];
  },
  [actionTypes.EVENT_ADD]: async (action) => {
    let followers = [];
    let trackers = [];

    const followerModel = action.actorType === "account"
      ? models.AccountFollower
      : models.PageFollower;
    const followerKey = action.actorType === "account"
      ? "accountId"
      : "pageId";
    let f = await followerModel.find({
      [followerKey]: action.actorId
    });
    f = f.map(f => ({
      id: f.followerId,
      type: "account"
    }));
    followers = followers.concat(f);
    // get the territory the event falls under
    const territory = await models.Territory.findOne({
      geometry: {
        $geoIntersects: {
          $geometry: action.data.event.location.preciseLocation
        }
      }
    });
    console.log(territory);
    if (territory) {
      // get territory trackers
      let t = await models.TerritoryTracker.find({
        territoryId: territory._id
      });
      t = t.map(t => ({
        id: t.trackerId,
        type: "account"
      }));
      trackers = trackers.concat(t);
    }
    return followers.concat(trackers);
  }
};

const run = async () => {
  await db.createConnection();
  console.log("[INFO] connected to DB!");
  // get pending actions
  const pendingActions = await models.Action.find({
    fanOutStatus: "pending"
  });
  await models.Action.updateMany({
    _id: {
      $in: pendingActions.map(a => a._id)
    }
  }, { $set: { fanOutStatus: "in_progress" } });
  for (const action of pendingActions) {
    const audience = await getActionAudience[action.type](action);
    for (const aud of audience) {
      const conditions = {
        ownerId: aud.id,
        ownerType: aud.type,
        count: { $lt: 1000 }
      };
      await models.FeedBucket.updateOne(conditions,
        {
          $push: {
            actions: {
              $each: [action._id],
              $position: 0
            }
          },
          $inc: { "count": 1 }
        },
        { upsert: true });
      action.fanOutStatus = "completed";
      await action.save();
    }
  }
};

run().then(() => process.exit(0)).catch(console.error);
