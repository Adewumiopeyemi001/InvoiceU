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
        required: true,
    }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, // Ensure invoice is always linked to a user
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true, // Ensure invoice is always linked to a company
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: true, // Ensure invoice is always linked to a client
    },
    issueDate: {
        type: Date,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
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
    reference: {
        type: String,
        required: true,
    },
    items: [itemSchema], // Array of items

    phoneNumber: {
        type: String,
        // Optional, can be set by user
    },
    email: {
        type: String,
        // Optional, can be set by user
    },
    account: {
        type: mongoose.Schema.Types.ObjectId, // Reference to Account schema
        ref: "Account", // Link this to Account model
        required: false // Not required, as not all invoices may include account details
    },
    status: {
        type: String,
        enum: ["Draft", "Completed"],
        default: "Draft",
    },
}, {
    timestamps: true,
    versionKey: false,
});

export default mongoose.model("Invoice", invoiceSchema);

