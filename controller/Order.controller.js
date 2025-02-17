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

        console.log(req.body);
        


        const findUser=await User.find({email})

        if(!findUser){
             return next(new AppError("User not Found",404))
        }

      
        // Create the order
        const newOrder = await checkoutModel.create({
            name:testName,
            price:rate,
            bod:bookingDate,
            bot:bookingTime,
            category:category,
            orderName:name,
            email,
            address:cityState,
            phone,
            altPhone

        })

        if (!newOrder) {
            return next(new AppError("Order not placed", 400));
        }

        console.log("New order created:", newOrder);

        // Prepare dynamic email content
        let message = `<h1>Thank you for your ${"orderType"} order, ${testName}!</h1>
                       <p>Your order has been successfully placed. Here are the details:</p>
                       <ul>
                           <li><strong>Name:</strong> ${testName}</li>
                           <li><strong>Rate:</strong> ${rate}</li>
                           <li><strong>Category:</strong> ${category}</li>
                           <li><strong>Booking Date:</strong> ${bookingDate || "Not Provided"}</li>
                           <li><strong>Booking Time:</strong> ${bookingTime || "Not Provided"}</li>
                       </ul>
                       <p>Order Details:</p>
                       <p>We will contact you shortly for further updates.</p>`;

        // Send confirmation email
        await sendEmail(email, `Order Confirmation - ${testName}`, message);

        res.status(201).json({
            success: true,
            message:"Order Created Succesfully",
            data: newOrder
        });

    } catch (error) {
        console.error("Error placing order:", error);
        return next(new AppError(error.message, 500));
    }
};




export {
    addOrder
}