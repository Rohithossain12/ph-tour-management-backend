/* eslint-disable @typescript-eslint/no-explicit-any */

import { Booking } from "../booking/booking.model";
import { Division } from "../division/division.model";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { Payment } from "../payment/payment.model";
import { Tour } from "../tour/tour.model";
import { IsActive } from "../user/user.interface";
import { User } from "../user/user.model";


const now = new Date();
const sevenDaysAgo = new Date(now).setDate(now.getDate() - 7);
const thirtyDaysAgo = new Date(now).setDate(now.getDate() - 30);



const getUserStats = async () => {
    const totalUsersPromise = User.countDocuments();
    const totalActiveUsersPromise = User.countDocuments({ isActive: IsActive.ACTIVE });
    const totalInActiveUsersPromise = User.countDocuments({ isActive: IsActive.INACTIVE });
    const totalBlockedUsersPromise = User.countDocuments({ isActive: IsActive.BLOCKED });
    const newUserInLastSevenDaysPromise = User.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
    })
    const newUserInLastThirtyDaysPromise = User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
    })


    const userByRolePromise = User.aggregate([
        // stage 1 : Grouping user by role and count total users each role
        {
            $group: {
                _id: "$role",
                count: { $sum: 1 }
            }
        }


    ])

    const [totalUsers, totalActiveUsers, totalInActiveUsers, totalBlockedUsers, newUserInLastSevenDays, newUserInLastThirtyDays, userByRole] = await Promise.all([
        totalUsersPromise,
        totalActiveUsersPromise,
        totalInActiveUsersPromise,
        totalBlockedUsersPromise,
        newUserInLastSevenDaysPromise,
        newUserInLastThirtyDaysPromise,
        userByRolePromise

    ])

    return {
        totalUsers,
        totalActiveUsers,
        totalInActiveUsers,
        totalBlockedUsers,
        newUserInLastSevenDays,
        newUserInLastThirtyDays,
        userByRole
    }
}


const getTourStats = async () => {
    const totalTourPromise = Tour.countDocuments();
    const totalTourByTourTypePromise = Tour.aggregate([
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


    ])


    const avgTourCostPromise = Tour.aggregate([
        // Stage-1 --> group the cost from, do some and average the sum
        {
            $group: {
                _id: null,
                avgCostFrom: { $avg: "costFrom" }
            }
        }

    ])



    const totalTourByDivisionPromise = Division.aggregate([
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
    ])


    const totalHighestTourBookedPromise = Booking.aggregate([
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

    ])

    const [totalTour, totalTourByTourType, avgTourCost, totalTourByDivision, totalHighestTourBooked] = await Promise.all([
        totalTourPromise,
        totalTourByTourTypePromise,
        avgTourCostPromise,
        totalTourByDivisionPromise,
        totalHighestTourBookedPromise
    ])
    return {
        totalTour,
        totalTourByTourType,
        avgTourCost,
        totalTourByDivision,
        totalHighestTourBooked

    }
}




const getBookingStats = async () => {
    const totalBookingPromise = Booking.countDocuments();

    const totalBookingByStatusPromise = Booking.aggregate([
        // Stage-1 --> group stage
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ])


    const bookingsPerTourPromise = Booking.aggregate([
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

    ])


    const avgGuestCountPerBookingPromise = Booking.aggregate([
        // Stage-1 --> Group stage
        {
            $group: {
                _id: null,
                avgGuestCount: { $avg: "$guestCount" }
            }
        }
    ])


    const bookingsLastSevenDaysPromise = Booking.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
    })
    const bookingsLastThirtyDaysPromise = Booking.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
    })


    const totalBookingsByUniqueUserPromise = Booking.distinct("user").then((user: any) => user.length)

    const [totalBooking, totalBookingByStatus, bookingsPerTour, avgGuestCountPerBooking, bookingsLastSevenDays, bookingsLastThirtyDays, totalBookingsByUniqueUser] = await Promise.all([
        totalBookingPromise,
        totalBookingByStatusPromise,
        bookingsPerTourPromise,
        avgGuestCountPerBookingPromise,
        bookingsLastSevenDaysPromise,
        bookingsLastThirtyDaysPromise,
        totalBookingsByUniqueUserPromise
    ])

    return {
        totalBooking,
        totalBookingByStatus,
        bookingsPerTour,
        avgGuestCountPerBooking: avgGuestCountPerBooking[0].avgGuestCount,
        bookingsLastSevenDays,
        bookingsLastThirtyDays,
        totalBookingsByUniqueUser
    }
}




const getPaymentStats = async () => {
    const totalPaymentPromise = Payment.countDocuments();



    const totalPaymentByStatusPromise = Payment.aggregate([
        // Stage -1 --> group Stage
        {
            $group: {
                _id: "status",
                count: { $sum: 1 }
            }
        }

    ])

    const totalRevenuePromise = Payment.aggregate([
        // Stage-1 --> match stage
        {
            $match: { status: PAYMENT_STATUS.PAID }
        },
        // Stage-2 --> group stage
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$amount" }
            }
        }
    ])


    const avgPaymentAmountPromise = Payment.aggregate([
        // Stage-1 --> Group Stage
        {
            $group: {
                _id: null,
                avgPayment: { $avg: "$amount" }
            }
        }
    ])

    const paymentGatewayDataPromise = Payment.aggregate([
        // stage-1 --> group stage
        {
            $group: {
                _id: { $ifNull: ["$paymentGatewayData.status", "UNKNOWN"] },
                count: { $sum: 1 }
            }
        }
    ])


    const [totalPayment, totalRevenue, totalPaymentByStatus, avgPaymentAmount, paymentGatewayData] = await Promise.all([
        totalPaymentPromise,
        totalPaymentByStatusPromise,
        totalRevenuePromise,
        avgPaymentAmountPromise,
        paymentGatewayDataPromise
    ])
    return {
        totalPayment,
        totalPaymentByStatus,
        totalRevenue,
        avgPaymentAmount,
        paymentGatewayData
    }

}



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





export const StatsService = {
    getBookingStats,
    getPaymentStats,
    getTourStats,
    getUserStats
}
