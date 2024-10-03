import Client from "../models/clients.model.js";
import User from "../models/users.model.js";
import Company from "../models/companys.model.js";
import Invoice from "../models/invoices.model.js";
import { errorResMsg, successResMsg } from "../lib/responses.js";
import accountsModel from "../models/accounts.model.js";

export const createInvoice = async (req, res) => {
    try {
        const { user } = req;
        const { items, issueDate, dueDate, phoneNumber, email, accountDetails } = req.body;

        // Check if required fields are provided
        if (!items || items.length === 0) {
            return errorResMsg(res, 400, 'Invoice items are required');
        }
        if (!issueDate || !dueDate) {
            return errorResMsg(res, 400, 'Issue date and due date are required');
        }

        // Calculate total amount
        const totalAmount = items.reduce((acc, item) => acc + item.quantity * item.rate, 0);

        if (totalAmount <= 0) {
            return errorResMsg(res, 400, 'Invalid total amount');
        }

        // Check if user exists
        const existingUser = await User.findById(user._id);
        if (!existingUser) {
            return errorResMsg(res, 401, 'User not found');
        }

        // Fetch company data for the user
        const existingCompany = await Company.findOne({ user: user._id });
        if (!existingCompany) {
            return errorResMsg(res, 404, 'Company details not found');
        }

        // Fetch client data (assuming client ID is provided in req.body)
        const existingClient = await Client.findById(req.body.clientId);
        console.log(existingClient);
        
        if (!existingClient) {
            return errorResMsg(res, 400, 'Client details not found, please create a new client');
        }

        // Fetch account data for the user (optional)
        const existingAccount = await accountsModel.findOne({ user: user._id });
        if (!existingAccount) {
            return errorResMsg(res, 404, 'Account details not found');
        }

        // Create reference and invoice number using timestamp
        const timestamp = Date.now();
        const reference = `#AB${timestamp}`;
        const invoiceNumber = `#INV_${Math.floor(Math.random() * 900000) + 100000}`;

        // Determine invoice status based on optional fields
        const status = phoneNumber || accountDetails ? 'Completed' : 'Draft';

        // Create new invoice
        const newInvoice = new Invoice({
            user: user._id,
            company: existingCompany._id,
            client: existingClient._id,
            invoiceNumber,
            issueDate,
            dueDate,
            totalAmount,
            reference,
            phoneNumber: phoneNumber || null, // Optional phone number
            accountNumber: accountDetails ? accountDetails.accountNumber : null, // Optional account details
            status,
            items,
        });

        await newInvoice.save();

        return successResMsg(res, 201, {
            success: true,
            message: 'Invoice created successfully',
            invoice: {
                invoiceNumber,
                issueDate,
                dueDate,
                totalAmount,
                reference,
                phoneNumber,
                status,
                items,
            }
        });
    } catch (error) {
        console.error(error);
        return errorResMsg(res, 500, 'Internal Server Error');
    }
};
