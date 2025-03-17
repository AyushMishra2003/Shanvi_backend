import { model, Schema } from "mongoose";


const messageModel=new Schema(
    {
        tag:{
            type:Number,
            default:0
        }
    },
    {
        timestamps:true
    }
)


const MessageModel=model("Message-Model",messageModel)

export default MessageModel