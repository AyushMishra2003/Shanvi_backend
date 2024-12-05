import { model, Schema } from 'mongoose'

const paymentSchema = new Schema({
    razorpay_payment_id: {
        type: String,
        required: true
    },
    razorpay_order_id: {
        type: String,
        required: true
    },
    razorpay_signature: {
        type: String,
        required: true
    }
}, {
    timestamps: true  // Automatically add timestamps (createdAt, updatedAt) to documents
})





const Payment = model('Payment', paymentSchema)

export default Payment