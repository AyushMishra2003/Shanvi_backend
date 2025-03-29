import { model, Schema } from "mongoose";



const collectionSchema=new Schema(
    {
       name:{
        type:String,
        required:true
       },
       email:{
        type:String,
        required:true
       },
       password:{
        type:String,
        required:true
       },
       status:{
        type:String,
        enum:["onfield","active","deactive"]
       },
       orderDetails: [
        {
          type: Schema.Types.ObjectId,
          ref: "OrderModel",
          default: [],
        },
      ],
      lat:{
        type:String,
        default:""
      },
      lng:{
        type:String,
        default:""
      },
      address:{
        type:String,
        default:""
      },
     
      fcmToken:{
        type:String,
        default:""
      },


    },
    {
        timestamps:true
    }
)


const collectionModel=model("CollectionSales",collectionSchema)

export default collectionModel