import mongoose, { model, Schema } from "mongoose";
import slugify from "slugify"; // ✅ Slugify Import Karo

const serviceDetailSchema = new Schema(
  {
    serviceDetailName: {
      type: String,
      required: true, // ✅ Required kar diya taaki empty na aaye
    },
    serviceDetail: {
      type: String,
    },
    servicePhoto: {
      public_id: {
        type: String,
        default: "",
      },
      secure_url: {
        type: String,
        default: "",
      },
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true, // ✅ Slug required hona chahiye
    },
  },
  {
    timestamps: true,
  }
);

// 🔹 Slug generate before saving
serviceDetailSchema.pre("save", function (next) {
  if (!this.slug) { // ✅ Agar slug missing hai toh generate karo
    this.slug = slugify(this.serviceDetailName, { lower: true, strict: true });
  }
  next();
});

// 🔹 Update Slugs for Old Entries
const updateServiceDetailSlugs = async (ServiceDetailModel) => {
  try {
    const details = await ServiceDetailModel.find({
      $or: [{ slug: { $exists: false } }, { slug: "" }], // ✅ Missing + Empty Slug Fix
    });

    for (let detail of details) {
      detail.slug = slugify(detail.serviceDetailName, { lower: true, strict: true });
      await detail.save();
      console.log(`🔄 Updated Slug: ${detail.serviceDetailName} → ${detail.slug}`);
    }

    console.log("✅ All missing slugs updated!");
  } catch (error) {
    console.error("❌ Error updating slugs:", error);
  }
};

const ServiceDetailModel = model("Service_Detail", serviceDetailSchema);

export { ServiceDetailModel, updateServiceDetailSlugs }; // ✅ Dono export kar diye
