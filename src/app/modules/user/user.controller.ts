import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";





// const createUser = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         // const { name, email } = req.body;

//         const user = await UserServices.createUser(req.body)
//         res.status(httpStatus.CREATED).json({
//             message: "User created successfully",
//             user
//         })
//     } catch (error) {
//         console.log(error);
//         next(error);
//     }
// }


const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body)
    // res.status(httpStatus.CREATED).json({
    //     message: "User created successfully",
    //     user
    // })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User created successfully",
        data: user

    })
})


// const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const users = await UserServices.getAllUsers();
//         return users
//     } catch (err) {
//         console.log(err);
//         next(err)
//     }
// }



const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserServices.getAllUsers();
    // res.status(httpStatus.OK).json({
    //     success: true,
    //     message: "All Users Retrieved Successfully",
    //     data: users
    // })
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All Users Retrieved Successfully",
        data: result.data,
        meta:result.meta
    })
})


export const UserControllers = {
    createUser,
    getAllUsers
}