import { model, Schema } from "mongoose";

const packageSchema = new Schema(
  {
    packageName: {
      type: String,
      required: true,
    },
    packageDetails: [
      {
        type: Schema.Types.ObjectId,
        ref: 'PackageDetail', // Referencing the PackageDetail model here,
        default: [] // Default empty array if no details are provided
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Define the model for 'Package'
const PackageModel = model('Package', packageSchema);

export default PackageModel;
