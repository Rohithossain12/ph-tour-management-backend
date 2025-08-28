/* eslint-disable @typescript-eslint/no-explicit-any */

import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import { BOOKING_STATUS, IBooking } from "./booking.interface";
import httpStatus from "http-status-codes";
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
    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
    if (!user?.phone || !user?.address) throw new AppError(httpStatus.BAD_REQUEST, "Please update your profile to book a tour");

    const tour = await Tour.findById(payload.tour).select("costFrom title");
    if (!tour) throw new AppError(httpStatus.NOT_FOUND, "Tour not found");
    if (!payload.guestCount || payload.guestCount <= 0) throw new AppError(httpStatus.BAD_REQUEST, "Guest count is required");

    const amount = Number(tour.costFrom) * Number(payload.guestCount);

    const booking = await Booking.create([{ user: userId, status: BOOKING_STATUS.PENDING, ...payload }], { session });

    const payment = await Payment.create([{ booking: booking[0]._id, status: PAYMENT_STATUS.UNPAID, transactionId, amount }], { session });

    const updatedBooking = await Booking.findByIdAndUpdate(
      booking[0]._id,
      { payment: payment[0]._id },
      { new: true, runValidators: true, session }
    )
    .populate("user", "name email phone address")
    .populate("tour", "title costFrom")
    .populate("payment");

    if (!updatedBooking) throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to update booking with payment");

    const sslPayload: ISSLCommerz = {
      address: (updatedBooking.user as any)?.address ?? "",
      name: (updatedBooking.user as any)?.name ?? "",
      email: (updatedBooking.user as any)?.email ?? "",
      phoneNumber: (updatedBooking.user as any)?.phone ?? "",
      amount,
      transactionId
    };

    const sslPayment = await SSLService.sslPaymentInit(sslPayload);

    await session.commitTransaction();
    session.endSession();

    return {
      booking: updatedBooking,
      paymentUrl: sslPayment.paymentUrl 
    };

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
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
