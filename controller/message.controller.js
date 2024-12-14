import nodemailer from 'nodemailer'
import AppError from '../utils/error.utlis.js';


const sendMail = async (req, res, next) => {
    try {
        const { name, email, phoneNumber, message, type } = req.body;

        // Check if all required fields are provided
        if (!name || !email || !phoneNumber || !message || !type) {
            return next(new AppError("All fields are required", 400));
        }

        // Validate email format using a regex
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            return next(new AppError("Please enter a valid email address", 400));
        }

        // Validate phone number (starts with 6-9 and is 10 digits long)
        const phonePattern = /^[6-9]\d{9}$/;
        if (!phonePattern.test(phoneNumber)) {
            return next(new AppError("Phone number must start with 6-9 and be 10 digits long", 400));
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Your email (e.g., ayushm185@gmail.com)
                pass: process.env.EMAIL_PASSWORD, // Your email password or app password
            },
        });

        // Email to Code Crafter Web Solutions
        const mailToAdminOptions = {
            from: process.env.EMAIL_USER, // Sender's email
            to: 'ayushm185@gmail.com',  // Forwarded email (the recipient)
            subject: 'New Inquiry Received - Code Crafter Web Solutions',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #4CAF50;">New Inquiry Received</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phoneNumber}</p>
                    <p><strong>Business Type:</strong> ${type}</p>
                    <p><strong>Message:</strong></p>
                    <p style="background: #f9f9f9; padding: 10px; border: 1px solid #ddd;">${message}</p>
                    <hr>
                </div>
            `,
        };

        // Email to the client
        const mailToClientOptions = {
            from: process.env.EMAIL_USER,
            to: email, // Client's email address
            subject: 'Thank You for Reaching Out - Code Crafter Web Solutions',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.8; color: #333;">
                    <h2 style="color: #004658;">Thank You for Reaching Out!</h2>
                    <p>Hi ${name},</p>
                    <p>We have received your inquiry and will get back to you shortly. If you have any urgent questions, feel free to contact us directly at:</p>
                    <ul style="list-style: none; padding: 0; color: #004658;">
                        <li><strong>Phone:</strong> +91-933-696-9289 | +91-884-070-0176</li>
                        <li><strong>Email:</strong> support@codecrafter.co.in</li>
                        <li><strong>Address:</strong> D2/119, 1st Floor, Rolex Tower, Vibhuti Khand, Gomti Nagar, Lucknow 226010</li>
                    </ul>
                    <p>Visit our website for more information: <a href="https://www.codecrafter.co.in/" style="color: #4CAF50; text-decoration: none;">www.codecrafter.co.in</a></p>
                    <hr>
                    <p>Best Regards,</p>
                    <p><strong>Code Crafter Web Solutions</strong></p>
                    <p>Crafting Excellence in IT Solutions</p>
                </div>
            `,
        };

        // Send emails
        await transporter.sendMail(mailToAdminOptions);
        await transporter.sendMail(mailToClientOptions);

        console.log('Emails sent successfully');

        res.status(200).json({
            success: true,
            message: "Emails sent successfully",
        });

    } catch (error) {
        console.error('Error:', error);
        return next(new AppError("An error occurred while sending the email", 500));
    }
};

export default sendMail;
   