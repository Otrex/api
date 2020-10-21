const models = require("../../db").models;
const {
  ServiceError,
  AuthorizationError,
  NotFoundError
} = require("../../errors");

module.exports = async (accountId, objectId, objectType) => {
  const objectTypeModel = {
    location: models.Location,
    event: models.Event,
    project: models.Project
  };
  const object = await objectTypeModel[objectType].findById(objectId);
  if (!object) {
    throw new NotFoundError(`${objectType} not found`);
  }
  if (
    object.ownerType === "account" &&
    object.ownerId.toString() !== accountId.toString()
  ) {
    throw new AuthorizationError();
  }
  if (object.ownerType === "page") {
    const page = models.Page.findById(object.ownerId);
    if (!page) {
      throw new NotFoundError(`${objectType} not found`);
    }
    // check for page moderator membership
    console.log(page.toJSON());
    const membership = page.teamMembers.find(m => m.accountId.toString() === accountId.toString());
    if (!membership) {
      throw new AuthorizationError();
    }
    // check page object permissions
    for (const assignedObject of membership.assignedObjects) {
      if (
        assignedObject.objectType === "*" &&
        assignedObject.objectPath === "*"
      ) {
        return true;
      }
      if (
        assignedObject.objectType === objectType &&
        assignedObject.objectPath === "*"
      ) {
        return true;
      }
      if (
        assignedObject.objectType === objectType &&
        assignedObject.objectPath.includes(objectId.toString())
      ) {
        return true;
      }
    }
    throw new AuthorizationError();
  }
  return true;
};
