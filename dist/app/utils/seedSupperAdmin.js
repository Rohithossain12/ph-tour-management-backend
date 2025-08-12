"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSupperAdmin = void 0;
const env_1 = require("../config/env");
const user_interface_1 = require("../modules/user/user.interface");
const user_model_1 = require("../modules/user/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const seedSupperAdmin = async () => {
    try {
        const isSupperAdminExist = await user_model_1.User.findOne({ email: env_1.envVars.SUPER_ADMIN_EMAIL });
        if (isSupperAdminExist) {
            console.log("Supper Admin Already Exist");
            return;
        }
        console.log("trying to create supper admin");
        const hashPassword = await bcryptjs_1.default.hash(env_1.envVars.SUPER_ADMIN_PASSWORD, Number(env_1.envVars.BCRYPT_SALT_ROUND));
        const authProvider = {
            provider: "credentials",
            providerId: env_1.envVars.SUPER_ADMIN_EMAIL
        };
        const payload = {
            name: "supper admin",
            role: user_interface_1.Role.SUPPER_ADMIN,
            email: env_1.envVars.SUPER_ADMIN_EMAIL,
            password: hashPassword,
            isVerified: true,
            auths: [authProvider]
        };
        const supperAdmin = await user_model_1.User.create(payload);
        console.log("Supper Admin Created Successfully");
        console.log(supperAdmin);
    }
    catch (error) {
        console.log(error);
    }
};
exports.seedSupperAdmin = seedSupperAdmin;
