import collectionModel from "../models/collectionSales.js"
import OrderModel from "../models/order.model.js"
import AppError from "../utils/error.utlis.js"
import cloudinary from "cloudinary";
import fs from "fs/promises";
import { startOfDay, endOfDay } from 'date-fns';
import sendNotification from "./notification.js";
import dotenv from "dotenv";


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

        const { email, password, lat, lng, address } = req.body

        console.log(req.body)

        const io = req.app.get("io");

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

        if (lat) {
            validSales.lat = lat
        }
        if (lng) {
            validSales.lng = lng
        }
        if (address) {
            validSales.address = address
        }

        await validSales.save()

        io.emit("aao-raja", "aa-gyla ka");

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

        // ------------ Ayush Mishra/___________



        const io = req.app.get("io"); // Get io instance
        const onlineUsers = req.app.get("onlineUsers"); // Get Online Users Map
        const message = "new-order-assigned"
        // const { salesPersonId, message } = req.body;

        // if (!salesPersonId || !message) {
        //   return res.status(400).json({ error: "salesPersonId and message required" });
        // }



        // Check if user is online
        const socketId = onlineUsers.get(salesId);


        if (socketId) {
            io.to(socketId).emit("privateMessage", {
                message,
                time: new Date().toISOString(),
            });
        }

        console.log(validOrder);



        //-------------------- Notification Send-----//-----------------//
        const title = "New Order Assigned";
        const body = `
        📢 *Order Assignment Notification*
        
        Dear Team Member,
        
        You have been assigned a new order. Please find the details below:
        
        🏷️ *Order ID:* ${validOrder._id}  
        👤 *Patient Name:* ${validOrder.patientName}  
        🎂 *Age/Gender:* ${validOrder.patientAge} / ${validOrder.patientGender}  
        🧪 *Test Category:* ${validOrder.category}  
        🔬 *Test Name:* ${validOrder.orderName}  
        📦 *Order Type:* ${validOrder.orderType}  
        💰 *Order Price:* ₹${validOrder.orderPrice}  
        📅 *Booking Date:* ${new Date(validOrder.bookingDate).toLocaleDateString()}  
        ⏰ *Booking Time:* ${new Date(validOrder.bookingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}  
        📍 *Location:* ${validOrder.lat}, ${validOrder.lng}  
        📊 *Booking Status:* ${validOrder.bookingStatus}  
        📈 *Report Status:* ${validOrder.reportStatus}  
        
        📅 *Order Placed On:* ${new Date(validOrder.orderDateTime).toLocaleString()}  
        
        Please proceed with the necessary actions and update the report status once completed.  
        
        ✅ Thank you!  
        `;

        const deviceToken = validSales.fcmToken;


        console.log("device token in controller is", deviceToken);






        // const deviceToken = validSales.fcmToken; 

        // ✅ Call the Notification Function
        await sendNotification(deviceToken, title, body);



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




const saveTokenSales = async (req, res, next) => {
    try {

        console.log("aaya ki nahi ");


        const { token, id } = req.body
        const validSales = await collectionModel.findById(id)

        console.log(req.body);


        if (!validSales) {
            return next(new AppError("Sales Not Found", 400))
        }

        validSales.fcmToken = token

        await validSales.save()

        console.log(validSales);


        res.status(200).json({
            success: true,
            message: "Token Added Succesfully",

        })


    } catch (error) {
        return next(new AppError(error.message, 500))
    }
}



export {
    addCollectionSales,
    getCollectionSales,
    loginCollectionSales,
    assignedOrder,
    getCollectionSalesDetail,
    orderReportAdded,
    collectionOrderSummary,
    saveTokenSales
}