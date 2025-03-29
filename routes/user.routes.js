import  { Router } from 'express';
import { forgotPassword, isLogin, login, loginwithOrder, logout, register, resendVerificationCode, resetPassword, updateUser, userAllOrder, userOrder, verifyUser } from '../controller/user.controller.js';


const userRoute = Router()

userRoute.get('/all/order',userAllOrder);
userRoute.get('/order/:id',userOrder);

userRoute.put('/profile/:id',updateUser);
userRoute.post('/register', register);
userRoute.post('/verify', verifyUser);
userRoute.post('/login', login);
userRoute.post('/islogin', isLogin);
userRoute.post('/login/order', loginwithOrder);
userRoute.post('/logout', logout);
userRoute.post('/resend-verification', resendVerificationCode);
userRoute.post('/forgot-password', forgotPassword);
userRoute.post('/reset-password', resetPassword);


export default userRoute;
