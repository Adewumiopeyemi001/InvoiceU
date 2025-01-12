import Client from "../models/clients.model.js";
import User from "../models/users.model.js";
import Company from "../models/companys.model.js";
import Invoice from "../models/invoices.model.js";
import mongoose from 'mongoose';
import { errorResMsg, successResMsg } from "../lib/responses.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import emailSenderTemplate from "../middlewares/email.js";
import ejs from 'ejs';
import { generateInvoicePDF } from "../lib/generatepdf.js";

export const generateInvoiceNumber = async (req, res) => {
    try {
        const invoiceNumber = `#INV_${Math.floor(Math.random() * 900000) + 100000}`;
        return successResMsg(res, 200, {
            success: true,
            invoiceNumber,
        });
    } catch (error) {
        console.error('Error generating invoice number:', error);
        return errorResMsg(res, 500, 'Internal Server Error');
    }
};

export const createInvoice = async (req, res) => {
    try {
        const { user } = req;
        const { invoiceNumber, status, clientId, items, AccountDetails} = req.body;

         // Check if invoice number is provided
         if (!invoiceNumber) {
            return errorResMsg(res, 400, 'Invoice number is required');
        }


        // Validate items and dates
        if (!items || items.length === 0) {
            return errorResMsg(res, 400, 'Invoice items are required');
        }
        // Validate AccountDetails if provided
        if (AccountDetails) {
            const { accountType, bankName, accountName, accountNumber } = AccountDetails;
            if (!accountType || !bankName || !accountName || !accountNumber) {
                return errorResMsg(res, 400, 'All fields in AccountDetails must be provided if AccountDetails is included');
            }

            // Validate account number is exactly 10 digits
            if (!/^\d{10}$/.test(accountNumber)) {
                return errorResMsg(res, 400, 'Account number must be exactly 10 digits');
            }
        }

        // Calculate total amount
        const subTotal = items.reduce((acc, item) => acc + item.quantity * item.rate, 0);
        if (subTotal <= 0) {
            return errorResMsg(res, 400, 'Invalid total amount');
        }

        // Calculate 10% tax and total amount
        const tax = 0;
        const total = subTotal + tax;

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

        // Create new invoice
        const newInvoice = new Invoice({
            user: user._id,
            company: existingCompany._id,
            client: existingClient._id,
            invoiceNumber,
            subTotal,
            tax,
            total,
            phoneNumber: existingClient.phoneNo || null,
            email: existingClient.email || null,
            status,
            items,
            AccountDetails: AccountDetails || undefined, // Include if provided
        });

        await newInvoice.save();

        return successResMsg(res, 201, {
            success: true,
            message: 'Invoice Created successfully',
            invoice: newInvoice, // Return the full invoice object
        });
    } catch (error) {
        console.error('Error creating invoice:', error);
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
           .populate('client', 'clientName')
        
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
            // reference: invoice.reference,
            invoiceNumber: invoice.invoiceNumber,
            // issueDate: invoice.issueDate,
            totalAmount: invoice.total,
            status: invoice.status,
            clientName: invoice.client.clientName,
        }));
        console.log(invoiceDetails);
        

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
            .populate('client', 'clientName'); // Populate the client field with the businessName only

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
            // reference: invoice.reference,
            invoiceNumber: invoice.invoiceNumber,
            // issueDate: invoice.issueDate,
            totalAmount: invoice.totalAmount,
            status: invoice.status,
            clientName: invoice.client.clientName, // Adding client business name here
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

export const totalInvoiceById = async (req, res) => {
    try {
        const { user } = req;
        const { clientId } = req.params;

        if (!user) {
            return errorResMsg(res, 401, 'User not found');
        }

        // Validate if the client exists and belongs to the user
        const existingClient = await Client.findOne({
            _id: clientId,
            user: user._id,  // Ensure client belongs to the user
        });
        if (!existingClient) {
            return errorResMsg(res, 400, 'Client details not found or client does not belong to the user.');
        }

        // Count completed invoices for the specific client
        const completedInvoicesCount = await Invoice.countDocuments({
            user: user._id,
            client: existingClient._id,
            status: 'Completed',
        });

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
        const { status, clientId, items, AccountDetails } = req.body;

        if (!user) {
            return errorResMsg(res, 401, 'User not found');
        }

        // Find the invoice and ensure it's a draft before allowing updates
        const existingInvoice = await Invoice.findOne({ _id: invoiceId, user: user._id });

        if (!existingInvoice) {
            return errorResMsg(res, 404, 'Invoice not found');
        }

        // Validate AccountDetails if provided
        if (AccountDetails) {
            const { accountType, bankName, accountName, accountNumber } = AccountDetails;
            if (!accountType || !bankName || !accountName || !accountNumber) {
                return errorResMsg(res, 400, 'All fields in AccountDetails must be provided if AccountDetails is included');
            }
            if (accountNumber.length !== 10) {
                return errorResMsg(res, 400, 'Account number must be exactly 10 digits');
            }
        }

        // Update invoice details
        const updatedFields = {
            client: clientId || existingInvoice.client,
            items: items || existingInvoice.items,
            AccountDetails: AccountDetails || existingInvoice.AccountDetails,
            status: status || existingInvoice.status,
        };

        // Update the invoice document
        await Invoice.findByIdAndUpdate(invoiceId, updatedFields, { new: true });

        return successResMsg(res, 200, {
            success: true,
            message: 'Invoice updated successfully',
            invoice: updatedFields,
        });

    } catch (error) {
        console.error(error);
        return errorResMsg(res, 500, 'Internal Server Error');
    }
};

