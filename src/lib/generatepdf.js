import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Function to generate the PDF
// export const generateInvoicePDF = async (invoice) => {
//     return new Promise((resolve, reject) => {
//         try {
//             // Create the directory if it doesn't exist
//             const invoicesDir = path.resolve('invoices');
//             if (!fs.existsSync(invoicesDir)) {
//                 fs.mkdirSync(invoicesDir, { recursive: true });
//             }

//             // Define the file path for saving the PDF
//             const filePath = path.join(invoicesDir, `invoice_${invoice.invoiceNumber}.pdf`);

//             // Create a new PDF document
//             const doc = new PDFDocument();

//             // Pipe the PDF into the file
//             const writeStream = fs.createWriteStream(filePath);
//             doc.pipe(writeStream);

//             // Add content to the PDF
//             doc.fontSize(20).text(`Invoice #${invoice.invoiceNumber}`, { align: 'center' });
//             doc.moveDown();
//             doc.fontSize(16).text(`${invoice.company.companyName}`, { align: 'right' });
//             doc.text(`${invoice.company.companyAddress}, ${invoice.company.zipCode}`, { align: 'right' });
//             doc.moveDown();
//             doc.text(`${invoice.client.businessName}`, { align: 'left' });
//             doc.text(`${invoice.client.address}`, { align: 'left' });
//             doc.moveDown();

//             // Add items to the PDF
//             doc.text(`Items:`);
//             invoice.items.forEach((item, index) => {
//                 doc.text(`${index + 1}. ${item.description} - ${item.quantity} x ${item.rate}`, { align: 'left' });
//             });

//             doc.moveDown();
//             doc.text(`Total Amount: $${invoice.total}`, { align: 'left' });
//             if (invoice.account) {
//                 doc.text(`Account Number: ${invoice.account.accountNumber}`, { align: 'left' });
//             }

//             // Finalize the PDF file
//             doc.end();

