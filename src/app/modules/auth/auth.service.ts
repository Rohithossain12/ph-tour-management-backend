/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface"
import httpStatus from "http-status-codes";
import { User } from "../user/user.model";
import bcrypt from "bcryptjs";
import { createNewAccessTokenWithRefreshToken, createUserToken } from "../../utils/user.token";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";



const credentialsLogin = async (payload: Partial<IUser>) => {
    const { email, password } = payload;
    const isUserExist = await User.findOne({ email });
    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "Email does not exist")
    };

    const isPasswordMatch = await bcrypt.compare(password as string, isUserExist.password as string)

    if (!isPasswordMatch) {
        throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password")
    };


    const userTokens = createUserToken(isUserExist)

    const { password: pass, ...rest } = isUserExist.toObject()

    return {
        accessToken: userTokens.accessToken,
        refreshToken: userTokens.refreshToken,
        user: rest

    }





}


const getNewAccessToken = async (refreshToken: string) => {
    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken)

    return {
        accessToken: newAccessToken,


    }


}


const resetPassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {

    const user = await User.findById(decodedToken.userId)
    const isOldPasswordMatch = await bcrypt.compare(oldPassword, user?.password as string)
    if (!isOldPasswordMatch) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Old Password does not match")
    }

    user!.password = await bcrypt.hash(newPassword as string, Number(envVars.BCRYPT_SALT_ROUND))

    user?.save()
 
}


export const AuthServices = {
    credentialsLogin,
    getNewAccessToken,
    resetPassword
}