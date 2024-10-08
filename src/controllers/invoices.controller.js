import Client from "../models/clients.model.js";
import User from "../models/users.model.js";
import Company from "../models/companys.model.js";
import Invoice from "../models/invoices.model.js";
import { errorResMsg, successResMsg } from "../lib/responses.js";
import accountsModel from "../models/accounts.model.js";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
// import PDFDocument from 'pdfkit';

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

        // console.log(accountDetailsId, accountNumber);

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
           .populate('client', 'businessName')
        
             // If no invoices are found, return an empty array
        if (invoices.length === 0) {
            return successResMsg(res, 200, {
                success: true,
                message: 'No invoices found for the given status',
                invoices: [], // Empty array
            });
        }

        // Map over the invoices array to extract required details, including client business name
        const invoiceDetails = invoices.map((invoice) => ({
            reference: invoice.reference,
            invoiceNumber: invoice.invoiceNumber,
            issueDate: invoice.issueDate,
            totalAmount: invoice.totalAmount,
            status: invoice.status,
            clientBusinessName: invoice.client.businessName, // Adding client business name here
        }));

        return successResMsg(res, 200, {
            success: true,
            invoiceDetails,
        });
        
    } catch (error) {
        console.error(error);
        return errorResMsg(res, 500, 'Internal Server Error');
        
    }
};

export const filterByStatus = async (req, res) => {
    try {
        const { user } = req;
        const { status } = req.query;

        if (!user) {
            return errorResMsg(res, 401, 'User not found');
        }

        // Find all invoices for the user with the given status and populate client details
        const invoices = await Invoice.find({ user: user._id, status })
            .populate('client', 'businessName'); // Populate the client field with the businessName only

        // If no invoices are found, return an empty array
        if (invoices.length === 0) {
            return successResMsg(res, 200, {
                success: true,
                message: 'No invoices found for the given status',
                invoices: [], // Empty array
            });
        }

        // Map over the invoices array to extract required details, including client business name
        const invoiceDetails = invoices.map((invoice) => ({
            reference: invoice.reference,
            invoiceNumber: invoice.invoiceNumber,
            issueDate: invoice.issueDate,
            totalAmount: invoice.totalAmount,
            status: invoice.status,
            clientBusinessName: invoice.client.businessName, // Adding client business name here
        }));

        // Return the array of invoice details
        return successResMsg(res, 200, {
            success: true,
            invoiceDetails,
        });

    } catch (error) {
        console.error(error);
        return errorResMsg(res, 500, 'Internal Server Error');
    }
};

export const totalInvoice = async (req, res) => {
    try {
        const { user } = req;
        if (!user) {
            return errorResMsg(res, 401, 'User not found');
        }

        // Count the total number of invoices with status "Completed" for the user
        const completedInvoicesCount = await Invoice.countDocuments({ user: user._id, status: 'Completed' });

        return successResMsg(res, 200, {
            success: true,
            totalCompletedInvoices: completedInvoicesCount,
        });

    } catch (error) {
        console.error(error);
        return errorResMsg(res, 500, 'Internal Server Error');
    }
};

export const updateInvoice = async (req, res) => {
    try {
        const { user } = req;
        const { invoiceId } = req.params;
        const { status, clientId, items, issueDate, dueDate, phoneNumber, email, accountDetailsId } = req.body;

        if (!user) {
            return errorResMsg(res, 401, 'User not found');
        }

        // Find the invoice and ensure it's a draft before allowing updates
        const existingInvoice = await Invoice.findOne({ _id: invoiceId, user: user._id });

        if (!existingInvoice) {
            return errorResMsg(res, 404, 'Invoice not found');
        }

        if (existingInvoice.status !== 'Draft') {
            return errorResMsg(res, 400, 'Only invoices with status "Draft" can be updated');
        }

        // Fetch or validate account details if provided
        let accountNumber = existingInvoice.accountNumber; // Retain existing account number
        if (accountDetailsId) {
            const existingAccount = await accountsModel.findOne({ _id: accountDetailsId });
            if (!existingAccount) {
                return errorResMsg(res, 404, 'Account details not found');
            }
            accountNumber = existingAccount.accountNumber;
        }

        // Update invoice details
        existingInvoice.client = clientId || existingInvoice.client;
        existingInvoice.items = items || existingInvoice.items;
        existingInvoice.issueDate = issueDate || existingInvoice.issueDate;
        existingInvoice.dueDate = dueDate || existingInvoice.dueDate;
        existingInvoice.phoneNumber = phoneNumber || existingInvoice.phoneNumber;
        existingInvoice.email = email || existingInvoice.email;
        existingInvoice.account = accountDetailsId ? accountDetailsId : existingInvoice.account;
        existingInvoice.status = status || existingInvoice.status;

        await existingInvoice.save();

        return successResMsg(res, 200, {
            success: true,
            message: 'Invoice updated successfully',
            invoice: existingInvoice
        });

    } catch (error) {
        console.error(error);
        return errorResMsg(res, 500, 'Internal Server Error');
    }
};



export const downloadInvoice = async (req, res) => {
    try {
        const { user } = req;
        const { invoiceId } = req.params;

        // Find the invoice
        const invoice = await Invoice.findOne({ _id: invoiceId, user: user._id })
            .populate('client', 'businessName address clientIndustry country')
            .populate('company', 'companyName companyAddress companyLogo occupation')
            .populate('account', 'accountNumber');
        console.log(invoice);
        
        if (!invoice) {
            return errorResMsg(res, 404, 'Invoice not found');
        }

        // Create the invoices directory if it doesn't exist
        // const invoicesDir = path.join(__dirname, '../invoices');
        const invoicesDir = path.resolve('invoices');
        if (!fs.existsSync(invoicesDir)) {
            fs.mkdirSync(invoicesDir, { recursive: true });
        }

        // Define the file path
        const filePath = path.join(invoicesDir, `invoice_${invoice.invoiceNumber}.pdf`);

        // Create a new PDF document
        const doc = new PDFDocument();

        // Pipe the PDF into the file
        doc.pipe(fs.createWriteStream(filePath));

        // Add invoice details to the PDF
        doc.fontSize(20).text(`Invoice: ${invoice.invoiceNumber}`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).text(`Business: ${invoice.company.companyName}`, { align: 'left' });
        doc.text(`Address: ${invoice.company.companyAddress}`, { align: 'left' });
        doc.moveDown();
        doc.text(`Client: ${invoice.client.businessName}`, { align: 'left' });
        doc.text(`Client Address: ${invoice.client.address}`, { align: 'left' });
        doc.moveDown();

        // Add items
        doc.text(`Items:`);
        invoice.items.forEach((item, index) => {
            doc.text(`${index + 1}. ${item.description} - ${item.quantity} x ${item.rate}`, { align: 'left' });
        });

        doc.moveDown();
        doc.text(`Total Amount: $${invoice.totalAmount}`, { align: 'left' });
        if (invoice.account) {
            doc.text(`Account Number: ${invoice.account.accountNumber}`, { align: 'left' });
        }

        // Finalize the PDF file
        doc.end();

        // Send the PDF file as a response
        res.download(filePath, `invoice_${invoice.invoiceNumber}.pdf`);

    } catch (error) {
        console.error(error);
        return errorResMsg(res, 500, 'Internal Server Error');
    }
};



