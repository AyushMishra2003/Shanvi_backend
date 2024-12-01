import { model, Schema } from "mongoose";


const serviceSchema=new Schema(
    { 
        serviceName:{
            type:String
        },
        serviceDetails: [
            {
              type: Schema.Types.ObjectId,
              ref: 'Service_Detail', // Referencing the PackageDetail model here,
              default: [] // Default empty array if no details are provided
            },
          ],
    },
    {
        timestamps:true
    }
)


const ServiceModel=model("Service",serviceSchema)


export default ServiceModel