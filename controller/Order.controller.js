import checkoutModel from "../models/checkout.model.js"
import sendEmail from "../utils/email.utlis.js"
import AppError from "../utils/error.utlis.js"


const addOrder=async(req,res,next)=>{
    try{

        const {fullName,gender,age,mobileNumber,whatsappNumber,email,address,city,pincode,order}=req.body

        console.log(req.body);
        

        if(!fullName || !gender || !age || !mobileNumber || !email || !address || !city || !pincode){
            return next(new AppError("All field are Required",400))
        }
       
        const newOrder=await checkoutModel.create({
            fullName,
            gender,
            age,
            mobileNumber,
            whatsappNumber,
            email,
             address,
             city,
             pincode,
             order
        })

        if(!newOrder){
            return next(new AppError("Order not placed",400))
        }

        console.log(newOrder);
        

          // Prepare email content
          const subject = "Order Confirmation";
          const message = `
              <h1>Thank you for your order, ${fullName}!</h1>
              <p>Your order has been successfully placed. Here are the details:</p>
              <ul>
                  <li><strong>Name:</strong> ${fullName}</li>
                  <li><strong>Age:</strong> ${age}</li>
                  <li><strong>Gender:</strong> ${gender}</li>
                  <li><strong>Mobile Number:</strong> ${mobileNumber}</li>
                  <li><strong>WhatsApp Number:</strong> ${whatsappNumber || "Not Provided"}</li>
                  <li><strong>Address:</strong> ${address}, ${city}, ${pincode}</li>
              </ul>
              <p>We will contact you shortly for further updates.</p>
          `;

          console.log("emial se pehle");
          
  
          // Send confirmation email
          await sendEmail(email, subject, message);

          console.log("email se baad");
          

        await newOrder.save()


        res.status(201).json({
            status:"success",
            data:newOrder
        })

    }catch(error){
        console.log(error);
        
        return next(new AppError(error.message,500))
    }
}



export {
    addOrder
}