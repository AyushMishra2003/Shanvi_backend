
import checkoutModel from "../models/checkout.model.js"
import User from "../models/user.model.js";
import sendEmail from "../utils/email.utlis.js"
import AppError from "../utils/error.utlis.js"


const addOrder = async (req, res, next) => {
    try {
        const {
            testName,
            bookingDate,
            bookingTime,
            category,
            rate,
            email,
            name,
            age,
            phone,
            altPhone,
            gender,
            cityState,

        } = req.body;

        const findUser = await User.findOne({ email })

        if (!findUser) {
            return next(new AppError("User not Found", 404))
        }

        // Create the order
        const newOrder = await checkoutModel.create({
            name: testName,
            price: rate,
            bod: bookingDate,
            bot: bookingTime,
            category: category,
            orderName: name,
            email,
            address: cityState,
            phone,
            altPhone

        })

        if (!newOrder) {
            return next(new AppError("Order not placed", 400));
        }

        if (!Array.isArray(findUser.orderDetails)) {
            findUser.orderDetails = []; // Initialize if undefined
        }

        // Push the new order ID into orderDetails
        findUser.orderDetails.push(newOrder._id);

        await findUser.save()

        //   await findUser.save()



        // Prepare dynamic email content
        let message = `<div style="font-family: Poppins, sans-serif; max-width: 600px; background-color: #f8f8f8; margin:0 auto; border-radius: 10px; padding: 20px; border: 1px solid #ddd;">
        
        <!-- Logo -->
        <img src="https://ayush.webakash1806.com/assets/Shanya-Djn2HjOw.png" style="width: 13rem; display: block; margin: 0 auto;" />
    
        <h1 style="font-size: 20px; font-weight: 600; line-height: 24px; text-align: center; color: #464646; margin: 20px 0;">
          Thank you for your </strong> order, ${testName}!
        </h1>

        <p style="font-size: 16px; color: #333; text-align: center; margin-bottom: 15px;">
          Your order has been successfully placed. Here are the details:
        </p>

        <div style="background-color: #ffffff; padding: 15px; border-radius: 7px; border: 1px solid #ddd; box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);">
          <ul style="list-style: none; padding: 0; font-size: 16px; color: #333;">
            <li><strong>Name:</strong> ${testName}</li>
            <li><strong>Rate:</strong> ₹${rate}</li>
            <li><strong>Category:</strong> ${category}</li>
            <li><strong>Booking Date:</strong> ${bookingDate || "Not Provided"}</li>
            <li><strong>Booking Time:</strong> ${bookingTime || "Not Provided"}</li>
          </ul>
        </div>

        <p style="font-size: 16px; color: #494949; text-align: center; margin: 20px 0;">
          We will contact you shortly for further updates.
        </p>

        <div style="text-align: center; margin-top: 20px;">
          <a href="https://shanyascans.com" style="background-color: #1877f2; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-size: 16px;">
            View Your Order
          </a>
        </div>

        <p style="font-size: 14px; color: rgb(64, 64, 64); text-align: center; margin-top: 20px;">
          <b>Best Regards</b>,<br/>Shanya Scans & Theranostics <br/>Toll Free No: 1800 123 4187 <br/> <a href="https://shanyascans.com" style="color: #1877f2; text-decoration: none;">www.shanyascans.com</a>
        </p>
      </div>`;

       


        // Send confirmation email
        await sendEmail(email, `Order Confirmation - ${testName}`, message);


        // Prepare email content for admin
        const adminEmail = "shanyaglobal.lko@gmail.com" // admin email
        let adminMessage = `<div style="font-family: Poppins, sans-serif; max-width: 600px; background-color: #f8f8f8; margin:0 auto; border-radius: 10px; padding: 20px; border: 1px solid #ddd;">
        
        <!-- Header -->
        <h1 style="font-size: 20px; font-weight: 600; line-height: 24px; text-align: center; color: #464646; margin: 20px 0;">
          🚀 New Order Received!
        </h1>

        <p style="font-size: 16px; color: #333; text-align: center; margin-bottom: 15px;">
          A new order has been placed. Here are the details:
        </p>

        <!-- Order Details Box -->
        <div style="background-color: #ffffff; padding: 15px; border-radius: 7px; border: 1px solid #ddd; box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);">
          <ul style="list-style: none; padding: 0; font-size: 16px; color: #333;">
            <li><strong>Customer Name:</strong> ${name}</li>
            <li><strong>Email:</strong> <a href="mailto:${email}" style="color: #1877f2; text-decoration: none;">${email}</a></li>
            <li><strong>Phone:</strong> <a href="tel:${phone}" style="color: #1877f2; text-decoration: none;">${phone}</a></li>
            <li><strong>Test Name:</strong> ${testName}</li>
            <li><strong>Rate:</strong> ₹${rate}</li>
            <li><strong>Category:</strong> ${category}</li>
            <li><strong>Booking Date:</strong> ${bookingDate || "Not Provided"}</li>
            <li><strong>Booking Time:</strong> ${bookingTime || "Not Provided"}</li>
          </ul>
        </div>

        <p style="font-size: 16px; color: #494949; text-align: center; margin: 20px 0;">
          Please check the admin panel for more details.
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin-top: 20px;">
          <a href="https://shanyascans.com/admin" style="background-color: #1877f2; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-size: 16px;">
            Open Admin Panel
          </a>
        </div>

        <!-- Footer -->
        <p style="font-size: 14px; color: rgb(64, 64, 64); text-align: center; margin-top: 20px;">
          <b>Best Regards</b>,<br/>Shanya Scans & Theranostics <br/>Toll Free No: 1800 123 4187 <br/> 
          <a href="https://shanyascans.com" style="color: #1877f2; text-decoration: none;">www.shanyascans.com</a>
        </p>
      </div>`;


        // Send email to admin
        await sendEmail(adminEmail, `New Order Received - ${testName}`, adminMessage);
        // await sendEmail(email, `Order Confirmation - ${testName}`, message);

        res.status(201).json({
            success: true,
            message: "Order Created Succesfully",
            data: newOrder
        });

    } catch (error) {
        console.error("Error placing order:", error);
        return next(new AppError(error.message, 500));
    }
};


const getOrder=async(req,res,next)=>{
   try{
     
    const allOrder=await checkoutModel.find({})

    if(!allOrder){
       return next(new AppError("Order Detail Not Found",400))
    }


    res.status(200).json({
      success:true,
      message:"All Order-",
      data:allOrder
    })

   }catch(error){
    console.log(error);
    
     return next(new AppError(error.message,500))
   }
}




export {
    addOrder,
    getOrder
}