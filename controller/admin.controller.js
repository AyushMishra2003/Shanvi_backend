import jwt from 'jsonwebtoken';
import AppError from "../utils/error.utlis.js"
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import sendEmail from '../utils/email.utlis.js';
import bcrypt from 'bcryptjs'
import { error, log } from 'console';
import validator from 'validator'
import AdminModel from '../models/admin.model.js';

// Email Transporter Setup

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

const ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

const encryptionKey = Buffer.from(ENCRYPTION_KEY, 'hex'); // Load from environment variable

const ivLength = 16; // AES requires a 16-byte IV

// Function to encrypt text (user ID)
const encrypt = (text) => {
  const iv = crypto.randomBytes(ivLength); // Generate a random IV
  const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex'); // Encrypt the text
  encrypted += cipher.final('hex'); // Finalize encryption
  return iv.toString('hex') + ':' + encrypted; // Store IV and encrypted text together
};

// Function to decrypt text (user ID)
const decrypt = (encryptedText) => {
  if (!encryptedText.includes(':')) {
    throw new Error("Invalid encrypted text format");
  }

  const parts = encryptedText.split(':');
  if (parts.length !== 2) {
    throw new Error("Malformed encrypted text");
  }

  const iv = Buffer.from(parts[0], 'hex'); // Extract IV
  const encryptedData = parts[1]; // Extract encrypted text

  if (!iv || !encryptedData) {
    throw new Error("IV or encrypted data is missing");
  }

  const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    decoded.userId = decrypt(decoded.userId); // Decrypt user ID
    return decoded;
  } catch (error) {
    return null; // Invalid token
  }
}



// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET, { expiresIn: '1d' });
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// **1. Register User**
export const registerAdmin = async (req, res, next) => {
  try {
    let { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new AppError("All field are Required", 400))
    }

    if (!validator.isEmail(email)) {
      return next(new AppError("Email is not Valid", 400))
    }

    if (name.length > 30) {
      return next(new AppError("Name is too long", 400))
    }


    // Check if user already exists
    const userExists = await AdminModel.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return next(new AppError("User Already Exists", 400))
    }

    // Generate verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);


    // Create new user
    const user = new AdminModel({ name, email, password: hashedPassword });
    await user.save();


    const encryptedUserId = encrypt(user._id.toString());
    // Generate JWT token
    const token = jwt.sign({ userId: encryptedUserId }, process.env.SECRET, { expiresIn: "2d" });

    user.token = token

    const decoded = verifyToken(token);


    await user.save()

    // Set the token in an HTTP-only secure cookie
    res.cookie('authToken', token, {
      httpOnly: false,
      secure: true,
      sameSite: 'None',
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days in milliseconds
    });


    res.status(201).json({
      success: true,
      message: "Admin Registration",

    })


  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




// **3. Login User**
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("All field are Required", 400))
    }

    if (!validator.isEmail(email)) {
      return next(new AppError("Email is Invalid", 400))
    }

    const user = await AdminModel.findOne({ email: email.toLowerCase() });

    if (!user) return next(new AppError("User not Found", 400))
    // if (!user.isVerified) return next(new AppError("User not Verfied", 400))

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(new AppError("Password is Incorrect", 400))
    }

    const encryptedUserId = encrypt(user._id.toString());
    // Generate JWT token
    const token = jwt.sign({ userId: encryptedUserId }, process.env.SECRET, { expiresIn: "2d" });

    user.token = token

    // Set the token in an HTTP-only secure cookie
    res.cookie('authToken', token, {
      httpOnly: false,
      secure: true,
      sameSite: 'None',
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days in milliseconds
    });

 
    await user.save()

    res.status(200).json({
      success: true,
      message: "Login Succesfully ",
      data:user
    })
  } catch (error) {
    return next(new AppError(error.message, 500))
  }
};



// **4. Logout User**
export const logoutAdmin = async (req, res) => {
  try {
    // Clear the authToken cookie
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });

    res.status(200).json({
      success: true,
      message: "Logout Succesfully"
    })
  } catch (error) {
    return next(new AppError(error.message, 500))
  }
};



export const isLoginAdmin = async (req, res, next) => {
  try {
    // Extract token from headers (Bearer token) or body
    const token = req.cookies.authToken; // Get the token from the HTTP-only cookie
    const decoded = verifyToken(token);


    if (!token) {
      return next(new AppError('Token is required', 400));
    }



    // Here, decoded.exp is the expiration timestamp from the token
    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
    if (decoded.exp < currentTime) {
      return next(new AppError('Token has expired', 401));
    }

    // If the token is not expired, proceed with the user lookup
    const validUser = await AdminModel.findOne({ _id: decoded.userId })

    if (!validUser) {
      return next(new AppError('User not found or invalid token', 404));
    }



    // Token is valid, and user exists
    res.status(200).json({
      success: true,
      message:"User is Login"

    });

  } catch (error) {

    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired', 401));
    } else if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }

    return next(new AppError(error.message, 500));
  }
};



