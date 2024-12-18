import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    rate: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        // required: true,
    }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, 
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true, 
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: true, 
    },
    
    // issueDate: {
    //     type: Date,
    //     required: true,
    // },
    // dueDate: {
    //     type: Date,
    //     required: true,
    // },
    subTotal: {
        type: Number,
        required: true,
    },
    tax : {
        type: Number,
        required: true,
    },
    total : {
        type: Number,
        required: true,
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
    },
    // reference: {
    //     type: String,
    //     required: true,
    // },
    items: [itemSchema], // Array of items

    phoneNumber: {
        type: String,
        // Optional, can be set by user
    },
    email: {
        type: String,
        // Optional, can be set by user
    },
    status: {
        type: String,
        // enum: ["Draft", "Completed"],
        default: "Completed",
    },
    AccountDetails: {
        type: {
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
            }
        },
        required: false, // AccountDetails is optional
        validate: {
            validator: function (value) {
                if (!value) return true; // If AccountDetails is not provided, it's valid
                // Ensure all subfields are provided
                return value.accountType && value.bankName && value.accountName;
            },
            message: "All fields in AccountDetails must be provided if AccountDetails is present",
        },
    },
}, {
    timestamps: true,
    versionKey: false,
});

export default mongoose.model("Invoice", invoiceSchema);

