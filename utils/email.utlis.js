import nodemailer from 'nodemailer';

const sendEmail = async function (email, subject, message) {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USERNAME,  // Corrected
            pass: process.env.SMTP_PASSWORD
        }
    });

    await transporter.sendMail({
        from: '"Shanya Scans" <ucscabproject@gmail.com>',
        to: email,
        subject: subject,
        html: message,
    });

    
}

export default sendEmail;