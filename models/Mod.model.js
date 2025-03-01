import { model, Schema } from "mongoose";


const modSchema=new Schema(
    {
         name:{
            type:String
         }
    },
    {
        timestamps:true
    }
)

const ModModel=model("ModSchema",modSchema)

export default ModModel