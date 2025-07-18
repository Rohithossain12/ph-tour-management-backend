
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";
import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes"

const createUser = async (payload: Partial<IUser>) => {
    const { email, password, ...rest } = payload;
    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist")
    };


    const hashPassword = await bcrypt.hash(password as string, 10);

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
    getAllUsers
}