export const deleteInvoice = async(req, res) => {
    try {
        const {user} = req;
        const {invoiceId} = req.params;
        
        if (!user) {
            return errorResMsg(res, 401, 'User not found');
        }
        
        const invoice = await Invoice.findOneAndDelete({ _id: invoiceId, user: user._id });
        
        if (!invoice) {
            return errorResMsg(res, 404, 'Invoice not found');
        }
        
        return successResMsg(res, 200, {
            success: true,
            message: 'Invoice deleted successfully',
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

        if (!user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Fetch the invoice and populate related fields
        const invoice = await Invoice.findById(invoiceId)
            .populate('client')
            .populate('company')
            .populate('account');

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Ensure the invoice has an invoice number and necessary data
        if (!invoice.invoiceNumber) {
            return res.status(400).json({ message: 'Invoice number missing' });
        }

        // Generate PDF
        const filePath = await generateInvoicePDF(invoice);

        // Check if the filePath is valid
        if (!filePath || typeof filePath !== 'string') {
            console.error('PDF generation failed: filePath is invalid');
            return res.status(500).json({ message: 'Failed to generate invoice PDF' });
        }

        // Log file path for debugging
        console.log(`File generated at: ${filePath}`);

        // Send file for download
        res.download(filePath, `invoice_${invoice.invoiceNumber}.pdf`, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                res.status(500).json({ message: 'Error downloading file' });
            }
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const shareInvoices = async (req, res) => {
    try {
        const { user } = req;
        const { invoiceIds, email } = req.params;
        
        if (!user) {
            return errorResMsg(res, 401, 'User not found');
        }

        // Validate invoice IDs - assuming `invoiceIds` is a comma-separated string
        const validInvoiceIds = invoiceIds
            .split(',')  // Split by comma if multiple IDs are passed
            .map(id => {
                // Create ObjectId instances correctly
                if (mongoose.Types.ObjectId.isValid(id)) {
                    return new mongoose.Types.ObjectId(id);
                }
                return null;
            })
            .filter(Boolean);

        if (validInvoiceIds.length === 0) {
            return errorResMsg(res, 400, 'Invalid invoice IDs provided');
        }

        // Fetch the invoices and populate related fields
        const invoices = await Invoice.find({ _id: { $in: validInvoiceIds }, user: user._id })
            .populate('client')
            .populate('company')
            .populate('account');

        if (invoices.length === 0) {
            return errorResMsg(res, 404, 'No invoices found for the given IDs');
        }

        // Generate PDFs for each invoice
        const pdfFiles = await Promise.all(invoices.map(invoice => generateInvoicePDF(invoice)));

        // Check if any PDF generation failed
        if (pdfFiles.some(filePath => typeof filePath !== 'string')) {
            console.error('PDF generation failed for some invoices');
            return errorResMsg(res, 500, 'Failed to generate invoice PDFs');
        }

        // Log file paths for debugging
        console.log('Generated PDFs for:', pdfFiles);

        // Create an array of attachments
        const attachments = pdfFiles.map((filePath, index) => ({
            invoiceNumber: invoices[index].invoiceNumber,
            path: filePath
        }));

        // Optionally: Handle sharing logic (e.g., email, WhatsApp, etc.)
        const currentFilePath = fileURLToPath(import.meta.url);
        const currentDir = dirname(currentFilePath);
        const templatePath = path.join(
            currentDir,
            '../public/emails/shareinvoice.ejs'
        );

        // Render the email template with the attachments
        await ejs.renderFile(
            templatePath,
            {
                title: 'Invoice sent successfully',
                firstName: user.firstName,
                attachments: attachments // Pass attachments to the template
            },
            async (err, data) => {
                if (err) {
                    console.error('Error rendering email template:', err);
                    return errorResMsg(res, 500, 'Error rendering email template');
                }

                await emailSenderTemplate(data, 'Invoice sent', email, attachments);
            }
        );

        // Send response back with the file paths
        res.status(200).json({
            success: true,
            message: 'PDF files generated successfully',
            files: pdfFiles.map((filePath, index) => ({
                filename: `invoice_${invoices[index].invoiceNumber}.pdf`,
                path: filePath,
            })),
        });

    } catch (error) {
        console.error('Server error:', error);
        return errorResMsg(res, 500, 'Server error');
    }
};
