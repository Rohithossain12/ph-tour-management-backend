"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
const booking_model_1 = require("../booking/booking.model");
const division_model_1 = require("../division/division.model");
const payment_interface_1 = require("../payment/payment.interface");
const payment_model_1 = require("../payment/payment.model");
const tour_model_1 = require("../tour/tour.model");
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const now = new Date();
const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);
const getUserStats = async () => {
    const totalUsersPromise = user_model_1.User.countDocuments();
    const totalActiveUsersPromise = user_model_1.User.countDocuments({ isActive: user_interface_1.IsActive.ACTIVE });
    const totalInActiveUsersPromise = user_model_1.User.countDocuments({ isActive: user_interface_1.IsActive.INACTIVE });
    const totalBlockedUsersPromise = user_model_1.User.countDocuments({ isActive: user_interface_1.IsActive.BLOCKED });
    const newUserInLastSevenDaysPromise = user_model_1.User.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
    });
    const newUserInLastThirtyDaysPromise = user_model_1.User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
    });
    const userByRolePromise = user_model_1.User.aggregate([
        // stage 1 : Grouping user by role and count total users each role
        {
            $group: {
                _id: "$role",
                count: { $sum: 1 }
            }
        }
    ]);
    const [totalUsers, totalActiveUsers, totalInActiveUsers, totalBlockedUsers, newUserInLastSevenDays, newUserInLastThirtyDays, userByRole] = await Promise.all([
        totalUsersPromise,
        totalActiveUsersPromise,
        totalInActiveUsersPromise,
        totalBlockedUsersPromise,
        newUserInLastSevenDaysPromise,
        newUserInLastThirtyDaysPromise,
        userByRolePromise
    ]);
    return {
        totalUsers,
        totalActiveUsers,
        totalInActiveUsers,
        totalBlockedUsers,
        newUserInLastSevenDays,
        newUserInLastThirtyDays,
        userByRole
    };
};
const getTourStats = async () => {
    const totalTourPromise = tour_model_1.Tour.countDocuments();
    const totalTourByTourTypePromise = tour_model_1.Tour.aggregate([
        // Stage-1 : connect the tour type model -> lookup Stage
        {
            $lookup: {
                from: "tourtypes",
                localField: "tourType",
                foreignField: "_id",
                as: "type"
            }
        },
        // stage-2 : unwind the array to object
        {
            $unwind: "$type"
        },
        // stage-3 --> Grouping tour types
        {
            $group: {
                _id: "$type.name",
                count: { $sum: 1 }
            }
        },
    ]);
    const avgTourCostPromise = tour_model_1.Tour.aggregate([
        // Stage-1 --> group the cost from, do some and average the sum
        {
            $group: {
                _id: null,
                avgCostFrom: { $avg: "costFrom" }
            }
        }
    ]);
    const totalTourByDivisionPromise = division_model_1.Division.aggregate([
        // Stage-1 : connect the division model -> lookup Stage
        {
            $lookup: {
                from: "divisions",
                localField: "division",
                foreignField: "_id",
                as: "division"
            }
        },
        // stage-2 : unwind the array to object
        {
            $unwind: "$division"
        },
        // stage-3 --> Grouping tour types
        {
            $group: {
                _id: "$division.name",
                count: { $sum: 1 }
            }
        },
    ]);
    const totalHighestTourBookedPromise = booking_model_1.Booking.aggregate([
        // Stage-1 : Group the tour
        {
            $group: {
                _id: "$tour",
                bookingCount: { $sum: 1 }
            }
        },
        // Stage-2 --> sort the tour
        {
            $sort: { bookingCount: -1 }
        },
        // Stage-3 -> limit 5
        {
            $limit: 5
        },
        // Stage-4: lookup
        {
            $lookup: {
                from: "tours",
                let: { tourId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$_id", "$$tourId"] }
                        }
                    }
                ],
                as: "tour"
            }
        },
        // Stage-5: unwind
        {
            $unwind: "$tour"
        },
        // Stage-: project
        {
            $project: {
                bookingCount: 1,
                "tour.title": 1,
                "tour.slug": 1
            }
        }
    ]);
    const [totalTour, totalTourByTourType, avgTourCost, totalTourByDivision, totalHighestTourBooked] = await Promise.all([
        totalTourPromise,
        totalTourByTourTypePromise,
        avgTourCostPromise,
        totalTourByDivisionPromise,
        totalHighestTourBookedPromise
    ]);
    return {
        totalTour,
        totalTourByTourType,
        avgTourCost,
        totalTourByDivision,
        totalHighestTourBooked
    };
};
const getBookingStats = async () => {
    const totalBookingPromise = booking_model_1.Booking.countDocuments();
    const totalBookingByStatusPromise = booking_model_1.Booking.aggregate([
        // Stage-1 --> group stage
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);
    const bookingsPerTourPromise = booking_model_1.Booking.aggregate([
        // Stage-1 --> group stage
        {
            $group: {
                _id: "$tour",
                bookingCount: { $sum: 1 }
            }
        },
        // Stage-2 --> Sort Stage
        {
            $sort: { bookingCount: -1 }
        },
        // Stage-3 --> Limit Stage
        {
            $limit: 10
        },
        // Stage-3 --> lookup Stage 
        {
            $lookup: {
                from: "tours",
                localField: "_id",
                foreignField: "_id",
                as: "tour"
            }
        },
        // Stage-5 --> Unwind stage
        {
            $unwind: "$tour"
        },
        // Stage-5 --> Project stage
        {
            $project: {
                bookingCount: 1,
                _id: 1,
                "tour.title": 1,
                "tour.slug": 1
            }
        }
    ]);
    const avgGuestCountPerBookingPromise = booking_model_1.Booking.aggregate([
        // Stage-1 --> Group stage
        {
            $group: {
                _id: null,
                avgGuestCount: { $avg: "$guestCount" }
            }
        }
    ]);
    const bookingsLastSevenDaysPromise = booking_model_1.Booking.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
    });
    const bookingsLastThirtyDaysPromise = booking_model_1.Booking.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
    });
    const totalBookingsByUniqueUserPromise = booking_model_1.Booking.distinct("user").then((user) => user.length);
    const [totalBooking, totalBookingByStatus, bookingsPerTour, avgGuestCountPerBooking, bookingsLastSevenDays, bookingsLastThirtyDays, totalBookingsByUniqueUser] = await Promise.all([
        totalBookingPromise,
        totalBookingByStatusPromise,
        bookingsPerTourPromise,
        avgGuestCountPerBookingPromise,
        bookingsLastSevenDaysPromise,
        bookingsLastThirtyDaysPromise,
        totalBookingsByUniqueUserPromise
    ]);
    return {
        totalBooking,
        totalBookingByStatus,
        bookingsPerTour,
        avgGuestCountPerBooking: avgGuestCountPerBooking[0].avgGuestCount,
        bookingsLastSevenDays,
        bookingsLastThirtyDays,
        totalBookingsByUniqueUser
    };
};
const getPaymentStats = async () => {
    const totalPaymentPromise = payment_model_1.Payment.countDocuments();
    const totalPaymentByStatusPromise = payment_model_1.Payment.aggregate([
        // Stage -1 --> group Stage
        {
            $group: {
                _id: "status",
                count: { $sum: 1 }
            }
        }
    ]);
    const totalRevenuePromise = payment_model_1.Payment.aggregate([
        // Stage-1 --> match stage
        {
            $match: { status: payment_interface_1.PAYMENT_STATUS.PAID }
        },
        // Stage-2 --> group stage
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$amount" }
            }
        }
    ]);
    const avgPaymentAmountPromise = payment_model_1.Payment.aggregate([
        // Stage-1 --> Group Stage
        {
            $group: {
                _id: null,
                avgPayment: { $avg: "$amount" }
            }
        }
    ]);
    const paymentGatewayDataPromise = payment_model_1.Payment.aggregate([
        // stage-1 --> group stage
        {
            $group: {
                _id: { $ifNull: ["$paymentGatewayData.status", "UNKNOWN"] },
                count: { $sum: 1 }
            }
        }
    ]);
    const [totalPayment, totalRevenue, totalPaymentByStatus, avgPaymentAmount, paymentGatewayData] = await Promise.all([
        totalPaymentPromise,
        totalPaymentByStatusPromise,
        totalRevenuePromise,
        avgPaymentAmountPromise,
        paymentGatewayDataPromise
    ]);
    return {
        totalPayment,
        totalPaymentByStatus,
        totalRevenue,
        avgPaymentAmount,
        paymentGatewayData
    };
};
/**
 * await Tour.updateMany(
        {
            // Only update where tourType or division is stored as a string
            $or: [
                { tourType: { $type: "string" } },
                { division: { $type: "string" } }
            ]
        },
        [
            {
                $set: {
                    tourType: { $toObjectId: "$tourType" },
                    division: { $toObjectId: "$division" }
                }
            }
        ]
    );
 */
exports.StatsService = {
    getBookingStats,
    getPaymentStats,
    getTourStats,
    getUserStats
};
