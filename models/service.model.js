import { model, Schema } from "mongoose";
import slugify from "slugify";

const serviceSchema = new Schema(
  {
    serviceName: {
      type: String,
      required: true, // ✅ Required kar diya
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
    serviceDetails: [
      {
        type: Schema.Types.ObjectId,
        ref: "Service_Detail", // Referencing the Service_Detail model
        default: [],
      },
    ],
    slug: {
      type: String,
      unique: true,
      // required: true, // ✅ Required slug hona chahiye
    },
  },
  {
    timestamps: true,
  }
);

// 🔹 Slug generate before saving
serviceSchema.pre("save", function (next) {
  if (!this.slug) { // ✅ Agar slug missing hai toh generate karo
    this.slug = slugify(this.serviceName, { lower: true, strict: true });
  }
  next();
});

// 🔹 Update Slugs for Old Entries
const updateSlugs = async (ServiceModel) => {
  try {
    const services = await ServiceModel.find({
      $or: [{ slug: { $exists: false } }, { slug: "" }], // ✅ Missing + Empty Slug Fix
    });

    for (let service of services) {
      service.slug = slugify(service.serviceName, { lower: true, strict: true });
      await service.save();
      console.log(`🔄 Updated Slug: ${service.serviceName} → ${service.slug}`);
    }

    console.log("✅ All missing slugs updated!");
  } catch (error) {
    console.error("❌ Error updating slugs:", error);
  }
};

const ServiceModel = model("Service", serviceSchema);

export { ServiceModel, updateSlugs }; // ✅ Dono export kar diya

