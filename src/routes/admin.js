const express = require("express");
const AdminService = require("../services/Admin");
const router = express.Router();
const utils = require("../utils");
const {
  successResponse
} = utils;

// const {
//   setAdminSession,
//   verifyAdminAuth
// } = require("../middlewares/authentication");

// router.use(setAdminSession);

router.route("/login")
  .post(async (req, res, next) => {
    try {
      const data = await AdminService.createLoginSession({
        ...req.body,
        ip: req.ip,
        userAgent: req.header("User-Agent")
      });
      return res.send(successResponse("login successful", data));
    } catch (e) {
      next(e);
    }
  });

router.route("/users")
  .get(async (req, res, next) => {
    try {
      const data = await AdminService.getAccounts();
      return res.send(successResponse(undefined, data));
    } catch (e) {
      next(e);
    }
  });

router.route("/users/:id/activate")
  .post(async (req, res, next) => {
    try {
      const data = await AdminService.activateAccount({
        id: req.params.id
      });
      return res.send(successResponse("account activated", data));
    } catch (e) {
      next(e);
    }
  });

router.route("/users/:id/deactivate")
  .post(async (req, res, next) => {
    try {
      const data = await AdminService.deactivateAccount({
        id: req.params.id
      });
      return res.send(successResponse("account deactivated", data));
    } catch (e) {
      next(e);
    }
  });

router.route("/places")
  .get(async (req, res, next) => {
    try {
      const data = await AdminService.getLocations();
      return res.send(successResponse(undefined, data));
    } catch (e) {
      next(e);
    }
  });

router.route("/pages")
  .get(async (req, res, next) => {
    try {
      const data = await AdminService.getPages();
      return res.send(successResponse(undefined, data));
    } catch (e) {
      next(e);
    }
  });

module.exports = router;
