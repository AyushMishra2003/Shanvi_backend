import mongoose, { model, Schema } from "mongoose";

const pathologyDetailsSchema = new Schema(
  {
    pathologyPhoto: {
      public_id: {
        type: String,
        default: '',
      },
      secure_url: {
        type: String,
        default: '',
      },
    },
    pathologyName:{
      type:String
    },
    pathologyOverview:{
      type:String
    },
    pathologyCategory: {
      type: String,
    },
    pathologyRate: {
      type: String,
    },
    pathologyDiscount: {
      type: String,
    },
    parameterInclude: {
      type:String,
    },
    report: {
      type: String,
    },

    pathologyParamterDetails:{
      type:String
    }
  },
  {
    timestamps: true,
  }
);

// Define the model for 'pathologyDetail'
const PathologyDetail = model('PathologyDetailSchema',pathologyDetailsSchema );

export default PathologyDetail;
