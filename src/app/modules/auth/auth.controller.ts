import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { AuthServices } from "./auth.service";

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {


    const loginInfo = await AuthServices.credentialsLogin(req.body);


    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User Login Successfully",
        data: loginInfo,
    })

})
export const AuthControllers = {
    credentialsLogin
}