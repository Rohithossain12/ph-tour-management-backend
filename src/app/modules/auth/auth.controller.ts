/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { AuthServices } from "./auth.service";
import AppError from "../../errorHelpers/AppError";
import { setAuthCookie } from "../../utils/setCookie";
import { createUserToken } from "../../utils/user.token";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import passport from "passport";


const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    // const loginInfo = await AuthServices.credentialsLogin(req.body);

    passport.authenticate("local", async (err: any, user: any, info: any) => {

        if (err) {
            return next(new AppError(401, err))
        }

        if (!user) {
            return next(new AppError(401, info.message))
        }


        const userTokens = await createUserToken(user)
        const { password: pass, ...rest } = user.toObject()

        setAuthCookie(res, userTokens)

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "User Login Successfully",
            data: {
                accessToken: userTokens.accessToken,
                refreshToken: userTokens.refreshToken,
                user: rest
            },
        })

    })(req, res, next)



})




const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, "No refresh token received from cookies")
    }

    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken as string);


    res.cookie("accessToken", tokenInfo.accessToken, {
        httpOnly: true,
        secure: false
    })

    // setAuthCookie(res, tokenInfo);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "New Access Token Retrived Successfully",
        data: tokenInfo,
    })

})

// logout

const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {



    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    })


    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User Logout Successfully",
        data: null,
    })

})


// change Password
const changePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user;

    await AuthServices.changePassword(oldPassword, newPassword, decodedToken as JwtPayload)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password Reset Successfully",
        data: null,
    })

})

// Reset Password
const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user;
    await AuthServices.resetPassword( req.body, decodedToken as JwtPayload)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password Reset Successfully",
        data: null,
    })

})

// Forgot Password
const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

  const {email}=req.body;

    await AuthServices.forgotPassword(email,)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Email sent  Successfully",
        data: null,
    })

})




const setPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const decodedToken = req.user as JwtPayload;
    const {password} =req.body;
    await AuthServices.setPassword(decodedToken.userId,password )

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password Reset Successfully",
        data: null,
    })

})




const googleCallbackController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let redirectTo = req.query.state ? req.query.state as string : "";
    const user = req.user;

    if (redirectTo.startsWith("/")) {
        redirectTo = redirectTo.slice(1)
    }

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }

    const tokenInfo = createUserToken(user)
    setAuthCookie(res, tokenInfo)

    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`)


})




export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logout,
    resetPassword,
    googleCallbackController,
    changePassword,
    setPassword,
    forgotPassword
}