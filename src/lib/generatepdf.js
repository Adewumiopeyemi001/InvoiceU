import { fileURLToPath } from 'url';
import path from 'path';
import puppeteer from 'puppeteer';
import ejs from 'ejs';
import fs from 'fs';
import axios from 'axios';

// Get __filename and __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to generate the PDF
const downloadImage = async (url, dest) => {
    const writer = fs.createWriteStream(dest);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
};

export const generateInvoicePDF = async (invoice) => {
    try {
        // Use the Cloudinary URL for the logo
        const logoUrl = 'https://res.cloudinary.com/dzjtxffsr/image/upload/v1727879464/wvmh6spnxrqv4vtfwuje.png'; // Update with your actual Cloudinary URL

        const html = await ejs.renderFile(
            path.join(process.cwd(), 'src', 'public', 'emails', 'pdf.ejs'),
            {
                logoUrl: logoUrl,  // Use Cloudinary URL directly
                company: invoice.company,
                client: invoice.client,
                items: invoice.items,
                subtotal: invoice.subtotal,
                tax: invoice.tax,
                total: invoice.total,
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
