import { model, Schema } from "mongoose";


const utlisSchema=new Schema(
    {
        title:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    {
        timeStamps:true
    }
)

const UtlisModel=model('utlisSchema',utlisSchema)


export default UtlisModel