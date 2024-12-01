import mongoose, { model, Schema } from "mongoose";


const TestDetailSchema=new Schema(
    {
         testDetailName:{
            type:String
         },
         category:{
            type:String
         },
         testPrice:{
            type:Number
         },
         testDetail1:{
            type:String
         },
         testDetails2:{
            type:String
         },
         testDiscount:{
            type:Number
         },
         testRequirnment1:{
            type:String
         },
         testRequirnment2:{
            type:String
         },
         testDeliver1:{
            type:String
         },
         testDeliver2:{
            type:String
         },
         testId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TestModel', 
            required: true,
          },
    },
    {
        timestamps:true
    }
)


const TestDetailModel=model("TestDetails",TestDetailSchema)


export default TestDetailModel