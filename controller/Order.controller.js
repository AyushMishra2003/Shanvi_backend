import moment from "moment";
import checkoutModel from "../models/checkout.model.js"
import OrderModel from "../models/order.model.js";
import User from "../models/user.model.js";
import sendEmail from "../utils/email.utlis.js"
import AppError from "../utils/error.utlis.js"
import axios from "axios";


const getCoordinates = async (location) => {
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: {
        address: location,
        key: 'AIzaSyC9ZOZHwHmyTWXqACqpZY2TL7wX2_Zn05U',
        region: 'IN' 
      }
    });

    if (response.data && response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry.location;
      return { lat, lng};
    } else {
      throw new Error('Location not found in India');
    }
  } catch (error) {
    console.error('Error fetching coordinates:', error.message);
    return null;
  }
};



const addOrder = async (req, res, next) => {
  try {
    let orders = req.body;


    if (!Array.isArray(orders)) orders = [orders];
    let userEmail = ""

    let newCheckout;
    const io = req.app.get("io"); 

    for (let order of orders) {
      const { email, address, phoneNumber, altPhoneNumber, orderDetails, pinCode } = order;

      userEmail = email
      if (!email || !address || !phoneNumber || !altPhoneNumber) {
        console.log('coming');

        return next(new AppError("Missing required fields or invalid order details format", 400));
      }

      const user = await User.findOne({ email });
      if (!user) return next(new AppError("User not found", 404));

      const orderIds = [];
      for (let patientOrder of orderDetails) {
        const { patientName, patientAge, patientGender, tests } = patientOrder;
        if (!patientName || !patientAge || !tests || !Array.isArray(tests) || tests.length === 0) {

          return next(new AppError("Invalid patient details or tests missing", 400));
        }
        const address123=await getCoordinates(order.address);

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
            bookingStatus: "confirmed",
            bookingDate: test.bookingDate,
            bookingTime: moment(`${test.bookingDate} ${test.bookingTime}`, "YYYY-MM-DD hh:mm A").toDate(),
            reportStatus: "not ready",
            userId: user._id,
            lat:address123.lat,
            lng:address123.lng

          });

          console.log(newOrder);
          

          orderIds.push(newOrder._id);
        }
      }

      newCheckout = await checkoutModel.create({
        userDetails: user._id,
        orderDetails: orderIds,
        address,
        phoneNumber,
        altPhoneNumber,
        pinCode
      });

      if (!newCheckout) {
        return next(new AppError("Checkout entry not created", 400));
      }



      // 🔥 Order created successfully, emit event
      io.emit("orderPlaced", newCheckout);


  
      const todaySummary = await getTodayOrdersSummaryData();
      io.emit("todayOrdersSummary", todaySummary); // 🔥 Total summary bhi emit karo


    }

    // 📨 Send Confirmation Email to User
    const emailSubject = "Order Confirmation - Shanya Scans & Theranostics";
    const emailMessage = (orders) => {
      if (!orders || !Array.isArray(orders) || orders.length === 0) {
        return `<p>No valid order details found.</p>`;
      }

      return `
        <div style="font-family: Poppins, sans-serif; max-width: 600px; background-color: #f8f8f8; margin:0 auto; border-radius: 10px; padding: 20px;">
          
          <img src="https://ayush.webakash1806.com/assets/Shanya-Djn2HjOw.png" style="width: 13rem; display: block; margin-bottom: 10px;" />
          
          <h1 style="font-size: 18px; font-weight: 600; line-height: 24px; margin-bottom: 10px; color: #464646;">
            Your Order has been successfully placed with <strong>Shanya Scans & Theranostics</strong>.
          </h1>
    
          <p style="font-size: 16px; color: #333; font-weight: 500; margin-bottom: 10px;">
            Here are your order details:
          </p>
    
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
            <tr style="background-color: #e7f3ff; color: #1877f2;">
              <th style="padding: 8px; border: 1px solid #ddd;">Patient Name</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Age</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Gender</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Test</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Price</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Date</th>
            </tr>
            ${orders
          .map((order) => {
            if (!order.orderDetails || !Array.isArray(order.orderDetails)) return "";
            return order.orderDetails
              .map((patient) => {
                if (!patient.tests || !Array.isArray(patient.tests)) return "";
                return patient.tests
                  .map(
                    (test) => `
                            <tr style="background-color: #fff;">
                              <td style="padding: 8px; border: 1px solid #ddd;">${patient.patientName || "N/A"}</td>
                              <td style="padding: 8px; border: 1px solid #ddd;">${patient.patientAge || "N/A"}</td>
                              <td style="padding: 8px; border: 1px solid #ddd;">${patient.patientGender || "N/A"}</td>
                              <td style="padding: 8px; border: 1px solid #ddd;">${test.orderName || "N/A"}</td>
                              <td style="padding: 8px; border: 1px solid #ddd;">₹${test.orderPrice || 0}</td>
                              <td style="padding: 8px; border: 1px solid #ddd;">${test.bookingDate || "N/A"}</td>
                            </tr>
                          `
                  )
                  .join("");
              })
              .join("");
          })
          .join("")
        }
          </table>
    
          <p style="font-size: 16px; color: #333; font-weight: 500; margin-bottom: 10px;">
                   We will reach you soon.
          </p>
    
          <p style="font-size: 14px; color: rgb(64, 64, 64);">
            <b>Best Regards</b>,<br/>
            Shanya Scans & Theranostics <br/>
            <b>Toll-Free No:</b> 1800 123 4187 <br/>
            <a href="https://www.shanyascans.com" style="color: #1877f2; text-decoration: none;">www.shanyascans.com</a>
          </p>
        </div>
      `;
    };

    await sendEmail(userEmail, emailSubject, emailMessage(orders));

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
      })
      .exec();

    if (!orders) {
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


const getOrderDetail = async (req, res, next) => {
  try {

    const { id } = req.params

    const orders = await checkoutModel
      .findById(id)
      .populate("userDetails", "name email phoneNumber") // Populate user details
      .populate({
        path: "orderDetails",
        model: "OrderModel",
      })
      .exec();

    if (!orders) {
      return next(new AppError("No orders found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
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


const getLatestOrder = async (req, res, next) => {
  try {
    const oneHourAgo = moment().subtract(2, "hour").toDate(); // 1 hour pehle ka time

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


const getHomeCollectionOrder = async (req, res, next) => {
  try {


    const allHomeCollection = await OrderModel.find({ orderType: "home collection" })
      .populate("userId") 
      .populate("assignedTo");


    if (!allHomeCollection) {  // Ensure it's not empty
      return next(new AppError("Home-Collection Not Found", 400));
    }

    res.status(200).json({
      success: true,
      message: "Home-Collection Order",
      data: allHomeCollection
    });

  } catch (error) {
    console.log(error);

    return next(new AppError(error.message, 500));
  }
};


const getHomeCollectionDetails = async (req, res, next) => {
  try {

    const { id } = req.params

    const validOrderDetails = await OrderModel.findById(id)
      .populate("userId") // Populating user details
      .populate("assignedTo"); // If assignedTo exists


    if (!validOrderDetails) {
      return next(new AppError("Order Details is Not Found", 400))
    }

    // console.log(validOrderDetails);


    res.status(200).json({
      success: true,
      message: "Order Detail Found",
      data: validOrderDetails
    })

  } catch (error) {
    return next(new AppError(error.message, 500))
  }
}


const addOrderReport = async (req, res, next) => {
  try {

    const { id } = req.params

    const validOrder = await OrderModel.findById(id)




  } catch (error) {
    return next(new AppError(error.message, 500))
  }
}


const changeOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { newStatus } = req.body;


    const validOrder = await OrderModel.findById(id);

    if (!validOrder) {
      return next(new AppError("Order is Not Valid", 400));
    }

    const currentStatus = validOrder.bookingStatus;

    // Prevent changing status of a completed order
    if (currentStatus === "completed") {
      return next(new AppError("Cannot change status of a completed order", 400));
    }

    // Define allowed transitions
    const validTransitions = {
      pending: ["confirmed", "ongoing", "cancelled"],
      confirmed: ["ongoing", "completed", "cancelled"],
      ongoing: ["completed"],
      cancelled: ["pending", "confirmed"],
      completed: ["ongoing"]
    };



    // Check if the new status is allowed
    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      return next(new AppError(`Invalid transition from ${currentStatus} to ${newStatus}`, 400));
    }

    // Update the order status
    validOrder.bookingStatus = newStatus;
    await validOrder.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${newStatus}`,
      order: validOrder,
    });

  } catch (error) {
    console.log(error);

    return next(new AppError(error.message, 500));
  }
}



export {
  addOrder,
  getOrder,
  getOrderDetail,
  getTodayOrdersSummary,
  getLatestOrder,
  getHomeCollectionOrder,
  getHomeCollectionDetails,
  changeOrderStatus
}