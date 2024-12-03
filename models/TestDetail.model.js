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
         testRequirement1:{
            type:String
         },
         testRequirement2:{
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


const TestDetailModel=model("TestDetail",TestDetailSchema)


export default TestDetailModel