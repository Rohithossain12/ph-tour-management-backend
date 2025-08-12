import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { BookingService } from "./booking.service";

const createBooking = catchAsync(async (req: Request, res: Response) => {
    const decodeToken = req.user as JwtPayload
    const booking = await BookingService.createBooking(req.body, decodeToken.userId);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully",
        data: booking,
    });
});

const getUserBookings = catchAsync(
    async (req: Request, res: Response) => {
        const decodeToken = req.user as JwtPayload;
        const bookings = await BookingService.getUserBookings(decodeToken.userId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Bookings retrieved successfully",
            data: bookings,
        });
    }
);

const getSingleBooking = catchAsync(
    async (req: Request, res: Response) => {
        const bookingId = req.params.id;
        const booking = await BookingService.getBookingById(bookingId);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Booking retrieved successfully",
            data: booking,
        });
    }
);


const getAllBookings = catchAsync(
    async (req: Request, res: Response) => {

        await BookingService.getAllBookings();
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Bookings retrieved successfully",
            data: {},
            // meta: {},
        });
    }
);

const updateBookingStatus = catchAsync(
    async (req: Request, res: Response) => {
        const { bookingId } = req.params;
        const { status } = req.body;

        const updated = await BookingService.updateBookingStatus(
            bookingId,
            status);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Booking Status Updated Successfully",
            data: updated,
        });
    }
)


export const BookingController = {
    createBooking,
    getAllBookings,
    getSingleBooking,
    getUserBookings,
    updateBookingStatus,
}