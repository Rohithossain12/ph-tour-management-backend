"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const booking_service_1 = require("./booking.service");
const createBooking = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const decodeToken = req.user;
    const booking = await booking_service_1.BookingService.createBooking(req.body, decodeToken.userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully",
        data: booking,
    });
});
const getUserBookings = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const decodeToken = req.user;
    const bookings = await booking_service_1.BookingService.getUserBookings(decodeToken.userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Bookings retrieved successfully",
        data: bookings,
    });
});
const getSingleBooking = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const bookingId = req.params.id;
    const booking = await booking_service_1.BookingService.getBookingById(bookingId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Booking retrieved successfully",
        data: booking,
    });
});
const getAllBookings = (0, catchAsync_1.catchAsync)(async (req, res) => {
    await booking_service_1.BookingService.getAllBookings();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Bookings retrieved successfully",
        data: {},
        // meta: {},
    });
});
const updateBookingStatus = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { bookingId } = req.params;
    const { status } = req.body;
    const updated = await booking_service_1.BookingService.updateBookingStatus(bookingId, status);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: 200,
        success: true,
        message: "Booking Status Updated Successfully",
        data: updated,
    });
});
exports.BookingController = {
    createBooking,
    getAllBookings,
    getSingleBooking,
    getUserBookings,
    updateBookingStatus,
};
