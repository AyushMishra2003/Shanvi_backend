import { model, Schema } from "mongoose";


const doctorSchema=new Schema(
    {
       doctorName:{
        type:String
       },
       doctorPhoto: {
        public_id: {
          type: String,
          default: '',
        },
        secure_url: {
          type: String,
          default: '',
        },
      },
      doctorDesination:{
        type:String
      }
    },
    {
        timestamps:true
    }
)

const DoctorModel=model("Doctor_Model",doctorSchema)

export default DoctorModel