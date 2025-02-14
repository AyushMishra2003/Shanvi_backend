import mongoose, { model, Schema } from "mongoose";
import slugify from "slugify";

const pathologyDetailsSchema = new Schema(
  {
    department: { type: String }, // Fixed spelling
    subDepartment: { type: String }, // Fixed spelling
    testDetailName: { type: String },
    category: { type: String },
    testPrice: { type: Number },
    testDetails1: { type: String },
    testDetails2: { type: String },
    refService: { type: String },
    testDiscount: { type: Number },
    testRequirement1: { type: String },
    testRequirement2: { type: String },
    testDeliver1: { type: String },
    testDeliver2: { type: String },
    paramterInclude: { type: String },
    sampleCollection: { type: String },
    reportConsuling: { type: String },
    reportTime: { type: String },
    fasting: { type: String },
    recommedFor: { type: String },
    age: { type: String },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "TestModel" },
    slug: { type: String, unique: true },
    categorySlug: { type: String, unique: true },
  },
  { timestamps: true }
);

// Middleware to generate a unique slug
pathologyDetailsSchema.pre("save", async function (next) {
  let slug = slugify(this.testDetailName, { lower: true, strict: true });

  let existingTest = await PathologyDetail.findOne({ slug }); // Fixed
  let count = 1;

  while (existingTest) {
    slug = `${slug}-${count}`;
    existingTest = await PathologyDetail.findOne({ slug }); // Fixed
    count++;
  }

  this.slug = slug;
  next();
});

// Correct Model Name
const PathologyDetail = model("PathologyDetail", pathologyDetailsSchema);

export default PathologyDetail;
