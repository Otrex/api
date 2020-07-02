const PhotoService = require("../services/Photo");
const {
  successResponse
} = require("../utils");

module.exports.addPhoto = async (req, res, next) => {
  try {
    await PhotoService.createPhoto({
      ownerId: req.body.ownerId,
      ownerType: req.body.ownerType,
      filename: req.body.filename,
      description: req.body.description
    });
    return res.send(successResponse("success"));
  } catch (e) {
    next(e);
  }
};

module.exports.deletePhoto = async (req, res, next) => {
  try {
    await PhotoService.deletePhoto({
      photoId: req.params.photoId
    });
    return res.send(successResponse("success"));
  } catch (e) {
    next(e);
  }
};
