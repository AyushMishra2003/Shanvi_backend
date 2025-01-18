import { model, Schema } from "mongoose"

const carrerSchema=new Schema(
    {
        contact:{
            type:String
        },
        currentCompany:{
            type:String
        },
        currentDesignation:{
            type:String
        },
        email:{
            type:String
        },
        highestQualification:{
            type:String
        },
        name:{
            type:String
        },
        position:{
            type:String
        },
        resume:{
            public_id:{
                type:String
            },
            secure_url:{
                type:String
            }
        },
        totalExperience:{
            type:String
        }
    },
    {
        timestamps:true
    }
)


const  CarrerModel=model("CarrerModel",carrerSchema)

export default CarrerModel