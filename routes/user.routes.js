import  { Router } from 'express';
import { forgotPassword, login, logout, register, resendVerificationCode, resetPassword, verifyUser } from '../controller/user.controller.js';
// import { register } from '../controller/user.controller.js';
// import { 
//   register, verifyUser, login, logout, 
//   resendVerificationCode, forgotPassword, resetPassword 
// } from '../controllers/user.controller.js';

const userRoute = Router()

userRoute.post('/register', register);
userRoute.post('/verify', verifyUser);
userRoute.post('/login', login);
userRoute.post('/logout', logout);
userRoute.post('/resend-verification', resendVerificationCode);
userRoute.post('/forgot-password', forgotPassword);
userRoute.post('/reset-password', resetPassword);

export default userRoute;
