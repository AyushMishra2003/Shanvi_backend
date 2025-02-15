import mongoose, { model, Schema } from "mongoose";

const packageTagSchema = new Schema(
    {
        packageTagName: {
            type: String
        },
        packageSlugName: {
            type: String
        },
        icon: {
            public_id: {
                type: String,
                default: '',
            },
            secure_url: {
                type: String,
                default: '',
            },
        },
        packageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PackageDetail",
            required: true,
        },
    },
    {
        timestamps: true
    }
)

const PackageTagModel = model("PackageTagSchema", packageTagSchema)

export default PackageTagModel