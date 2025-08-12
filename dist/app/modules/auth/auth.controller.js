"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthControllers = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const auth_service_1 = require("./auth.service");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const setCookie_1 = require("../../utils/setCookie");
const user_token_1 = require("../../utils/user.token");
const env_1 = require("../../config/env");
const passport_1 = __importDefault(require("passport"));
const credentialsLogin = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    // const loginInfo = await AuthServices.credentialsLogin(req.body);
    passport_1.default.authenticate("local", async (err, user, info) => {
        if (err) {
            return next(new AppError_1.default(401, err));
        }
        if (!user) {
            return next(new AppError_1.default(401, info.message));
        }
        const userTokens = await (0, user_token_1.createUserToken)(user);
        const _a = user.toObject(), { password: pass } = _a, rest = __rest(_a, ["password"]);
        (0, setCookie_1.setAuthCookie)(res, userTokens);
        (0, sendResponse_1.sendResponse)(res, {
            statusCode: http_status_codes_1.default.OK,
            success: true,
            message: "User Login Successfully",
            data: {
                accessToken: userTokens.accessToken,
                refreshToken: userTokens.refreshToken,
                user: rest
            },
        });
    })(req, res, next);
});
const getNewAccessToken = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "No refresh token received from cookies");
    }
    const tokenInfo = await auth_service_1.AuthServices.getNewAccessToken(refreshToken);
    res.cookie("accessToken", tokenInfo.accessToken, {
        httpOnly: true,
        secure: false
    });
    // setAuthCookie(res, tokenInfo);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "New Access Token Retrived Successfully",
        data: tokenInfo,
    });
});
// logout
const logout = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "User Logout Successfully",
        data: null,
    });
});
// change Password
const changePassword = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user;
    await auth_service_1.AuthServices.changePassword(oldPassword, newPassword, decodedToken);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Password Reset Successfully",
        data: null,
    });
});
// Reset Password
const resetPassword = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const decodedToken = req.user;
    await auth_service_1.AuthServices.resetPassword(req.body, decodedToken);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Password Reset Successfully",
        data: null,
    });
});
// Forgot Password
const forgotPassword = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { email } = req.body;
    await auth_service_1.AuthServices.forgotPassword(email);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Email sent  Successfully",
        data: null,
    });
});
const setPassword = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const decodedToken = req.user;
    const { password } = req.body;
    await auth_service_1.AuthServices.setPassword(decodedToken.userId, password);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Password Reset Successfully",
        data: null,
    });
});
const googleCallbackController = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    let redirectTo = req.query.state ? req.query.state : "";
    const user = req.user;
    if (redirectTo.startsWith("/")) {
        redirectTo = redirectTo.slice(1);
    }
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User Not Found");
    }
    const tokenInfo = (0, user_token_1.createUserToken)(user);
    (0, setCookie_1.setAuthCookie)(res, tokenInfo);
    res.redirect(`${env_1.envVars.FRONTEND_URL}/${redirectTo}`);
});
exports.AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logout,
    resetPassword,
    googleCallbackController,
    changePassword,
    setPassword,
    forgotPassword
};
