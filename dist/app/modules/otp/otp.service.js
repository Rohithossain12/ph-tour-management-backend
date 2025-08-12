"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const redis_config_1 = require("../../config/redis.config");
const sendEmail_1 = require("../../utils/sendEmail");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_model_1 = require("../user/user.model");
const OTP_EXPIRATION = 2 * 60;
const generateOtp = (length = 6) => {
    const otp = crypto_1.default.randomInt(10 ** (length), 10 ** length).toString();
    return otp;
};
const sendOTP = async (email, name) => {
    const user = await user_model_1.User.findOne({ email });
    if (!user) {
        throw new AppError_1.default(404, "User not found");
    }
    if (user.isVerified) {
        throw new AppError_1.default(401, "You are already verified");
    }
    const otp = generateOtp();
    const redisKey = `otp:${email}`;
    await redis_config_1.redisClient.set(redisKey, otp, {
        expiration: {
            type: "EX",
            value: OTP_EXPIRATION
        }
    });
    await (0, sendEmail_1.sendEmail)({
        to: email,
        subject: "Your Otp Code",
        templateName: "otp",
        templateData: {
            name: name,
            otp: otp
        }
    });
};
const verifyOTP = async (email, otp) => {
    // const user = await User.findOne({ email, isVerified: false });
    const user = await user_model_1.User.findOne({ email });
    if (!user) {
        throw new AppError_1.default(404, "User not found");
    }
    if (user.isVerified) {
        throw new AppError_1.default(401, "You are already verified");
    }
    const redisKey = `otp:${email}`;
    const saveOtp = await redis_config_1.redisClient.get(redisKey);
    if (!saveOtp) {
        throw new AppError_1.default(401, "Invalid OTP");
    }
    ;
    if (saveOtp !== otp) {
        throw new AppError_1.default(401, "Invalid OTP");
    }
    ;
    await Promise.all([
        user_model_1.User.updateOne({ email }, { isVerified: true }, { runValidators: true }),
        redis_config_1.redisClient.del([redisKey])
    ]);
};
exports.OTPService = {
    sendOTP,
    verifyOTP
};
