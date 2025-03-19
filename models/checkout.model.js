import { Schema, model } from "mongoose";

const checkoutSchema = new Schema(
  {   
      userDetails: {
            type: Schema.Types.ObjectId,
            ref: "User", // Referencing the Service_Detail model
            default: {},
      },
      pinCode:{
          type:String,
      },
      orderDetails: [
        {
          type: Schema.Types.ObjectId,
          ref: "OrderModel", // Referencing the Order_Detail model
          default: [],
        },
      ],

      address:{
        type:String,
        required:true
      },
      addressType:{
        type:String,
      },
      pinCode:{
        type:String,
      },
      phoneNumber:{
        type:Number,
        required:true
      },
      altPhoneNumber:{
        type:Number,
        required:true
      }
    
  },
  { timestamps: true }
);


const checkoutModel = model("Checkout", checkoutSchema);

export default checkoutModel;
