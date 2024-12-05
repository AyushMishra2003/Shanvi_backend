import { Router } from "express";
import { checkout, paymentVerification, razorpayApiKey } from "../controller/payment.controller.js";



const PayementRouter = Router()

PayementRouter.get('/key',  razorpayApiKey)

PayementRouter.post('/checkout',  checkout)

PayementRouter.post('/status', paymentVerification)


export default PayementRouter