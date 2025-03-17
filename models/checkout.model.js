import { Schema, model } from "mongoose";

const checkoutSchema = new Schema(
  {   
      userDetails: {
            type: Schema.Types.ObjectId,
            ref: "User", // Referencing the Service_Detail model
            default: {},
      },
      orderDetails: [
        {
          type: Schema.Types.ObjectId,
          ref: "OrderModel", // Referencing the Service_Detail model
          default: [],
        },
      ],

      address:{
        type:String,
        required:true
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
