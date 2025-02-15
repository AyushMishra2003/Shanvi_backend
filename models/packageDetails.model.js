import mongoose, { model, Schema } from "mongoose";
import slugify from "slugify";

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
    },
    slug: {
      type: String,
      unique: true,
      required: true, // ✅ Required slug hona chahiye
    },
   
  },
  {
    timestamps: true,
  }
);

// 🔹 Update Slugs for Old Entries
const updatePackageSlugs = async (packageModel) => {
  try {
    const packages = await PackageDetail.find({
      $or: [{ slug: { $exists: false } }, { slug: "" }], // ✅ Missing + Empty Slug Fix
    });

    for (let service of packages) {
      if (!service.packageName || typeof service.packageName !== "string") {
        console.warn(`⚠️ Skipping: Invalid packageName for ${service._id}`);
        continue; // Skip if packageName is missing or not a string
      }
    
      service.slug = slugify(service.packageName, { lower: true, strict: true });
      await service.save();
      console.log(`🔄 Updated Slug: ${service.packageName} → ${service.slug}`);
    }

    console.log("✅ All missing slugs updated!");
  } catch (error) {
    console.error("❌ Error updating slugs:", error);
  }
};

// Define the model for 'PackageDetail'
const PackageDetail = model('PackageDetail', packageDetailsSchema);

export {PackageDetail,updatePackageSlugs} 
