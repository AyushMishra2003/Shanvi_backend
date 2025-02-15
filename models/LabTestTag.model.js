import mongoose, { model, Schema } from "mongoose";

const labTagSchema = new Schema(
    {
        labTagName: {
            type: String
        },
        labSlugName: {
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
        labId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PathologyDetail",
            required: true,
        },
    },
    {
        timestamps: true
    }
)

const labTagModel = model("labTagSchema", labTagSchema)

export default labTagModel