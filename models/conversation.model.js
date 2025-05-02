import { model, Schema } from "mongoose"


const conversationSchema= new Schema(
    {
            message:{
                type:String,
                required:true
            },
    },
    {
        timestamps:true
    }
)

const ConversationModel=model("Conversation",conversationSchema)


export default ConversationModel