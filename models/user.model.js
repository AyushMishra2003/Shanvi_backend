import mongoose, { Schema } from 'mongoose';
import { token } from 'morgan';

const userSchema = new mongoose.Schema({
  name: { type: String ,default:"user"},
  email: { type: String, unique: true, required: true },
  password:{
    type:String,
  },
  verificationCode: { type: String },
  isVerified: { type: Boolean, default: false },
  member:[
    {
      name:{type:String}
    }
  ],
  token:{   
    type:String
  },
  orderDetails: [
    {
      type: Schema.Types.ObjectId,
      ref: "Checkout", // Referencing the Service_Detail model
      default: [],
    },
  ],
  phoneNumber:{
    type:String,
     default:"91XXXXXXXX"
  },
  whatsappNumber:{
    type:String,
     default:"91XXXXXXXX"
  },
  age:{
    type:String,
    default:"XX"
  },
  dob:{
    type:String
  },
  height:{
    type:String
  },
  weight:{
    type:String
  },
  bloodGroup:{
    type:String
  },
  address:{
    type:String
  },
  pincode:{
    type:String
  },
  city:{
    type:String
  }

});

const User = mongoose.model('User', userSchema);
export default User;
