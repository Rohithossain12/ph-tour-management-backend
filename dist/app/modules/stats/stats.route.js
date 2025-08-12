"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_interface_1 = require("../user/user.interface");
const check_auth_1 = require("../../middlewares/check.auth");
const stats_controller_1 = require("./stats.controller");
const router = express_1.default.Router();
router.get("/booking", (0, check_auth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), stats_controller_1.StatsController.getBookingStats);
router.get("/payment", (0, check_auth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), stats_controller_1.StatsController.getPaymentStats);
router.get("/user", (0, check_auth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), stats_controller_1.StatsController.getUserStats);
router.get("/tour", (0, check_auth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), stats_controller_1.StatsController.getTourStats);
exports.StatsRoutes = router;
