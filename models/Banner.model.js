import { model, Schema } from "mongoose"



const BannerSchema=new Schema(
    {
        name:{
            type:String,
        },
        photo:{
            public_id: {
                type: String,
                default: '',
            },
            secure_url: {
                type: String,
                default: '',
            },
        },
        types:{
            type:String,
            enum:["banner1","banner2"]
        },
        index:{
            type:String,
        
        },
        url:{
          type:String
        }
    },
    {
        timestamps:true
    }
)


const BannerModel=model("BannerModel",BannerSchema)

export default BannerModel