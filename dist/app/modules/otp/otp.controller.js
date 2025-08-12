"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const otp_service_1 = require("./otp.service");
const sendOTP = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { email, name } = req.body;
    await otp_service_1.OTPService.sendOTP(email, name);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "OTP sent successfully",
        data: null,
    });
});
const verifyOTP = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { email, otp } = req.body;
    await otp_service_1.OTPService.verifyOTP(email, otp);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "OTP verified successfully",
        data: null,
    });
});
exports.OTPController = {
    sendOTP,
    verifyOTP
};
