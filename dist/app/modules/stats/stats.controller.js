"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const stats_service_1 = require("./stats.service");
const getBookingStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const stats = await stats_service_1.StatsService.getBookingStats();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Booking stats fetched successfully",
        data: stats,
    });
});
const getPaymentStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const stats = await stats_service_1.StatsService.getPaymentStats();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Payment stats fetched successfully",
        data: stats,
    });
});
const getUserStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const stats = await stats_service_1.StatsService.getUserStats();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "User stats fetched successfully",
        data: stats,
    });
});
const getTourStats = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const stats = await stats_service_1.StatsService.getTourStats();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Tour stats fetched successfully",
        data: stats,
    });
});
exports.StatsController = {
    getBookingStats,
    getPaymentStats,
    getUserStats,
    getTourStats,
};
