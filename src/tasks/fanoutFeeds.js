const db = require("../db");
const models = db.models;

const actionTypes = {
  ACCOUNT_FOLLOW: "account.follow",
  PAGE_FOLLOW: "page.follow",
  ACCOUNT_LOCATION_ADD: "account.location.add",
  ACCOUNT_PROJECT_ADD: "account.project.add",
  ACCOUNT_EVENT_ADD: "account.event.add",
  PAGE_LOCATION_ADD: "page.location.add",
  PAGE_PROJECT_ADD: "page.project.add",
  PAGE_EVENT_ADD: "page.event.add",
};

const getActionAudience = {
  [actionTypes.ACCOUNT_FOLLOW]: (action) => {

  }
};

const process = async () => {
  await db.createConnection();
  console.log("[INFO] connected to DB!");
  // get pending actions
  const pendingActions = await models.Action.find({
    fanOutStatus: "pending"
  });
  const pendingActionsUpdateResult = await models.Action.updateMany({
    _id: {
      $in: pendingActions.map(a => a._id)
    }
  }, { "$set": { fanOutStatus: "in_progress" } });

  console.log("pendingActions: ", pendingActions);
  console.log("pendingActionsUpdateResult: ", pendingActionsUpdateResult);

  for (const action of pendingActions) {
    await getActionAudience[action.type](action);
  }
};

process().catch(console.error);
