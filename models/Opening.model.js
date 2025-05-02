import { model, Schema } from "mongoose";



const openingSchema=new Schema(
    {
         jobTitle:{
             type:String,
             
         },
         jobDescription:{
            type:String
         },
         location:{
            type:String
         },
         jobCategory:{
            type:String
         },
         jobType:{
            type:String
         },
         qualifications:{
            type:String
         },
         responsibilities:{
            type:String
         },
         salary:{
            type:String
         },
         skills:{
            type:String
         },
         deadline:{
            type:String
         },

         isOpen:{
            type:Boolean,
            enum:[true,false]
         },
         numberApplied:{
            type:Number
         },
      
    },
    {
        timestamps:true
    }
)


const OpeningModel=model("OpeningSchema",openingSchema)

export default OpeningModel