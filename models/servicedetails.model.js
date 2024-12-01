import mongoose, { model, Schema } from "mongoose";


const serviceDetailSchema=new Schema(
    {
         serviceDetailName:{
            type:String
         },
         serviceDetail:{
            type:String
         },
         servicePhoto: {
            public_id: {
              type: String,
              default: '',
            },
            secure_url: {
              type: String,
              default: '',
            },
          },
          serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: true,
          },
    },
    {
        timestamps:true
    }
)


const ServiceDetailModel=model("Service_Detail",serviceDetailSchema)

export default ServiceDetailModel