//             // Resolve when the file has been written
//             writeStream.on('finish', () => {
//                 resolve(filePath);
//             });
//             writeStream.on('error', (error) => {
//                 reject(error);
//             });
//         } catch (error) {
//             reject(error);
//         }
//     });
// };

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
    return new Promise(async (resolve, reject) => {
        try {
            // Create the directory if it doesn't exist
            const invoicesDir = path.resolve('invoices');
            if (!fs.existsSync(invoicesDir)) {
                fs.mkdirSync(invoicesDir, { recursive: true });
            }

            // Define the file path for saving the PDF
            const filePath = path.join(invoicesDir, `invoice_${invoice.invoiceNumber}.pdf`);

            // Create a new PDF document
            const doc = new PDFDocument({ margin: 50 });

            // Pipe the PDF into the file
            const writeStream = fs.createWriteStream(filePath);
            doc.pipe(writeStream);

            // Download company logo if it's a URL
            let logoPath = null;
            if (invoice.company.companyLogo && invoice.company.companyLogo.startsWith('http')) {
                const logoFilename = `logo_${invoice.company.companyId}.png`;
                logoPath = path.join(invoicesDir, logoFilename);
                await downloadImage(invoice.company.companyLogo, logoPath);
            }
            // Add company logo to PDF if it was downloaded
            if (logoPath && fs.existsSync(logoPath)) {
                doc.image(logoPath, 50, 50, { width: 70, height: 70 }); // Position logo at (x: 50, y: 50)
            }

            // Move down a little from the logo's bottom
            const startX = 130; // Adjust based on logo height
            doc.moveDown(0.5); // Add a little space after the logo

            // Company Name
            doc.fontSize(20).text(invoice.company.companyName, 50, startX, { align: 'left' }); // Position company name below the logo

            // Address and Tax ID
            doc.fontSize(10).text(`${invoice.company.companyAddress}, ${invoice.company.zipCode}`, 130, startX, { align: 'right' });
            doc.text(`TAX ID: ${invoice.company.taxId}`, 130, startX + 20, { align: 'right' }); // Tax ID below the address

            doc.moveDown(2); // Add space after header

            // Invoice title
            doc.moveDown().fontSize(16).text('Invoice', { align: 'center' });

            // Client Information
            doc.moveDown().fontSize(12);
            doc.text(`Billed to: ${invoice.client.businessName}`, { align: 'left' });
            doc.text(`${invoice.client.address}`, { align: 'left' });
            doc.text(`${invoice.client.phoneNumber || ''}`, { align: 'left' });
            doc.moveDown();

            // Invoice details table (due date, invoice date, invoice number)
            doc.fontSize(10).text(`Invoice date: ${invoice.invoiceDate}`, { align: 'left' });
            doc.text(`Due date: ${invoice.dueDate}`, { align: 'left' });
            doc.text(`Invoice number: ${invoice.invoiceNumber}`, { align: 'left' });
            if (invoice.referenceNumber) {
                doc.text(`Reference: ${invoice.referenceNumber}`, { align: 'left' });
            }

            // Itemized List
            // doc.moveDown();
            // doc.fontSize(10).text(`Item description`, { width: 200, continued: true });
            // doc.text(`Qty`, { width: 50, align: 'right', continued: true });
            // doc.text(`Rate`, { width: 100, align: 'right', continued: true });
            // doc.text(`Amount`, { width: 100, align: 'right' });

            // invoice.items.forEach((item) => {
            //     doc.text(item.description, { width: 200, continued: true });
            //     doc.text(item.quantity, { width: 50, align: 'right', continued: true });
            //     doc.text(`$${item.rate.toFixed(2)}`, { width: 100, align: 'right', continued: true });
            //     doc.text(`$${(item.quantity * item.rate).toFixed(2)}`, { width: 100, align: 'right' });
            // });

            // Itemized List Header
doc.moveDown(10); // Move down for some space
const startY = doc.y; // Get the current Y position
const itemNameWidth = 200;
const qtyWidth = 50;
const rateWidth = 100;
const amountWidth = 100;

// Set header styles
doc.fontSize(10).text(`Item Description`, 50, startY, { width: itemNameWidth, continued: true });
doc.text(`Qty`, 50 + itemNameWidth, startY, { width: qtyWidth, align: 'right', continued: true });
doc.text(`Rate`, 50 + itemNameWidth + qtyWidth, startY, { width: rateWidth, align: 'right', continued: true });
doc.text(`Amount`, 50 + itemNameWidth + qtyWidth + rateWidth, startY, { width: amountWidth, align: 'right' });

// Draw a line under the header
doc.moveDown(2);
doc.lineWidth(0.5).moveTo(50, doc.y).lineTo(50 + itemNameWidth + qtyWidth + rateWidth + amountWidth, doc.y).stroke();

// Iterate over items
invoice.items.forEach(item => {
    const itemY = doc.y + 10; // Starting Y position for each item
    doc.fontSize(10).text(item.description, 50, itemY, { width: itemNameWidth, continued: true });
    doc.text(item.quantity.toString(), 50 + itemNameWidth, itemY, { width: qtyWidth, align: 'right', continued: true });
    doc.text(`$${item.rate.toFixed(2)}`, 50 + itemNameWidth + qtyWidth, itemY, { width: rateWidth, align: 'right', continued: true });
    doc.text(`$${(item.quantity * item.rate).toFixed(2)}`, 50 + itemNameWidth + qtyWidth + rateWidth, itemY, { width: amountWidth, align: 'right' });
    
    doc.moveDown(5); // Move down after each item
});


            // // Add subtotal, tax, and total
            // doc.moveDown();
            doc.text(`Subtotal: $${invoice.subTotal.toFixed(2)}`, { align: 'right' });
            doc.text(`Tax (10%): $${invoice.tax.toFixed(2)}`, { align: 'right' });
            doc.text(`Total: $${invoice.total.toFixed(2)}`, { align: 'right', bold: true });

            // Payment information (if available)
            if (invoice.account) {
                doc.moveDown().fontSize(10).text(`Payment details:`, { align: 'left' });
                doc.text(`Bank: ${invoice.account.bankName}`, { align: 'left' });
                doc.text(`SWIFT: ${invoice.account.swiftCode}`, { align: 'left' });
                doc.text(`Account Number: ${invoice.account.accountNumber}`, { align: 'left' });
            }

            // Footer
            doc.moveDown();
            doc.text(`Thank you for your business!`, { align: 'center' });
            doc.text(`Please make payment within 30 days of receiving this invoice.`, { align: 'center' });

            // Finalize the PDF file
            doc.end();

            // Resolve when the file has been written
            writeStream.on('finish', () => {
                resolve(filePath);
            });
            writeStream.on('error', (error) => {
                reject(error);
            });
        } catch (error) {
            reject(error);
        }
    });
};
