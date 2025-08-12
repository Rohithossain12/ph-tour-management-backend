"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const user_token_1 = require("../../utils/user.token");
const env_1 = require("../../config/env");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendEmail_1 = require("../../utils/sendEmail");
;
// const credentialsLogin = async (payload: Partial<IUser>) => {
//     const { email, password } = payload;
//     const isUserExist = await User.findOne({ email });
//     if (!isUserExist) {
//         throw new AppError(httpStatus.BAD_REQUEST, "Email does not exist")
//     };
//     const isPasswordMatch = await bcrypt.compare(password as string, isUserExist.password as string)
//     if (!isPasswordMatch) {
// throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password")
//     };
//     const userTokens = createUserToken(isUserExist)
//     const { password: pass, ...rest } = isUserExist.toObject()
//     return {
//         accessToken: userTokens.accessToken,
//         refreshToken: userTokens.refreshToken,
//         user: rest
//     }
// }
const getNewAccessToken = async (refreshToken) => {
    const newAccessToken = await (0, user_token_1.createNewAccessTokenWithRefreshToken)(refreshToken);
    return {
        accessToken: newAccessToken,
    };
};
const changePassword = async (oldPassword, newPassword, decodedToken) => {
    const user = await user_model_1.User.findById(decodedToken.userId);
    const isOldPasswordMatch = await bcryptjs_1.default.compare(oldPassword, user === null || user === void 0 ? void 0 : user.password);
    if (!isOldPasswordMatch) {
        throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Old Password does not match");
    }
    user.password = await bcryptjs_1.default.hash(newPassword, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    user === null || user === void 0 ? void 0 : user.save();
};
const resetPassword = async (payload, decodedToken) => {
    if (payload.id != decodedToken.userId) {
        throw new AppError_1.default(401, "You can not reset your password");
    }
    const isUserExist = await user_model_1.User.findById(decodedToken.userId);
    if (!isUserExist) {
        throw new AppError_1.default(401, "User does not exist");
    }
    const hashPassword = await bcryptjs_1.default.hash(payload.newPassword, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    isUserExist.password = hashPassword;
    await isUserExist.save();
};
const forgotPassword = async (email) => {
    const isUserExist = await user_model_1.User.findOne({ email });
    if (!isUserExist) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User does not exist");
    }
    ;
    if (!isUserExist.isVerified) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is not verified");
    }
    if (isUserExist.isActive === user_interface_1.IsActive.BLOCKED || isUserExist.isActive === user_interface_1.IsActive.INACTIVE) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `User is ${isUserExist.isActive}`);
    }
    ;
    if (isUserExist.isDeleted) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is deleted");
    }
    ;
    const JwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role
    };
    const resetToken = jsonwebtoken_1.default.sign(JwtPayload, env_1.envVars.JWT_ACCESS_SECRET, {
        expiresIn: "10m"
    });
    const resetUiLink = `${env_1.envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`;
    (0, sendEmail_1.sendEmail)({
        to: isUserExist.email,
        subject: "Password Reset",
        templateName: "forgotPassword",
        templateData: {
            name: isUserExist.name,
            resetUiLink
        }
    });
};
const setPassword = async (userId, plainPassword) => {
    const user = await user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(401, "User not Found");
    }
    if (user.password && user.auths.some(providerObject => providerObject.provider === "google")) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "You have already set your password. Now you can change the password from your profile password update");
    }
    const hashPassword = await bcryptjs_1.default.hash(plainPassword, Number(env_1.envVars.BCRYPT_SALT_ROUND));
    const credentialProvider = {
        provider: "credentials",
        providerId: user.email
    };
    const auths = [...user.auths, credentialProvider];
    user.password = hashPassword;
    user.auths = auths;
    await user.save();
};
exports.AuthServices = {
    // credentialsLogin,
    getNewAccessToken,
    resetPassword,
    changePassword,
    setPassword,
    forgotPassword
};
