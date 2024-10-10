import Client from "../models/clients.model.js";
import User from "../models/users.model.js";
import Company from "../models/companys.model.js";
import Invoice from "../models/invoices.model.js";
import { errorResMsg, successResMsg } from "../lib/responses.js";
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



// export const downloadInvoice = async (req, res) => {
//     try {
//         const { user } = req;
//         const { invoiceId } = req.params;

//         // Find the invoice
//         const invoice = await Invoice.findOne({ _id: invoiceId, user: user._id })
//             .populate('client', 'businessName address clientIndustry country')
//             .populate('company', 'companyName companyAddress companyLogo occupation')
//             .populate('account', 'accountNumber');

//         if (!invoice) {
//             return errorResMsg(res, 404, 'Invoice not found');
//         }

//         // Create the invoices directory if it doesn't exist
//         const invoicesDir = path.resolve('invoices');
//         if (!fs.existsSync(invoicesDir)) {
//             fs.mkdirSync(invoicesDir, { recursive: true });
//         }

//         // Define the file path
//         // const filePath = path.join(invoicesDir, `invoice_${invoice.invoiceNumber}.pdf`);

//         const sanitizedInvoiceNumber = invoice.invoiceNumber.replace(/[#]/g, ''); // Replace # with nothing
//         const filePath = path.join(invoicesDir, `invoice_${sanitizedInvoiceNumber}.pdf`);

//         // Create a new PDF document
//         const doc = new PDFDocument({ size: 'A4', margin: 50 });

//         // Pipe the PDF into the file
//         doc.pipe(fs.createWriteStream(filePath));

//         // Download the company logo if it's a URL and save it temporarily
//         const logoPath = path.resolve('temp', `logo_${invoice.company._id}.png`);
//         await downloadImage(invoice.company.companyLogo, logoPath);

//         // Header - Add the downloaded logo and company details
//         doc.image(logoPath, { width: 50, align: 'center' });
//         doc.fontSize(20).text(invoice.company.companyName, { align: 'center' });
//         doc.fontSize(10).text(`Business address\n${invoice.company.companyAddress}\nTAX ID ${invoice.company.taxId}`, { align: 'center' });
//         doc.moveDown();

//         // Billing information
//         doc.fontSize(12).text(`Billed to:\n${invoice.client.businessName}\n${invoice.client.address}\n${invoice.client.country}`, { align: 'left' });
//         doc.moveDown();

//         // Invoice details
//         doc.text(`Invoice Date: ${invoice.invoiceDate}`);
//         doc.text(`Due Date: ${invoice.dueDate}`);
//         doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
//         doc.moveDown();

//         // Items table
//         doc.text('Item description', { continued: true });
//         doc.text('Qty', { align: 'right', continued: true });
//         doc.text('Rate', { align: 'right', continued: true });
//         doc.text('Amount', { align: 'right' });
//         invoice.items.forEach(item => {
//             doc.text(item.description, { continued: true });
//             doc.text(item.quantity, { align: 'right', continued: true });
//             doc.text(item.rate.toFixed(2), { align: 'right', continued: true });
//             doc.text((item.rate * item.quantity).toFixed(2), { align: 'right' });
//         });

//         // Total calculation
//         const subtotal = invoice.items.reduce((sum, item) => sum + (item.rate * item.quantity), 0);
//         const tax = subtotal * 0.1; // Assuming 10% tax
//         const total = subtotal + tax;

//         doc.moveDown();
//         doc.text(`Subtotal: $${subtotal.toFixed(2)}`);
//         doc.text(`Tax (10%): $${tax.toFixed(2)}`);
//         doc.text(`Total: $${total.toFixed(2)}`, { fontSize: 16, underline: true });

//         // Total Due Section
//         doc.moveDown();
//         doc.fontSize(14).text(`Total due: USD ${total.toFixed(2)}`, { align: 'center' });
//         doc.fontSize(10).text(`USD ${numToWords(total)} Only.`, { align: 'center' });

//         // Finalize the PDF file
//         doc.end();

//         // Send the PDF file as a response
//         res.download(filePath, `invoice_${invoice.invoiceNumber}.pdf`);

//         // Clean up the temporary logo file
//         fs.unlinkSync(logoPath);

//     } catch (error) {
//         console.error(error);
//         return errorResMsg(res, 500, 'Internal Server Error');
//     }
// };

// Function to download the image from the URL
// const downloadImage = async (url, filepath) => {
//     const response = await axios({
//         url,
//         responseType: 'stream',
//     });
//     return new Promise((resolve, reject) => {
//         response.data.pipe(fs.createWriteStream(filepath))
//             .on('finish', () => resolve())
//             .on('error', e => reject(e));
//     });
// };

// Function to convert numbers to words (e.g., 4950 -> "Four Thousand Nine Hundred Fifty")
// function numToWords(num) {
//     // Implementation to convert number to words
// }

export const downloadInvoice = async (req, res) => {
     try {
        const { user } = req;

        const { invoiceId } = req.params;

        if(!user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        
        // Fetch the invoice and populate related documents (client, company, and account)
        const invoice = await Invoice.findById(invoiceId)
            .populate('client')
            .populate('company')
            .populate('account');
        
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Generate and download the PDF
        const filePath = await generateInvoicePDF(invoice);
        res.download(filePath, `invoice_${invoice.invoiceNumber}.pdf`);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

