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
import accountsModel from "../models/accounts.model.js";
import { generateInvoicePDF } from "../lib/generatepdf.js";
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
        const subTotal = items.reduce((acc, item) => acc + item.quantity * item.rate, 0);
        if (subTotal <= 0) {
            return errorResMsg(res, 400, 'Invalid total amount');
        }

       // Calculate 10% tax
        const tax = subTotal * 0.10;

// Calculate total amount
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
            subTotal,
            tax,
            total,
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
                subTotal,
                tax,
                total,
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

// export const shareInvoices = async(req, res) => {
//     try {
//         const { user } = req;
//         const { invoiceIds } = req.params;
        
//         if (!user) {
//             return errorResMsg(res, 401, 'User not found');
//         }
        
//         // Validate invoice IDs
//         const validInvoiceIds = invoiceIds.map(id => mongoose.Types.ObjectId(id)).filter(Boolean);
        
//         if (validInvoiceIds.length === 0) {
//             return errorResMsg(res, 400, 'Invalid invoice IDs provided');
//         }
        
//         // Fetch the invoices and populate related fields
//         const invoices = await Invoice.find({ _id: { $in: validInvoiceIds }, user: user._id })
//             .populate('client')
//             .populate('company')
//             .populate('account');
            
//         if (invoices.length === 0) {
//             return errorResMsg(res, 404, 'No invoices found for the given IDs');
//         }
        
//         // Generate PDFs for each invoice
//         const pdfFiles = await Promise.all(invoices.map(invoice => generateInvoicePDF(invoice)));
        
//         // Check if any PDF generation failed
//         if (pdfFiles.some(filePath => typeof filePath!=='string')) {
//             console.error('PDF generation failed for some invoices');
//             return errorResMsg(res, 500, 'Failed to generate invoice PDFs');
//         }
        
//         // Log file paths for debugging
//         console.log('Generated PDFs for:', pdfFiles.map(filePath => `File: ${filePath}`));
        
//         // Send file attachments for download
//         res.status(200).json({
//             success: true,
//             message: 'PDF files generated successfully',
//             files: pdfFiles.map(filePath => ({ filename: `invoice_${invoices.find(invoice => invoice._id.toString() === mongoose.Types.ObjectId(filePath).toString()).invoiceNumber}.pdf`, path: filePath })),
//         });

        
//     } catch (error) {
//         console.error('Server error:', error);
//         return errorResMsg(res, 500, 'Server error');
        
//     }
// };

// export const shareInvoices = async (req, res) => {
//     try {
//         const { user } = req;
//         const { invoiceIds, email } = req.params;
        
//         if (!user) {
//             return errorResMsg(res, 401, 'User not found');
//         }

//         // Validate invoice IDs - assuming `invoiceIds` is a comma-separated string
//         const validInvoiceIds = invoiceIds
//             .split(',')  // Split by comma if multiple IDs are passed
//             .map(id => {
//                 // Create ObjectId instances correctly
//                 if (mongoose.Types.ObjectId.isValid(id)) {
//                     return new mongoose.Types.ObjectId(id);
//                 }
//                 return null;
//             })
//             .filter(Boolean);

//         if (validInvoiceIds.length === 0) {
//             return errorResMsg(res, 400, 'Invalid invoice IDs provided');
//         }

//         // Fetch the invoices and populate related fields
//         const invoices = await Invoice.find({ _id: { $in: validInvoiceIds }, user: user._id })
//             .populate('client')
//             .populate('company')
//             .populate('account');

//         if (invoices.length === 0) {
//             return errorResMsg(res, 404, 'No invoices found for the given IDs');
//         }

//         // Generate PDFs for each invoice
//         const pdfFiles = await Promise.all(invoices.map(invoice => generateInvoicePDF(invoice)));

//         // Check if any PDF generation failed
//         if (pdfFiles.some(filePath => typeof filePath !== 'string')) {
//             console.error('PDF generation failed for some invoices');
//             return errorResMsg(res, 500, 'Failed to generate invoice PDFs');
//         }

//         // Log file paths for debugging
//         console.log('Generated PDFs for:', pdfFiles);

//         // Optionally: Handle sharing logic (e.g., email, WhatsApp, etc.)
//         const currentFilePath = fileURLToPath(import.meta.url);
//         const currentDir = dirname(currentFilePath);
//         const templatePath = path.join(
//             currentDir,
//             '../public/emails/shareinvoice.ejs'
//         );

//         await ejs.renderFile(
//             templatePath,
//             {
//                 title: 'Invoice sent successfully',
//                 pdfFiles: pdfFiles,
//                 firstName: user.firstName,
//                 attachments: attachments
//             },
//             async (err, data) => {
//                 if (err) {
//                     console.error('Error rendering email template:', err);
//                     return errorResMsg(res, 500, 'Error rendering email template');
//                 }
        
//                 // Create an array of attachments
//                 const attachments = pdfFiles.map((filePath, index) => ({
//                     invoiceNumber: invoices[index].invoiceNumber,
//                     path: filePath
//                 }));
        
//                 await emailSenderTemplate(data, 'Invoice sent', email, attachments);
//             }
//         );
        
//         res.status(200).json({
//             success: true,
//             message: 'PDF files generated successfully',
//             files: pdfFiles.map((filePath, index) => ({
//                 filename: `invoice_${invoices[index].invoiceNumber}.pdf`,
//                 path: filePath,
//             })),
//         });

//     } catch (error) {
//         console.error('Server error:', error);
//         return errorResMsg(res, 500, 'Server error');
//     }
// };

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
