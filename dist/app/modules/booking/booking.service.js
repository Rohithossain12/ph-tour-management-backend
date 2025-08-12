"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_model_1 = require("../user/user.model");
const booking_interface_1 = require("./booking.interface");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const booking_model_1 = require("./booking.model");
const payment_model_1 = require("../payment/payment.model");
const payment_interface_1 = require("../payment/payment.interface");
const tour_model_1 = require("../tour/tour.model");
const sslCommerz_service_1 = require("../SSLCommerz/sslCommerz.service");
const getTransctionId_1 = require("../../utils/getTransctionId");
const createBooking = async (payload, userId) => {
    const transactionId = (0, getTransctionId_1.getTransactionId)();
    const session = await booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const user = await user_model_1.User.findById(userId);
        if (!(user === null || user === void 0 ? void 0 : user.phone) || !user.address) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Please Update your profile to book a tour");
        }
        const tour = await tour_model_1.Tour.findById(payload.tour).select("costFrom");
        if (!(tour === null || tour === void 0 ? void 0 : tour.costFrom)) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, " No Tour Cost Found");
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const amount = Number(tour.costFrom) * Number(payload.guestCount);
        const booking = await booking_model_1.Booking.create([
            Object.assign({ user: userId, status: booking_interface_1.BOOKING_STATUS.PENDING }, payload)
        ], { session });
        const payment = await payment_model_1.Payment.create([
            {
                booking: booking[0]._id,
                status: payment_interface_1.PAYMENT_STATUS.UNPAID,
                transactionId: transactionId,
                amount: amount
            }
        ], { session });
        const updatedBooking = await booking_model_1.Booking
            .findByIdAndUpdate(booking[0]._id, { payment: payment[0]._id }, { new: true, runValidators: true, session })
            .populate("user", "name email phone address")
            .populate("tour", "title costFrom")
            .populate("payment");
        const userAddress = (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).address;
        const userName = (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).address;
        const userEmail = (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).email;
        const userPhoneNumber = (updatedBooking === null || updatedBooking === void 0 ? void 0 : updatedBooking.user).phone;
        const sslPayload = {
            address: userAddress,
            email: userEmail,
            phoneNumber: userPhoneNumber,
            name: userName,
            amount: amount,
            transactionId: transactionId
        };
        const sslPayment = await sslCommerz_service_1.SSLService.sslPaymentInit(sslPayload);
        await session.commitTransaction();
        session.endSession();
        return {
            paymentUrl: sslPayment.GatewayPageUrl,
            booking: updatedBooking
        };
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
const getUserBookings = async (userId) => {
    const bookings = await booking_model_1.Booking.find({ user: userId })
        .populate("user", "name email phone address")
        .populate("tour", "title costFrom")
        .populate("payment");
    return bookings;
};
const getBookingById = async (bookingId) => {
    const booking = await booking_model_1.Booking.findById(bookingId)
        .populate("user", "name email phone address")
        .populate("tour", "title costFrom")
        .populate("payment");
    if (!booking) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking not found");
    }
    return booking;
};
const updateBookingStatus = async (bookingId, status) => {
    const updatedBooking = await booking_model_1.Booking.findByIdAndUpdate(bookingId, { status }, { new: true, runValidators: true })
        .populate("user", "name email phone address")
        .populate("tour", "title costFrom")
        .populate("payment");
    if (!updatedBooking) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking not found");
    }
    return updatedBooking;
};
const getAllBookings = async () => {
    const bookings = await booking_model_1.Booking.find()
        .populate("user", "name email phone address")
        .populate("tour", "title costFrom")
        .populate("payment");
    return bookings;
};
exports.BookingService = {
    createBooking,
    getUserBookings,
    getBookingById,
    updateBookingStatus,
    getAllBookings,
};
