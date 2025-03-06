import  { Router } from 'express';
import { forgotPassword, isLogin, login, loginwithOrder, logout, register, resendVerificationCode, resetPassword, userOrder, verifyUser } from '../controller/user.controller.js';
// import { register } from '../controller/user.controller.js';
// import { 
//   register, verifyUser, login, logout, 
//   resendVerificationCode, forgotPassword, resetPassword 
// } from '../controllers/user.controller.js';

const userRoute = Router()

userRoute.get('/order/:id',userOrder);
userRoute.post('/register', register);
userRoute.post('/verify', verifyUser);
userRoute.post('/login', login);
userRoute.post('/islogin', isLogin);
userRoute.post('/login/order', loginwithOrder);
userRoute.post('/logout', logout);
userRoute.post('/resend-verification', resendVerificationCode);
userRoute.post('/forgot-password', forgotPassword);
userRoute.post('/reset-password', resetPassword);
userRoute.get('/order/:id',userOrder);

export default userRoute;
