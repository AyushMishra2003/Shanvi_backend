import moment from "moment";
import checkoutModel from "../models/checkout.model.js"
import OrderModel from "../models/order.model.js";
import User from "../models/user.model.js";
import sendEmail from "../utils/email.utlis.js"
import AppError from "../utils/error.utlis.js"


const addOrder = async (req, res, next) => {
  try {
    let orders = req.body;
    if (!Array.isArray(orders)) orders = [orders];

    let newCheckout;
    const io = req.app.get("io"); // 🔥 Get Socket.io instance

    for (let order of orders) {
      const { email, address, phoneNumber, altPhoneNumber, orderDetails} = order;

      if (!email || !address || !phoneNumber || !altPhoneNumber || !orderDetails || !Array.isArray(orderDetails) || orderDetails.length === 0) {
        return next(new AppError("Missing required fields or invalid order details format", 400));
      }

      const user = await User.findOne({ email });
      if (!user) return next(new AppError("User not found", 404));

      const orderIds = [];
      for (let patientOrder of orderDetails) {
        const { patientName, patientAge, patientGender, tests } = patientOrder;

        if (!patientName || !patientAge || !patientGender || !tests || !Array.isArray(tests) || tests.length === 0) {
          return next(new AppError("Invalid patient details or tests missing", 400));
        }

        for (let test of tests) {
          const newOrder = await OrderModel.create({
            patientName,
            patientAge,
            patientGender,
            quantity: test.quantity,
            category: test.category,
            orderName: test.orderName,
            orderType: test.orderType,
            orderPrice: test.orderPrice || 0,
            bookingStatus: "pending",
            bookingDate: test.bookingDate,
            bookingTime:moment(`${test.bookingDate} ${test.bookingTime}`, "YYYY-MM-DD hh:mm A").toDate(),
            
            reportStatus: "not ready",
          });

          orderIds.push(newOrder._id);
        }
      }

      newCheckout = await checkoutModel.create({
        userDetails: user._id,
        orderDetails: orderIds,
        address,
        phoneNumber,
        altPhoneNumber,
      });

      if (!newCheckout) {
        return next(new AppError("Checkout entry not created", 400));
      }

      console.log("✅ Order Created:", newCheckout);
      
      // 🔥 Order created successfully, emit event
      io.emit("orderUpdated", newCheckout);
      console.log("📢 Emitting orderUpdated event:", newCheckout);


      const todaySummary = await getTodayOrdersSummaryData();
      io.emit("todayOrdersSummary", todaySummary); // 🔥 Total summary bhi emit karo
      console.log("📢 Emitting updated total summary:", todaySummary);
    
    }

    res.status(201).json({
      success: true,
      message: "Orders created successfully",
      data: newCheckout,
    });

  } catch (error) {
    console.error("Error creating order:", error);
    return next(new AppError(error.message, 500));
  }
};




const getOrder = async (req, res, next) => {
  try {
    const orders = await checkoutModel
      .find()
      .populate("userDetails", "name email phoneNumber") // Populate user details
      .populate({
        path: "orderDetails",
        model: "OrderModel",
      }) // Populate order details
      .exec();

    if (!orders || orders.length === 0) {
      return next(new AppError("No orders found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return next(new AppError(error.message, 500));
  }
};



const getTodayOrdersSummary = async (req, res) => {
  try {
    const summary = await getTodayOrdersSummaryData(); // 🔥 Helper function se data lo

    res.status(200).json({
      success: true,
      message: "Today's orders summary fetched successfully",
      data: summary,
    });

  } catch (error) {
    console.log(error);
    
    return res.status(500).json({ error: "Internal Server Error" });
  }
};







const getTodayOrdersSummaryData = async () => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 🔹 Database se aaj ka total count laane ka aggregation query
    const result = await OrderModel.aggregate([
      {
        $match: {
          orderDateTime: { $gte: todayStart, $lte: todayEnd },
          bookingStatus: { $ne: "cancelled" }
        }
      },
      {
        $group: {
          _id: "$orderType",
          count: { $sum: 1 }
        }
      }
    ]);

    let summary = {
      totalBookingsToday: 0,
      totalScansToday: 0,
      totalPathologyToday: 0,
      totalHomeCollectionToday: 0
    };

    result.forEach((item) => {
      if (item._id === "scan") summary.totalScansToday = item.count;
      if (item._id === "pathology") summary.totalPathologyToday = item.count;
      if (item._id === "home collection") summary.totalHomeCollectionToday = item.count;
      summary.totalBookingsToday += item.count;
    });

    let formattedData = [
      { _id: "Today Test Booking ", count: summary.totalBookingsToday },
      { _id: "Total Home collection Today", count: summary.totalHomeCollectionToday },
      { _id: "Total Scan Test", count: summary.totalScansToday },
      { _id: "Total Pathology Test", count: summary.totalPathologyToday }
    ];

    return formattedData;

  } catch (error) {
    console.error("Error fetching today's order summary:", error);
    return [];
  }
};



const getLatestOrder=async(req,res,next)=>{
  try {
    const oneHourAgo = moment().subtract(1, "hour").toDate(); // 1 hour pehle ka time

    const bookings = await OrderModel.find({
      orderDateTime: { $gte: oneHourAgo }, // Order time 1 hour pehle ya uske baad ka hona chahiye
    }).sort({ orderDateTime: -1 }); // Latest pehle aaye

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching last hour bookings:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}




export {
    addOrder,
    getOrder,
    getTodayOrdersSummary,
    getLatestOrder
}