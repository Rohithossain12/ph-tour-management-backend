/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IsActive,  } from "../user/user.interface"
import { User } from "../user/user.model";
import { createNewAccessTokenWithRefreshToken } from "../../utils/user.token";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import jwt from "jsonwebtoken"
import { sendEmail } from "../../utils/sendEmail";
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


const getNewAccessToken = async (refreshToken: string) => {
    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken)

    return {
        accessToken: newAccessToken,


    }


}


const changePassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {

    const user = await User.findById(decodedToken.userId)
    const isOldPasswordMatch = await bcrypt.compare(oldPassword, user?.password as string)
    if (!isOldPasswordMatch) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Old Password does not match")
    }

    user!.password = await bcrypt.hash(newPassword as string, Number(envVars.BCRYPT_SALT_ROUND))

    user?.save()

}


const resetPassword = async (payload: Record<string, any>, decodedToken: JwtPayload) => {

    if (payload.id != decodedToken.userId) {
        throw new AppError(401, "You can not reset your password")
    }

    const isUserExist = await User.findById(decodedToken.userId)
    if (!isUserExist) {
        throw new AppError(401, "User does not exist")
    }

    const hashPassword = await bcrypt.hash(
        payload.newPassword,
        Number(envVars.BCRYPT_SALT_ROUND)
    )



    isUserExist.password = hashPassword
    await isUserExist.save()
}



const forgotPassword = async (email: string) => {
    const isUserExist = await User.findOne({ email })
    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User does not exist")
    };


    if (!isUserExist.isVerified) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is not verified")
    }

    if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
        throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`)
    };
    if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted")
    };


    const JwtPayload = {
        userId: isUserExist._id,
        email: isUserExist.email,
        role: isUserExist.role
    }


    const resetToken = jwt.sign(JwtPayload, envVars.JWT_ACCESS_SECRET, {
        expiresIn: "10m"
    })

    const resetUiLink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`
    sendEmail({
        to: isUserExist.email,
        subject: "Password Reset",
        templateName: "forgotPassword",
        templateData: {
            name: isUserExist.name,
            resetUiLink
        }
    })
}


const setPassword = async (userId: string, plainPassword: string) => {

    const user = await User.findById(userId)

    if (!user) {
        throw new AppError(401, "User not Found")
    }


    if (user.password && user.auths.some(providerObject => providerObject.provider === "google")) {
        throw new AppError(httpStatus.BAD_REQUEST, "You have already set your password. Now you can change the password from your profile password update")
    }



    const hashPassword = await bcrypt.hash(
        plainPassword,
        Number(envVars.BCRYPT_SALT_ROUND)
    )

    const credentialProvider: IAuthProvider = {
        provider: "credentials",
        providerId: user.email
    }
    const auths: IAuthProvider[] = [...user.auths, credentialProvider];

    user.password = hashPassword;
    user.auths = auths;
    await user.save()


}


export const AuthServices = {
    // credentialsLogin,
    getNewAccessToken,
    resetPassword,
    changePassword,
    setPassword,
    forgotPassword
}