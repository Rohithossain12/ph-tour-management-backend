"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserZodSchema = exports.createUserZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const user_interface_1 = require("./user.interface");
exports.createUserZodSchema = zod_1.default.object({
    name: zod_1.default.string({ error: "Name Must be String" }).min(5, { message: "Name to short minimum 5 character long" }).max(30, { message: "Name to long" }),
    email: zod_1.default.string({ error: "Email must be string" })
        .email({ message: "Invalid email address format" })
        .min(5, { message: "Email must be at lest 5 character long" })
        .max(100, { message: "Email can not exceed 100 characters" }),
    password: zod_1.default.string().min(8)
        .regex(/^(?=.*[A-Z])/, { message: "Password must contain at least 1 uppercase" })
        .regex(/^(?=.*[!@#$%^&*])/, { message: "Password must contain at least 1 special character" })
        .regex(/^(?=.*\d)/, { message: "Password must contain at lest 1 number" }),
    phone: zod_1.default.string({ error: "Phone Number must be String" })
        .regex(/^(?:\+?88)?01[3-9]\d{8}$/, { message: "Please provide a valid Bangladeshi phone number." })
        .optional(),
    address: zod_1.default.string({ error: "Address must be string" })
        .max(200, { message: "Address can not exceed 200 characters" })
        .optional()
});
exports.updateUserZodSchema = zod_1.default.object({
    name: zod_1.default.string({ error: "Name Must be String" }).min(5, { message: "Name to short minimum 5 character long" }).max(30, { message: "Name to long" }).optional(),
    phone: zod_1.default.string({ error: "Phone Number must be String" })
        .regex(/^(?:\+?88)?01[3-9]\d{8}$/, { message: "Please provide a valid Bangladeshi phone number." })
        .optional(),
    isDeleted: zod_1.default.boolean({ error: "isDeleted must be true of false" }).optional(),
    isActive: zod_1.default.enum(Object.values(user_interface_1.IsActive)).optional,
    isVerified: zod_1.default.boolean({ error: " isVerified must be true of false" }).optional(),
    role: zod_1.default.enum(Object.values(user_interface_1.Role)).optional(),
    address: zod_1.default.string({ error: "Address must be string" })
        .max(200, { message: "Address can not exceed 200 characters" })
        .optional()
});
