import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    accountType: {
        type: String,
        required: true,
    },
    BankName: {
        type: String,
        required: true,
    },
    accountName: {
        type: String,
        required: true,
    },
    accountNumber: {
        type: String,
        required: true,
    },
},
    {
        timestamps: true,
        versionKey: false,
    }
);

export default mongoose.model("Account", accountSchema);
