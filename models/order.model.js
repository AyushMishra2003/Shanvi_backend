import { model, Schema } from "mongoose";

const orderSchema = new Schema(
    {
        patientName: { type: String, required: true },
        patientAge: { type: Number, required: true },
        patientGender: { type: String, enum: ["male", "female", "other"], required: true },
        quantity: { type: Number, required: true },
        category: { type: String, required: true },
        addressType: { type: String, enum: ["work", "office", "work"] },
        orderName: {
            type: String,
            required: true
        },
        orderType: {
            type: String,
            enum: ["scan", "package", "pathology", "home collection"],
            required: true,
        },
        orderPrice: {
            type: Number,
            default: 0
        },
        bookingStatus: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "completed","ongoing"],
            default: "pending",
        },
        bookingDate: { type: Date, required: true },
        bookingTime: { type: Date, required: true },
        orderDateTime: { type: Date, default: Date.now },
        reportStatus: {
            type: String,
            enum: ["not ready", "ready"],
            default: "not ready",
        },
        report: {
            public_id: {
                type: String,
                default: ""
            },
            secure_url: {
                type: String,
                default: ""
            }
        },
        userId:
        {
            type: Schema.Types.ObjectId,
            ref: "User", // Referencing the User model
            default: null,
        },
        assignedTo:{
            type: Schema.Types.ObjectId,
            ref: "CollectionSales", // Referencing the Assigned  model
            default: null,
        },


    },
    {
        timestamps: true
    }
)


const OrderModel = model("OrderModel", orderSchema)

export default OrderModel