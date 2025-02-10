import nodemailer from 'nodemailer';

const sendEmail = async function (email, subject, message, attachments = []) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  
    await transporter.sendMail({
      from: '"Shanya Scans" <ucscabproject@gmail.com>',
      to: "ayushm185@gmail.com",
      subject: subject,
      html: message,
      attachments: attachments,  // Attachments are passed here (empty array if no attachments)
    });
};
  

export default sendEmail;