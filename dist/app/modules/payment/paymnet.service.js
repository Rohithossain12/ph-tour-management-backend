"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const booking_interface_1 = require("../booking/booking.interface");
const booking_model_1 = require("../booking/booking.model");
const payment_interface_1 = require("./payment.interface");
const payment_model_1 = require("./payment.model");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const sslCommerz_service_1 = require("../SSLCommerz/sslCommerz.service");
const invoice_1 = require("../../utils/invoice");
const sendEmail_1 = require("../../utils/sendEmail");
const cloudinary_config_1 = require("../../config/cloudinary.config");
const initPayment = async (bookingId) => {
    const payment = await payment_model_1.Payment.findOne({ booking: bookingId });
    if (!payment) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Payment Not Found.You have not book this Tour");
    }
    const booking = await booking_model_1.Booking.findById(payment.booking);
    const userAddress = (booking === null || booking === void 0 ? void 0 : booking.user).address;
    const userName = (booking === null || booking === void 0 ? void 0 : booking.user).address;
    const userEmail = (booking === null || booking === void 0 ? void 0 : booking.user).email;
    const userPhoneNumber = (booking === null || booking === void 0 ? void 0 : booking.user).phone;
    const sslPayload = {
        address: userAddress,
        email: userEmail,
        phoneNumber: userPhoneNumber,
        name: userName,
        amount: payment.amount,
        transactionId: payment.transactionId
    };
    const sslPayment = await sslCommerz_service_1.SSLService.sslPaymentInit(sslPayload);
    return {
        paymentUrl: sslPayment.GatewayPageUrl
    };
};
const successPayment = async (query) => {
    // Update Booking Status to Confirm 
    // Update Payment Status to PAID
    const session = await booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const updatedPayment = await payment_model_1.Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: payment_interface_1.PAYMENT_STATUS.PAID,
        }, { new: true, runValidators: true, session });
        if (!updatedPayment) {
            throw new AppError_1.default(401, "Payment not found");
        }
        const updatedBooking = await booking_model_1.Booking
            .findByIdAndUpdate(updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.booking, { status: booking_interface_1.BOOKING_STATUS.COMPLETE }, { new: true, runValidators: true, session })
            .populate("tour", "title")
            .populate("user", "name email");
        if (!updatedBooking) {
            throw new AppError_1.default(401, "Booking not found");
        }
        const invoiceData = {
            bookingDate: updatedBooking.createdAt,
            guestCount: updatedBooking.guestCount,
            totalAmount: updatedPayment.amount,
            tourTitle: updatedBooking.tour.title,
            transactionId: updatedPayment.transactionId,
            userName: updatedBooking.user.name
        };
        const pdfBuffer = await (0, invoice_1.generatePdf)(invoiceData);
        const cloudinaryResult = await (0, cloudinary_config_1.uploadBufferToCloudinary)(pdfBuffer, "invoice");
        await payment_model_1.Payment.findByIdAndUpdate(updatedPayment._id, { invoiceUrl: cloudinaryResult === null || cloudinaryResult === void 0 ? void 0 : cloudinaryResult.secure_url }, { runValidators: true, session });
        await (0, sendEmail_1.sendEmail)({
            to: updatedBooking.user.email,
            subject: "Your Booking Invoice",
            templateName: "invoice",
            templateData: invoiceData,
            attachments: [
                {
                    fileName: "invoice.pdf",
                    content: pdfBuffer,
                    contentType: "application/pdf"
                }
            ]
        });
        await session.commitTransaction();
        session.endSession();
        return { success: true, message: "Payment Completed Successfully" };
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
const failPayment = async (query) => {
    // Update Booking Status to FAIL
    // Update Payment Status to FAIL
    const session = await booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const updatedPayment = await payment_model_1.Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: payment_interface_1.PAYMENT_STATUS.FAILED,
        }, { new: true, runValidators: true, session });
        await booking_model_1.Booking
            .findByIdAndUpdate(updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.booking, { status: booking_interface_1.BOOKING_STATUS.FAILED }, { runValidators: true, session });
        await session.commitTransaction();
        session.endSession();
        return { success: false, message: "Payment failed" };
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
const cancelPayment = async (query) => {
    // Update Booking Status to CANCEL
    // Update Payment Status to CANCEL
    const session = await booking_model_1.Booking.startSession();
    session.startTransaction();
    try {
        const updatedPayment = await payment_model_1.Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: payment_interface_1.PAYMENT_STATUS.CANCELLED,
        }, { runValidators: true, session });
        await booking_model_1.Booking
            .findByIdAndUpdate(updatedPayment === null || updatedPayment === void 0 ? void 0 : updatedPayment.booking, { status: booking_interface_1.BOOKING_STATUS.CANCEL }, { runValidators: true, session });
        await session.commitTransaction();
        session.endSession();
        return { success: false, message: "Payment Cancelled" };
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
const getInvoiceDownloadUrl = async (paymentId) => {
    const payment = await payment_model_1.Payment.findById(paymentId)
        .select("invoiceUrl");
    if (!payment) {
        throw new AppError_1.default(401, "Payment not found");
    }
    if (!payment.invoiceUrl) {
        throw new AppError_1.default(401, "No invoice found");
    }
    return payment.invoiceUrl;
};
exports.PaymentService = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    getInvoiceDownloadUrl
};
