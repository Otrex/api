const PhotoService = require("../services/Photo");
const {
  successResponse
} = require("../utils");

module.exports.addPhoto = async (req, res, next) => {
  try {
    await PhotoService.createPhotos({
      accountId: req.session.account._id,
      ownerId: req.body.ownerId,
      ownerType: req.body.ownerType,
      photos: req.body.photos
    });
    return res.send(successResponse("success"));
  } catch (e) {
    next(e);
  }
};

module.exports.deletePhoto = async (req, res, next) => {
  try {
    await PhotoService.deletePhoto({
      accountId: req.session.account._id,
      photoId: req.params.photoId
    });
    return res.send(successResponse("success"));
  } catch (e) {
    next(e);
  }
};
