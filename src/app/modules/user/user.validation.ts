import z from "zod";
import { IsActive, Role } from "./user.interface";

export const createUserZodSchema = z.object({
    name: z.string({ error: "Name Must be String" }).min(5, { message: "Name to short minimum 5 character long" }).max(30, { message: "Name to long" }),
    email: z.string({ error: "Email must be string" })
        .email({ message: "Invalid email address format" })
        .min(5, { message: "Email must be at lest 5 character long" })
        .max(100, { message: "Email can not exceed 100 characters" }),
    password: z.string().min(8)
        .regex(/^(?=.*[A-Z])/, { message: "Password must contain at least 1 uppercase" })
        .regex(/^(?=.*[!@#$%^&*])/, { message: "Password must contain at least 1 special character" })
        .regex(/^(?=.*\d)/, { message: "Password must contain at lest 1 number" }),
    phone: z.string({ error: "Phone Number must be String" })
        .regex(/^(?:\+?88)?01[3-9]\d{8}$/, { message: "Please provide a valid Bangladeshi phone number." })
        .optional(),
    address: z.string({ error: "Address must be string" })
        .max(200, { message: "Address can not exceed 200 characters" })
        .optional()

});


export const updateUserZodSchema = z.object({
    name: z.string({ error: "Name Must be String" }).min(5, { message: "Name to short minimum 5 character long" }).max(30, { message: "Name to long" }).optional(),
    phone: z.string({ error: "Phone Number must be String" })
        .regex(/^(?:\+?88)?01[3-9]\d{8}$/, { message: "Please provide a valid Bangladeshi phone number." })
        .optional(),
    isDeleted: z.boolean({ error: "isDeleted must be true of false" }).optional(),
    isActive: z.enum(Object.values(IsActive) as [string]).optional,
    isVerified: z.boolean({ error: " isVerified must be true of false" }).optional(),
    role: z.enum(Object.values(Role) as [string]).optional(),
    address: z.string({ error: "Address must be string" })
        .max(200, { message: "Address can not exceed 200 characters" })
        .optional()

});