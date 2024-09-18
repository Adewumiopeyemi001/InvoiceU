import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, // Ensure account is always linked to a user
    },
    accountType: {
        type: String,
        required: true,
    },
    bankName: {
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
        unique: true,
        validate: {
            validator: (value) => /^\d{10}$/.test(value), // Ensures exactly 10 digits
            message: "Account number must be exactly 10 digits.",
        },
    },
},
{
    timestamps: true,
    versionKey: false,
});

export default mongoose.model("Account", accountSchema);
