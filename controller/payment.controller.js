import { razorpay } from "../server.js" 
import AppError from "../utils/error.utlis.js"
import crypto from 'crypto'
import Payment from "../models/payment.model.js"

 const razorpayApiKey = async (req, res, next) => {
    try {
        // Sending Razorpay API key in the response
        res.status(200).json({
            success: true,
            message: "Razorpay API key",
            key: process.env.RAZORPAY_KEY_ID
        })
    } catch (e) {
        // Handling errors and passing them to the next middleware
        return next(new AppError(e.message, 500))
    }
}

 const checkout = async (req, res, next) => {
    try {

        const { total,  forName } = req.body
        // console.log(amount)
        const razorAmount = await Number(total) * 100
        const options = {
            amount:  Math.ceil(razorAmount),
            currency: "INR",
            notes: {
                purpose: forName
            }
        }

        const order = await razorpay.orders.create(options)

        console.log(order)
        res.status(200).json({
            success: true,
            order
        })

    } catch (e) {
        console.log(e.message)
        return next(new AppError(e.message, 500))

    }
}

 const paymentVerification = async (req, res, next) => {
    try {

        const { razorpay_payment_id, razorpay_signature, razorpay_order_id } = await req.body


        const body = razorpay_order_id + "|" + razorpay_payment_id

        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(body.toString())
            .digest('hex')


        if (expectedSignature === razorpay_signature) {
            await Payment.create({
                razorpay_order_id,
                razorpay_signature,
                razorpay_payment_id
            })

            res.status(200).json({
                success: true,
                message: "Payment successfull"
            })
        } else {
            return next(new AppError('Payment Unsuccessfull! Please try again', 400))
        }

    } catch (e) {
        // Handling errors and passing them to the next middleware
        return next(new AppError(e, 500))
    }
}



export {
    razorpayApiKey,
    checkout,
    paymentVerification
}