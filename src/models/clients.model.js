import mongoose from "mongoose";

const clientModel = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    businessName: {
        type: String,
        required: true,
    },
    clientIndustry: { 
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    country: {
        type: String,
    },
    city: {
        type: String,
    },
    zipCode: {
        type: String,
    },
    address: {
        type: String,
    }
},
{
    timestamps: true,
    versionKey: false,
}
);

export default mongoose.model("Client", clientModel);