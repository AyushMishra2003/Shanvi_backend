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

    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "coa",
        resource_type: "auto",
      });

      if (result) {
        newCV.resume.public_id = result.public_id;
        newCV.resume.secure_url = result.secure_url;
      }

      fs.rm(`uploads/${req.file.filename}`, { force: true }, (err) => {
        if (err) {
          console.error("Error deleting the file:", err);
        }
      });
    }

    const savedCV = await newCV.save();
    const adminEmail = "ayushm185@gmail.com";

    // Prepare email content for the admin
    const subject = "New Resume Submission";
    const message = `
      <h1>New CV Submission</h1>
      <p>Here are the details of the submitted CV:</p>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Contact:</strong> ${contact}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Current Company:</strong> ${currentCompany}</li>
        <li><strong>Current Designation:</strong> ${currentDesignation}</li>
        <li><strong>Highest Qualification:</strong> ${highestQualification}</li>
        <li><strong>Position Applied For:</strong> ${position}</li>
        <li><strong>Total Experience:</strong> ${totalExperience}</li>
      </ul>
      <p>The resume can be downloaded from the following link:</p>
      <a href="${newCV.resume.secure_url}">Download Resume</a>
    `;

  // Check if a resume URL exists (i.e., an attachment is present)
  const attachments = req.file
  ? [
      {
        filename: "resume.pdf",
        path: newCV.resume.secure_url, // The secure URL where the resume is stored
      },
    ]
  : [];

// Send email to the admin with or without the attachment
    await sendEmail(adminEmail, subject, message, attachments);

    res.status(201).json({
      success: true,
      message: "CV added successfully",
      data: savedCV,
    });
  } catch (error) {
    console.log(error);
    
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