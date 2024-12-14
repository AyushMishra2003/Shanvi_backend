import { model, Schema } from "mongoose";



const TestSchema=new Schema(
    {
         testName:{
            type:String
         },
         testPhoto: {
            public_id: {
              type: String,
              default: '',
            },
            secure_url: {
              type: String,
              default: '',
            },
        },
        testDetail: [
            {
              type: Schema.Types.ObjectId,
              ref: 'TestDetail', 
              default: []  
            },
          ],
    },
    {
        timestamps:true
    }
)

const TestModel=model("TestModel",TestSchema)

export default TestModel