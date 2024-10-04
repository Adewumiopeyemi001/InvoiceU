import Client from "../models/clients.model.js";
import User from "../models/users.model.js";
import Company from "../models/companys.model.js";
import Invoice from "../models/invoices.model.js";
import { errorResMsg, successResMsg } from "../lib/responses.js";
import accountsModel from "../models/accounts.model.js";

export const createInvoice = async (req, res) => {
    try {
        const { user } = req;
        const { status = "Draft" } = req.body;
        const { clientId, items, issueDate, dueDate, phoneNumber, email, accountDetailsId } = req.body;

        // Validate items and dates
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

        // Validate user and company
        const existingUser = await User.findById(user._id);
        if (!existingUser) {
            return errorResMsg(res, 401, 'User not found');
        }
        const existingCompany = await Company.findOne({ user: user._id });
        if (!existingCompany) {
            return errorResMsg(res, 404, 'Company details not found');
        }

        // Validate client
        const existingClient = await Client.findById(clientId);
        if (!existingClient) {
            return errorResMsg(res, 400, 'Client details not found, please create a new client');
        }

        // Fetch or validate account details if provided
        let accountNumber = null;
        let existingAccount = null; // Declare it here
        if (accountDetailsId) { // Ensure accountDetailsId exists
            existingAccount = await accountsModel.findOne({ _id: accountDetailsId });
            if (!existingAccount) {
                return errorResMsg(res, 404, 'Account details not found');
            }
            accountNumber = existingAccount.accountNumber;
        }

        console.log(accountDetailsId, accountNumber);

        // Generate invoice number and reference
        const timestamp = Date.now();
        const reference = `#AB${timestamp}`;
        const invoiceNumber = `#INV_${Math.floor(Math.random() * 900000) + 100000}`;

        // Create new invoice
        const newInvoice = new Invoice({
            user: user._id,
            company: existingCompany._id,
            client: existingClient._id,
            account: existingAccount ? existingAccount._id : null,
            invoiceNumber,
            issueDate,
            dueDate,
            totalAmount,
            reference,
            phoneNumber: phoneNumber || null,
            email: email || null,
            status, 
            items,
        });

        await newInvoice.save();

        return successResMsg(res, 201, {
            success: true,
            message: `Invoice ${status === "Draft" ? 'saved as draft' : 'completed successfully'}`,
            invoice: {
                invoiceNumber,
                issueDate,
                dueDate,
                totalAmount,
                reference,
                phoneNumber,
                status,
                items,
            },
        });
    } catch (error) {
        console.error(error);
        return errorResMsg(res, 500, 'Internal Server Error');
    }
};

export const getInvoiceById = async(req, res) => {
    try {
        const {user} = req;
        const {invoiceId} = req.params;
        
        if (!user) {
            return errorResMsg(res, 401, 'User not found');
        }
        
        const invoice = await Invoice.findOne({_id: invoiceId, user: user._id})
        
        if (!invoice) {
            return errorResMsg(res, 404, 'Invoice not found');
        }
        
        return successResMsg(res, 200, {
            success: true,
            invoice,
        });
        
    } catch (error) {
        console.error(error);
        return errorResMsg(res, 500, 'Internal Server Error');
        
    }
};

export const getAllInvoices = async(req, res) => {
    try {
        const {user} = req;
        const {page = 1, limit = 10, sortBy = 'issueDate', order = 'desc'} = req.query;
        
        if (!user) {
            return errorResMsg(res, 401, 'User not found');
        }
        
        const invoices = await Invoice.find({user: user._id})
           .sort({[sortBy]: order})
           .skip((page - 1) * limit)
           .limit(limit)
        
        return successResMsg(res, 200, {
            success: true,
            invoices,
        });
        
    } catch (error) {
        console.error(error);
        return errorResMsg(res, 500, 'Internal Server Error');
        
    }
};

export const filterByStatus = async(req, res) => {
    try {
        const {user} = req;
        const {status} = req.query;
        
        if (!user) {
            return errorResMsg(res, 401, 'User not found');
        }
        
        const invoices = await Invoice.find({user: user._id, status})
        
        return successResMsg(res, 200, {
            success: true,
            invoices,
        });
        
    } catch (error) {
        console.error(error);
        return errorResMsg(res, 500, 'Internal Server Error');
        
    }
};

