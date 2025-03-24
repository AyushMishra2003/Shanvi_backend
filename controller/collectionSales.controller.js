import collectionModel from "../models/collectionSales.js"
import OrderModel from "../models/order.model.js"
import AppError from "../utils/error.utlis.js"
import cloudinary from "cloudinary";
import fs from "fs/promises";
import { startOfDay, endOfDay } from 'date-fns';


const addCollectionSales = async (req, res, next) => {
    try {

        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return next(new AppError("All field are Required", 400))
        }

        const collectionSales = await new collectionModel({
            name,
            email,
            password
        })

        await collectionSales.save()

        res.status(200).json({
            success: true,
            message: "Sales Added Succesfully",
            data: collectionSales
        })

    } catch (error) {
        return next(new AppError(error.message, 500))
    }
}

const getCollectionSales = async (req, res, next) => {
    try {

        const allCollection = await collectionModel.find({})
            .populate("orderDetails")

        if (!allCollection) {
            return next(new AppError("Sales Not Get Succesfully"))
        }

        res.status(200).json({
            success: true,
            message: "Collection Sales Fetch Succesfully",
            data: allCollection
        })

    } catch (error) {
        return next(new AppError(error.message, 500))
    }
}


const loginCollectionSales = async (req, res, next) => {
    try {

        const { email, password } = req.body

        if (!email || !password) {
            return next(new AppError("All field are Required"))
        }

        const validSales = await collectionModel.findOne({ email })

        if (!validSales) {
            return next(new AppError("Sales not Found", 404))
        }

        if (validSales.password != password) {
            return next(new AppError("Password not Match", 400))
        }

        res.status(200).json({
            success: true,
            message: "Login Succesfully",
            data: validSales
        })


    } catch (error) {
        return next(new AppError(error.message, 500))
    }
}


const assignedOrder = async (req, res, next) => {
    try {
        const { orderId, salesId } = req.body



        if (!orderId || !salesId) {
            return next(new AppError("Details are Required", 400))
        }

        const validSales = await collectionModel.findById(salesId)

        if (!validSales) {
            return next(new AppError("Sales is Not Valid", 400))
        }

        // if(validSales.status=="deactive"){
        //       return next(new AppError("Sales is Not Active or In Field",400))
        // }

        const validOrder = await OrderModel.findById(orderId)

        if (!validOrder) {
            return next(new AppError("Order is Not Valid", 400))
        }

        if (validOrder.bookingStatus === "cancelled") {
            return (new AppError("Order is Cancelled", 400))
        }
        if (validOrder.bookingStatus === "completed") {
            return next(new AppError("Order is Already Completed", 400))
        }

        validSales.orderDetails.push(validOrder._id)
        validOrder.assignedTo = validSales._id

        await validSales.save()

        await validOrder.save()

        res.status(200).json({
            success: true,
            message: "Order Assigned Succesfully",
            dats: validSales
        })



    } catch (error) {
        console.log(error);

        return next(new AppError(error.message, 500))
    }
}


const getCollectionSalesDetail = async (req, res, next) => {
    try {

        const { id } = req.params


        const validSales = await collectionModel.findById(id)
            .populate("orderDetails")

        if (!validSales) {
            return next(new AppError("Sales is Not Valid", 400))
        }

        res.status(200).json({
            success: true,
            message: "Sales Detail are:-",
            data: validSales
        })

    } catch (error) {
        return next(new AppError(error.message, 500))
    }
}


const orderReportAdded = async (req, res, next) => {
    try {

        const { id } = req.params

        console.log(id);


        const validOrder = await OrderModel.findById(id)

        if (!validOrder) {
            return next(new AppError("Order is Not Valid", 400))
        }

        if (validOrder.reportStatus === "ready") {
            return next(new AppError("Report is Already Assigned", 400))
        }

        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: "lms",
            });

            console.log(result);

            if (result) {
                (validOrder.report.public_id = result.public_id),
                    (validOrder.report.secure_url = result.secure_url);
            }
            fs.rm(`uploads/${req.file.filename}`);
        }

        validOrder.reportStatus = "ready"

        await validOrder.save()

        res.status(200).json({
            success: true,
            message: "Report Added Succesfully",
            data: validOrder
        })



    } catch (e) {
        return next(new AppError(e.message, 500))
    }
}


const collectionOrderSummary = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Step 1: Validate Employee
        const validEmployee = await collectionModel.findById(id);
        if (!validEmployee) {
            return next(new AppError("Employee is Not Valid", 400));
        }

        // Step 2: Define Time Range for Today
        const todayStart = startOfDay(new Date()); // आज की शुरुआत
        const todayEnd = endOfDay(new Date());     // आज का अंत

        // Step 3: Aggregate Order Summary
        const orderSummary = await OrderModel.aggregate([
            {
                $match: {
                    _id: { $in: validEmployee.orderDetails }, // कर्मचारी की बुकिंग्स
                },
            },
            {
                $facet: {
                    // 1. कुल बुकिंग
                    totalBookings: [{ $count: "total" }],

                    // 2. आज की कुल बुकिंग
                    todayTotalBookings: [
                        {
                            $match: {
                                createdAt: { $gte: todayStart, $lte: todayEnd },
                            },
                        },
                        { $count: "todayTotal" },
                    ],

                    // 3. कुल ongoing बुकिंग
                    ongoingBookings: [
                        { $match: { status: "ongoing" } },
                        { $count: "ongoingTotal" },
                    ],

                    // 4. कुल completed बुकिंग
                    completedBookings: [
                        { $match: { status: "completed" } },
                        { $count: "completedTotal" },
                    ],

                    // 5. आज की ongoing बुकिंग
                    todayOngoingBookings: [
                        {
                            $match: {
                                status: "ongoing",
                                createdAt: { $gte: todayStart, $lte: todayEnd },
                            },
                        },
                        { $count: "todayOngoing" },
                    ],

                    // 6. आज की completed बुकिंग
                    todayCompletedBookings: [
                        {
                            $match: {
                                status: "completed",
                                createdAt: { $gte: todayStart, $lte: todayEnd },
                            },
                        },
                        { $count: "todayCompleted" },
                    ],
                },
            },
            {
                $project: {
                    totalBookings: { $ifNull: [{ $arrayElemAt: ["$totalBookings.total", 0] }, 0] },
                    todayTotalBookings: { $ifNull: [{ $arrayElemAt: ["$todayTotalBookings.todayTotal", 0] }, 0] },
                    ongoingBookings: { $ifNull: [{ $arrayElemAt: ["$ongoingBookings.ongoingTotal", 0] }, 0] },
                    completedBookings: { $ifNull: [{ $arrayElemAt: ["$completedBookings.completedTotal", 0] }, 0] },
                    todayOngoingBookings: { $ifNull: [{ $arrayElemAt: ["$todayOngoingBookings.todayOngoing", 0] }, 0] },
                    todayCompletedBookings: { $ifNull: [{ $arrayElemAt: ["$todayCompletedBookings.todayCompleted", 0] }, 0] },
                },
            },
        ]);

        // Step 4: Response Data
        const summary = orderSummary[0] || {
            totalBookings: 0,
            todayTotalBookings: 0,
            ongoingBookings: 0,
            completedBookings: 0,
            todayOngoingBookings: 0,
            todayCompletedBookings: 0,
        };

        // Step 5: Send Response
        res.status(200).json({
            success: true,
            data: summary,
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};



export {
    addCollectionSales,
    getCollectionSales,
    loginCollectionSales,
    assignedOrder,
    getCollectionSalesDetail,
    orderReportAdded,
    collectionOrderSummary
}