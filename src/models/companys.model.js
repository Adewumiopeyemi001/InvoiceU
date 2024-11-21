import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    companyName: {
        type: String,
    },
    companyLogo: {
        type: String,
    },
    occupation: {
        type: String,
    },
    industry: {
        type: String,
    },
    country: {
        type: String,
    },
    // city: {
    //     type: String,
    // },
    state: {
        type: String,
    },
    zipCode: {
        type: String,
    },
    companyAddress: {
        type: String,
    },
},
{
    timestamps: true,
    versionKey: false,
});

export default mongoose.model("Company", companySchema);
