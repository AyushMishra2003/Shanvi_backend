import mongoose, { model, Schema } from "mongoose";
import slugify from "slugify";


const TestDetailSchema=new Schema(
    {
         departement:{
            type:String
         },
         Sub_Department:{
             type:String
         },
         testDetailName:{
            type:String
         },
         category:{
            type:String
         },
         testPrice:{
            type:Number
         },
         testDetails1:{
            type:String
         },
         testDetails2:{
            type:String
         },
         refService:{
            type:String,
         },
         testDiscount:{
            type:Number
         },
         testRequirement1:{
            type:String
         },
         testRequirement2:{
            type:String
         },
         testDeliver1:{
            type:String
         },
         testDeliver2:{
            type:String
         },
         paramterInclude:{
            type:String
         },
         departement:{
            type:String
         },
         Sub_Department:{
             type:String
         },
         sampleCollection:{
            type:String
         },
         reportConsuling:{
            type:String
         },
         reportTime:{
            type:String
         },
         fasting:{
            type:String
         },
         recommedFor:{
            type:String
         },
         age:{
            type:String
         },
         testId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TestModel', 
            required: true,
         },
         slug: {
            type: String,
            // unique: true,
            // required: true, // ✅ Required slug hona chahiye
          },
    },
    {
        timestamps:true
    }
)

// 🔹 Update Slugs for Old Entries
const updateTestSlugs = async (TestDetailModel) => {
  try {
    const tests = await TestDetailModel.find({
      $or: [{ categorySlug: { $exists: false } }, { categorySlug: "" }], // ✅ Missing + Empty Slug Fix
    });

    for (let service of tests) {
      if (!service.category || typeof service.category !== "string") {
        console.warn(`⚠️ Skipping: Invalid packageName for ${service._id}`);
        continue; // Skip if packageName is missing or not a string
      }
    
      service.categorySlug = slugify(service.category, { lower: true, strict: true });
      await service.save();
      console.log(`🔄 Updated Slug: ${service.packageName} → ${service.slug}`);
    }

    console.log("✅ All missing slugs updated!");
  } catch (error) {
    console.error("❌ Error updating slugs:", error);
  }
};



// 🔹 Middleware: Ensure Unique Slug
TestDetailSchema.pre("save", async function (next) {
   let slug = slugify(this.testDetailName, { lower: true, strict: true });
 
   let existingTest = await mongoose.models.TestDetail.findOne({ slug });
   let count = 1;
 
   while (existingTest) {
     slug = `${slug}-${count}`;
     existingTest = await mongoose.models.TestDetail.findOne({ slug });
     count++;
   }
 
   this.slug = slug;
   next();
 });
 

const TestDetailModel=model("TestDetail",TestDetailSchema)


export { TestDetailModel ,updateTestSlugs }