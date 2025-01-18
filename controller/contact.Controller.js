import ContactModel from "../models/contact.model.js"
import sendEmail from "../utils/email.utlis.js"
import AppError from "../utils/error.utlis.js"


const addContact=async(req,res,next)=>{
    try{

        const {firstName,lastName,subject,email,message}=req.body

        if(!firstName || !lastName || !subject || !email || !message){
            return next(new AppError("All field are Required",400))
        }

        const newContact=await ContactModel({
            firstName,
            lastName,
            subject,
            email,
            message
        })

        if(!newContact){
            return next(new AppError("Contact not saved",400))
        }

        await newContact.save()


        const adminEmail = "ayushm185@gmail.com";

        // Prepare email content for the admin
        const subject1 = "New Inquiry ";
        const message1 = `
        <h1>New Inquiry Submission</h1>
        <p>Here are the details of the submitted inquiry:</p>
        <ul>
          <li><strong>First Name:</strong> ${firstName}</li>
          <li><strong>Last Name:</strong> ${lastName}</li>
          <li><strong>Subject:</strong> ${subject}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Message:</strong> ${message}</li>
        </ul>
      `;
    
    
    // Send email to the admin with or without the attachment
        await sendEmail(adminEmail, subject1, message1);

        res.status(201).json({
            status:"success",
            message:"Contact Saved",
            data:newContact
        })

    }catch(error){
        return next(new AppError(error.message,500))
    }
}

const getContact=async(req,res,next)=>{
    try{
        const contacts=await ContactModel.find()

        if(!contacts){
            return next(new AppError("No Contact Found",404))
        }

        res.status(200).json({
            status:"success",
            data:contacts
        })

    }catch(error){
        return next(new AppError(error.message,500))
    }
}


export {
    addContact,
    getContact
}