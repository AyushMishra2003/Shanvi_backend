import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import sendEmail from '../utils/email.utlis.js';

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
  

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, 'your_jwt_secret', { expiresIn: '1d' });
};

// Send Email Function
// const sendEmail = async (email, subject, text) => {
//   await transporter.sendMail({
//     from: '"Shanya Scans" <ucscabproject@gmail.com>',
//     to: email,
//     subject,
//     text
//   });
// };

// **1. Register User**
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Generate verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();

    // Create new user
    const user = new User({ name, email, password, verificationCode });
    await user.save();

    // Send verification email
    await sendEmail(email, 'Verify Your Account', `Your verification code is: ${verificationCode}`);

    res.status(201).json({ message: 'User registered. Check email for verification code.' });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: error.message });
  }
};

// **2. Verify User**
export const verifyUser = async (req, res) => {
  try {
    const { email, otp } = req.body;
     
    console.log(req.body);
    

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'User not found' });

    console.log(user);
    
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });
    

  

    if (user.verificationCode !== otp.toString()) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    

    user.isVerified = true;
    user.verificationCode = null;
    await user.save();

    // res.status(200).json({ message: 'Verification successful. You can now log in.' });

    res.status(200).json({
        success:true,
        message:'Verification successful. You can now log in'
    })
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ message: error.message });
  }
};

// **3. Login User**
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'User not found' });
    if (!user.isVerified) return res.status(400).json({ message: 'Please verify your email first' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id);

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// **4. Logout User**
export const logout = async (req, res) => {
  try {
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// **5. Resend Verification Code**
export const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

    const newCode = crypto.randomInt(100000, 999999).toString();
    user.verificationCode = newCode;
    await user.save();

    await sendEmail(email, 'New Verification Code', `Your new verification code is: ${newCode}`);

    res.status(200).json({ message: 'Verification code resent. Check your email.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// **6. Forgot Password (Generate Reset Code)**
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'User not found' });

    const resetCode = crypto.randomInt(100000, 999999).toString();
    user.verificationCode = resetCode;
    await user.save();

    await sendEmail(email, 'Password Reset Code', `Your password reset code is: ${resetCode}`);

    res.status(200).json({ message: 'Password reset code sent to email.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// **7. Reset Password**
export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'User not found' });

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: 'Invalid reset code' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.verificationCode = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
