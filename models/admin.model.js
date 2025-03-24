import { model, Schema } from "mongoose";


const adminSchema=new Schema(
    {
        email:{
            type:String
        },
        password:{
            type:String
        }
    },
    {
        timestamps:true
    }
)


const AdminModel=model("AdminModel",adminSchema)

export default AdminModel