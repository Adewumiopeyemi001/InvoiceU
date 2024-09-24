import Client from "../models/clients.model.js";
import User from "../models/users.model.js";
import Company from "../models/companys.model.js";
import Invoice from "../models/invoices.model.js";
import { errorResMsg, successResMsg } from "../lib/responses.js";

export const createInvoice = async (req, res) => {
    try {
        const { user } = req;
        const { items, issueDate, dueDate, phoneNumber, status } = req.body;

        // Calculate total amount
        const totalAmount = items.map((item) => item.quantity * item.rate).reduce((acc, curr) => acc + curr, 0);

        if (!items || !issueDate || !dueDate || !totalAmount) {
            return errorResMsg(res, 400, 'All fields are required');
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

        // Fetch client data
        const existingClient = await Client.findOne({ user: user._id });
        if (!existingClient) {
            return errorResMsg(res, 400, 'Client details not found, please create a new client');
        }

        // Create reference and invoice number using timestamp
        const timestamp = Date.now();
        const reference = `INV_${timestamp}`;
        const invoiceNumber = `#AB${timestamp}`;

        // Create new invoice (only store reference to the company, not the full details)
        const newInvoice = new Invoice({
            user: user._id,
            company: existingCompany._id,
            client: existingClient._id,
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

        // Return only the required fields in the response (no need to save company details in the invoice)
        return successResMsg(res, 201, {
            success: true,
            message: 'Invoice created successfully',
            companyDetails: {
                companyName: existingCompany.companyName,
                companyLogo: existingCompany.companyLogo,
                industry: existingCompany.industry,
                occupation: existingCompany.occupation,
                country: existingCompany.country,
                city: existingCompany.city,
                state: existingCompany.state,
                zipCode: existingCompany.zipCode,
                companyAddress: existingCompany.companyAddress,
            },
            clientDetails: {
                businessName: existingClient.businessName,
                clientIndustry: existingClient.clientIndustry,
                address: existingClient.address, 
                // email: existingClient.email,
                country: existingClient.country,
                city: existingClient.city,
                zipCode: existingClient.zipCode,
            },
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
