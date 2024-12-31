import { Schema, model } from "mongoose";

const checkoutSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"], // Valid values for gender
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    whatsappNumber: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
      default: "Lucknow", // Default city value
    },
    pincode: {
      type: String,
      required: true,
    },
   order:[
    {
        name:{
            type:String,
            required:true
        },
        price:{
            type:Number,
            required:true
        },
        quantity:{
            type:Number,
            required:true
        }
    }
   ]
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const checkoutModel = model("Checkout", checkoutSchema);

export default checkoutModel;
