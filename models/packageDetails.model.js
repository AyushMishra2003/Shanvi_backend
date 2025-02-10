import mongoose, { model, Schema } from "mongoose";

const packageDetailsSchema = new Schema(
  {
    packagePhoto: {
      public_id: {
        type: String,
        default: '',
      },
      secure_url: {
        type: String,
        default: '',
      },
    },
    packageName:{
      type:String
    },
    packageOverview:{
      type:String
    },
    packageCategory: {
      type: String,
    },
    packageRate: {
      type: Number,
    },
    packageDiscount: {
      type: Number,
    },
    parameterInclude: {
      type: Number,
    },
    report: {
      type: Number,
    },
    packagesParamter: [
      {
        parameterName: { type: String },
        description: { type: String },
      },
    ],
    // packageId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Package', 
    //   required: true,
    // },
    packageParamterDetails:{
      type:String
    },
    fasting:{
      type:String
    },
    recommededfor:{
      type:String
    },
    age:{
      type:String
    },
    instructionHindi:{
      type:String
    },
    instructionEnglish:{
      type:String
    }
  },
  {
    timestamps: true,
  }
);

// Define the model for 'PackageDetail'
const PackageDetail = model('PackageDetail', packageDetailsSchema);

export default PackageDetail;
