import { Schema, model } from "mongoose";

const checkoutSchema = new Schema(
  {
    orderName:{
      type:String
    },
    age:{
      type:String
    },
    phone:{
      type:String
    },
    altPhone:{
      type:String
    },
    address:{
      type:String
    },
    gender:{
      type:String
    },
    name:{
      type:String
    },
    category:{
      type:String
    },
    price:{
      type:String
    },
    bod:{
      type:String
    },
    bot:{
      type:String
    },
    db:{
      type:String
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const checkoutModel = model("Checkout", checkoutSchema);

export default checkoutModel;
