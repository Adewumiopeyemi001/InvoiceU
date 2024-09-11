import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
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
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    zipCode: {
        type: String,
    },
    address: {
        type: String,
    },

});

export default mongoose.model("Company", companySchema);
