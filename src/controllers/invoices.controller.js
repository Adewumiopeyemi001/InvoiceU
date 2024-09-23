import Client from "../models/clients.model.js";
import User from "../models/users.model.js";
import Company from "../models/companys.model.js";
import { errorResMsg, successResMsg } from "../lib/responses.js";

export const createInvoice = async (req, res) => {
    try {
        // Fetch user, company, client, and account information
        const { user, company, client } = req; // Assuming `req` is populated with authenticated data
        const { items, issueDate, dueDate, totalAmount, phoneNumber, status, accountNumber } = req.body;

        // Generate reference and invoice number using the same timestamp
        const timestamp = Date.now();
        const reference = `INV_${timestamp}`;
        const invoiceNumber = `#AB${timestamp}`;

        // Validate required fields
        if (!items || !issueDate || !dueDate || !totalAmount || !phoneNumber || !accountNumber) {
            return errorResMsg(res, 400, 'All fields are required');
        }

        // Check if user data exists
        const existingUser = await User.findOne({ _id: user._id });
        if (!existingUser) {
            return errorResMsg(res, 401, 'User not found');
        }

        // Check if company data exists
        const existingCompany = await Company.findOne({
            user: user._id,
            _id: company._id,
        });
        if (!existingCompany) {
            return errorResMsg(res, 404, 'Company details not found');
        }

        // Check if client data exists
        const existingClient = await Client.findOne({
            user: user._id,
            _id: client._id,
        });
        if (!existingClient) {
            return errorResMsg(res, 400, 'Please create a new client');
        }

        // Check if account data exists
        const existingAccount = await Account.findOne({
            accountNumber,
            user: user._id,
        });
        if (!existingAccount) {
            return errorResMsg(res, 400, 'Please provide a valid account');
        }

        // Create new invoice
        const newInvoice = new Invoice({
            user: user._id,
            company: company._id,
            client: client._id,
            accountNumber,
            invoiceNumber,
            issueDate,
            dueDate,
            totalAmount,
            reference,
            phoneNumber,
            status,
            items,
        });

        await newInvoice.save();

        return successResMsg(res, 201, {
            success: true,
            message: 'Invoice created successfully',
            invoice: newInvoice,
        });
    } catch (error) {
        console.error(error);
        return errorResMsg(res, 500, 'Internal Server Error');
    }
};
