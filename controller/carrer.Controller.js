const adminEmail = "ayushm185@gmail.com"; // Admin email address
import AppError from "../utils/error.utlis.js";
import cloudinary from "cloudinary";
import fs from "fs";
import CarrerModel from "../models/carrer.model.js";
import sendEmail from "../utils/email.utlis.js";



const addCV = async (req, res) => {
  try {
    const {
      contact,
      currentCompany,
      currentDesignation,
      email,
      highestQualification,
      name,
      position,
      totalExperience,
    } = req.body;

    console.log(req.body);

    const newCV = new CarrerModel({
      contact,
      currentCompany,
      currentDesignation,
      email,
      highestQualification,
      name,
      position,
      totalExperience,
      resume: {
        public_id: "",
        secure_url: "",
      },
    });

    let resumeAttachment = null;

    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "coa",
        resource_type: "auto",
      });

      if (result) {
        newCV.resume.public_id = result.public_id;
        newCV.resume.secure_url = result.secure_url;

        resumeAttachment = {
          filename: `Resume-${name}.pdf`,
          path: result.secure_url,
        };
      }

      fs.rm(`uploads/${req.file.filename}`, { force: true }, (err) => {
        if (err) {
          console.error("Error deleting the file:", err);
        }
      });
    }

    const savedCV = await newCV.save();
    const adminEmail = "shanyaglobal.lko@gmail.com"

    // Prepare email content for the admin
    const subject = `📝 New Job Application - ${position}`;
    const message = `
      <div style="font-family: 'Poppins', sans-serif; max-width: 600px; background-color: #ffffff; margin:0 auto; border-radius: 10px; padding: 20px; box-shadow: 0px 0px 8px rgba(0,0,0,0.1);">
        
        <!-- Logo -->
        <div style="text-align: center;">
          <img src="https://ayush.webakash1806.com/assets/Shanya-Djn2HjOw.png" style="width: 180px; margin-bottom: 15px;" />
        </div>

        <h2 style="font-size: 22px; font-weight: 700; color: #444; text-align: center; margin-bottom: 20px;">
          🏥 New Job Application Received!
        </h2>

        <div style="background-color: #f4f8ff; padding: 15px; border-radius: 7px; border-left: 5px solid #1877f2;">
          <p style="font-size: 16px; color: #444; font-weight: 600;">Q
            <span style="color: #1877f2;">Position Applied For:</span> ${position}
          </p>
          <p style="font-size: 16px; color: #444; font-weight: 600;">
            <span style="color: #1877f2;">Candidate Name:</span> ${name}
          </p>
          <p style="font-size: 16px; color: #444; font-weight: 600;">
            <span style="color: #1877f2;">Total Experience:</span> ${totalExperience} years
          </p>
          <p style="font-size: 16px; color: #444; font-weight: 600;">
            <span style="color: #1877f2;">Highest Qualification:</span> ${highestQualification}
          </p>
          <p style="font-size: 16px; color: #444; font-weight: 600;">
            <span style="color: #1877f2;">Current Company:</span> ${currentCompany}
          </p>
          <p style="font-size: 16px; color: #444; font-weight: 600;">
            <span style="color: #1877f2;">Current Designation:</span> ${currentDesignation}
          </p>
          <p style="font-size: 16px; color: #444; font-weight: 600;">
            <span style="color: #1877f2;">Email:</span> ${email}
          </p>
          <p style="font-size: 16px; color: #444; font-weight: 600;">
            <span style="color: #1877f2;">Contact:</span> ${contact}
          </p>
        </div>

        <p style="font-size: 16px; color: #333; font-weight:500; margin-top: 15px; text-align: center;">
          📎 Candidate's Resume is attached with this email.
        </p>

        <p style="font-size: 14px; color:rgb(64, 64, 64); margin-top: 20px; text-align: center;">
          <b>Best Regards</b>,<br/>
          Shanya Scans & Theranostics <br/>
          📞 Toll Free No: 1800 123 4187 <br/>
          🌐 <a href="https://www.shanyascans.com" style="color:#1877f2; text-decoration:none;">www.shanyascans.com</a>
        </p>
      </div>
    `;

    // Attach Resume if available
    const attachments = resumeAttachment ? [resumeAttachment] : [];

    // Send email
    await sendEmail(adminEmail, subject, message, attachments);

    res.status(201).json({
      success: true,
      message: "CV added successfully",
      data: savedCV,
    });
  } catch (error) {
    console.error("Error adding CV:", error);

    res.status(500).json({
      success: false,
      message: "Error adding CV",
      error: error.message,
    });
  }
};



// Controller to handle fetching CVs
 const getCVs = async (req, res) => {
  try {
    const cvs = await CarrerModel.find(); // Fetch all CVs
    res.status(200).json({
      success: true,
      data: cvs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching CVs",
      error: error.message,
    });
  }
};


export {
    addCV,
    getCVs
}