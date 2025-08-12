/* eslint-disable @typescript-eslint/no-explicit-any */

import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { BOOKING_STATUS, IBooking } from "./booking.interface";
import httpStatus from "http-status-codes"
import { Booking } from "./booking.model";
import { Payment } from "../payment/payment.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Tour } from "../tour/tour.model";
import { SSLService } from "../SSLCommerz/sslCommerz.service";
import { ISSLCommerz } from "../SSLCommerz/sslCommerz.interface";
import { getTransactionId } from "../../utils/getTransctionId";




const createBooking = async (payload: Partial<IBooking>, userId: string) => {
    const transactionId = getTransactionId();

    const session = await Booking.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(userId);


        if (!user?.phone || !user.address) {
            throw new AppError(httpStatus.BAD_REQUEST, "Please Update your profile to book a tour")
        }

        const tour = await Tour.findById(payload.tour).select("costFrom")

        if (!tour?.costFrom) {
            throw new AppError(httpStatus.BAD_REQUEST, " No Tour Cost Found")
        }


        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const amount = Number(tour.costFrom) * Number(payload.guestCount!)

        const booking = await Booking.create([
            {
                user: userId,
                status: BOOKING_STATUS.PENDING,
                ...payload
            }
        ], { session })


        const payment = await Payment.create([
            {
                booking: booking[0]._id,
                status: PAYMENT_STATUS.UNPAID,
                transactionId: transactionId,
                amount: amount

            }
        ], { session })

        const updatedBooking = await Booking
            .findByIdAndUpdate(
                booking[0]._id,
                { payment: payment[0]._id },
                { new: true, runValidators: true, session })
            .populate("user", "name email phone address")
            .populate("tour", "title costFrom")
            .populate("payment");


        const userAddress = (updatedBooking?.user as any).address
        const userName = (updatedBooking?.user as any).address
        const userEmail = (updatedBooking?.user as any).email
        const userPhoneNumber = (updatedBooking?.user as any).phone

        const sslPayload: ISSLCommerz = {
            address: userAddress,
            email: userEmail,
            phoneNumber: userPhoneNumber,
            name: userName,
            amount: amount,
            transactionId: transactionId
        }
        const sslPayment = await SSLService.sslPaymentInit(sslPayload)

        await session.commitTransaction();
        session.endSession();
        return {
            paymentUrl: sslPayment.GatewayPageUrl,
            booking: updatedBooking
        }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error
    }



};





const getUserBookings = async (userId: string) => {
    const bookings = await Booking.find({ user: userId })
        .populate("user", "name email phone address")
        .populate("tour", "title costFrom")
        .populate("payment");
    return bookings;
};

const getBookingById = async (bookingId: string) => {
  
    const booking = await Booking.findById(bookingId)
        .populate("user", "name email phone address")
        .populate("tour", "title costFrom")
        .populate("payment");

    if (!booking) {
        throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    }
    return booking;
};

const updateBookingStatus = async (bookingId: string, status: BOOKING_STATUS) => {
    const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        { status },
        { new: true, runValidators: true }
    )
        .populate("user", "name email phone address")
        .populate("tour", "title costFrom")
        .populate("payment");

    if (!updatedBooking) {
        throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    }
    return updatedBooking;
};

const getAllBookings = async () => {
    const bookings = await Booking.find()
        .populate("user", "name email phone address")
        .populate("tour", "title costFrom")
        .populate("payment");

    return bookings;
};


export const BookingService = {
    createBooking,
    getUserBookings,
    getBookingById,
    updateBookingStatus,
    getAllBookings,
};
