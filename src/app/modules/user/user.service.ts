
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes"
import { envVars } from "../../config/env";

const createUser = async (payload: Partial<IUser>) => {
    const { email, password, ...rest } = payload;
    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist")
    };


    const hashPassword = await bcrypt.hash(password as string, Number(process.env.BCRYPT_SALT_ROUND));

    // const isPasswordMatch = await bcrypt.compare(password as string,hashPassword)

    const authProvider: IAuthProvider = { provider: "credentials", providerId: email as string }

    const user = await User.create({
        email,
        password: hashPassword,
        auths: [authProvider],
        ...rest
    })
    return user
};


const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {


    const ifUserExist = await User.findById(userId);

    if (!ifUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }


    // if (ifUserExist.isDeleted || ifUserExist.isActive === IsActive.BLOCKED) {
    //     throw new AppError(httpStatus.FORBIDDEN, "this user can't be updated ")
    // }


    if (payload.role) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
            throw new AppError(httpStatus.FORBIDDEN, "your are not authorized");
        }


        if (payload.role === Role.SUPPER_ADMIN && decodedToken.role === Role.ADMIN) {
            throw new AppError(httpStatus.FORBIDDEN, "your are not authorized")
        }
    }

    if (payload.isActive || payload.isDeleted || payload.isVerified) {
        if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
            throw new AppError(httpStatus.FORBIDDEN, "your are not authorized");
        }
    }

    if (payload.password) {
        payload.password = await bcrypt.hash(payload.password, envVars.BCRYPT_SALT_ROUND)
    }


    const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true })

    return newUpdatedUser
}


const getAllUsers = async () => {
    const users = await User.find({});
    const totalUsers = await User.countDocuments()
    return {
        data: users,
        meta: {
            total: totalUsers
        }
    }
}


export const UserServices = {
    createUser,
    getAllUsers,
    updateUser
}