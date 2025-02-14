import checkoutModel from "../models/checkout.model.js"
import sendEmail from "../utils/email.utlis.js"
import AppError from "../utils/error.utlis.js"


const addOrder = async (req, res, next) => {
    try {
        const {
            name,
            gender,
            age,
            phone,
            whatsappNumber,
            email,
            address,
            city,
            pincode,
            orderType, // e.g., "test", "scan", "consultation"
            orderDetails, // Detailed info based on order type
            bookingFor, // Self, Family, etc.
            bookingDate,
            bookingTime,
            locality,
            cityState 
        } = req.body;

        console.log(req.body);
        

        // Basic validation
        if (!name || !gender || !age || !phone || !email || !locality || !cityState) {
            
            
            return next(new AppError("All required fields must be provided", 400));
        }

        // Create the order
        const newOrder = await checkoutModel.create({
            fullName:name,
            gender,
            age,
            mobileNumber:phone,
            email,
            address:locality,
            city:cityState,
            bookingDate,
            bookingTime,
            pincode:"221002"
        });

        if (!newOrder) {
            return next(new AppError("Order not placed", 400));
        }

        console.log("New order created:", newOrder);

        // Prepare dynamic email content
        let message = `<h1>Thank you for your ${"orderType"} order, ${name}!</h1>
                       <p>Your order has been successfully placed. Here are the details:</p>
                       <ul>
                           <li><strong>Name:</strong> ${name}</li>
                           <li><strong>Age:</strong> ${age}</li>
                           <li><strong>Gender:</strong> ${gender}</li>
                           <li><strong>Mobile Number:</strong> ${phone}</li>
                           <li><strong>Address:</strong> ${address}, ${cityState}</li>
                           <li><strong>Booking Date:</strong> ${bookingDate || "Not Provided"}</li>
                           <li><strong>Booking Time:</strong> ${bookingTime || "Not Provided"}</li>
                       </ul>
                       <p>Order Details:</p>
                       <p>We will contact you shortly for further updates.</p>`;

        // Send confirmation email
        await sendEmail(email, `Order Confirmation - ${orderType}`, message);

        res.status(201).json({
            success:true,
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