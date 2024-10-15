import { fileURLToPath } from 'url';
import path from 'path';
import puppeteer from 'puppeteer';
import ejs from 'ejs';
import fs from 'fs';

// Get __filename and __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to generate the PDF
export const generateInvoicePDF = async (invoice) => {
    try {
        // Retrieve the user's logo URL from the invoice object
        const logoUrl = invoice.company.companyLogo;

        // Function to format dates
        const formatDate = (dateString) => {
            const options = { day: 'numeric', month: 'short', year: 'numeric' };
            return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
        };

        const formattedIssueDate = formatDate(invoice.issueDate);
        const formattedDueDate = formatDate(invoice.dueDate);

        const html = await ejs.renderFile(
            path.join(process.cwd(), 'src', 'public', 'emails', 'pdf.ejs'),
            {
                logoUrl: logoUrl,
                company: invoice.company,
                client: invoice.client,
                items: invoice.items,
                subtotal: invoice.subtotal,
                tax: invoice.tax,
                total: invoice.total,
                issueDate: formattedIssueDate, // Pass formatted issue date
                dueDate: formattedDueDate,     // Pass formatted due date
            }
        );

        const invoicesDir = path.join(process.cwd(), 'src', 'invoices');
        const pdfPath = path.join(invoicesDir, `invoice_${invoice.invoiceNumber}.pdf`);

        // Check if the invoices directory exists, create it if it doesn't
        if (!fs.existsSync(invoicesDir)) {
            fs.mkdirSync(invoicesDir, { recursive: true });
        }

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.setContent(html);

        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
        });

        await browser.close();
        return pdfPath;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    }
};

