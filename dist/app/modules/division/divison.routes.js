"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DivisionRoutes = void 0;
const express_1 = require("express");
const check_auth_1 = require("../../middlewares/check.auth");
const validateRequest_1 = require("../../middlewares/validateRequest");
const division_controller_1 = require("./division.controller");
const division_validation_1 = require("./division.validation");
const user_interface_1 = require("../user/user.interface");
const multer_config_1 = require("../../config/multer.config");
const router = (0, express_1.Router)();
/*
 {

 file : Image
 data : body text data => req.body => req.body.data
 }
*/
// Form data -> body, file
router.post("/create", (0, check_auth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), multer_config_1.multerUpload.single("file"), (0, validateRequest_1.validateRequest)(division_validation_1.createDivisionSchema), division_controller_1.DivisionController.createDivision);
router.get("/", division_controller_1.DivisionController.getAllDivisions);
router.get("/:slug", division_controller_1.DivisionController.getSingleDivision);
router.patch("/:id", (0, check_auth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), multer_config_1.multerUpload.single("file"), (0, validateRequest_1.validateRequest)(division_validation_1.updateDivisionSchema), division_controller_1.DivisionController.updateDivision);
router.delete("/:id", (0, check_auth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), division_controller_1.DivisionController.deleteDivision);
exports.DivisionRoutes = router;
