import { model, Schema } from "mongoose";

const contactSchema=new Schema(
    {
         firstName:{
            type:String
         },
         lastName:{
            type:String,
         },
         subject:{
            type:String
         },
         email:{
            type:String
         },
         message:{
            type:String
         }
    },
    {
        timeStamps:true
    }
)


const ContactModel=model("ContactModel",contactSchema)

export default ContactModel