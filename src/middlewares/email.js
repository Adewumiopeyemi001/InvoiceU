import nodemailer from 'nodemailer';
import CustomError from './customes.js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// const emailSenderTemplate = async (msg, subject, receiver, pdfFilePath = null) => {
//   try {
//     // Check if receiver is defined and is a string or array
//     if (
//       !receiver ||
//       (typeof receiver !== 'string' && !Array.isArray(receiver))
//     ) {
//       throw new Error('Invalid recipient address');
//     }
    
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.GOOGLE_USER,
//         pass: process.env.GOOGLE_PASSWORD,
//       },
//     });

//     // Prepare mail options
//     const mailOptions = {
//       from: process.env.GOOGLE_USER,
//       to: receiver,
//       subject: subject,
//       html: msg,
//     };

//     // Attach PDF if provided
//     if (pdfFilePath) {
//       // Ensure file exists
//       if (!fs.existsSync(pdfFilePath)) {
//         throw new Error('PDF file not found');
//       }

//       mailOptions.attachments = [
//         {
//           filename: 'invoice.pdf', // Name the attachment
//           path: pdfFilePath, // Path to the file
//         },
//       ];
//     }

//     // Send the email
//     await transporter.sendMail(mailOptions);

//     return `Message sent successfully`;
//   } catch (err) {
//     console.log(err);
//     throw new CustomError(500, 'Server Error');
//   }
// };

const emailSenderTemplate = async (msg, subject, receiver, attachments = []) => {
  try {
    // Check if receiver is defined and is a string or array
    if (!receiver || (typeof receiver !== 'string' && !Array.isArray(receiver))) {
      throw new Error('Invalid recipient address');
    }
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GOOGLE_USER,
        pass: process.env.GOOGLE_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GOOGLE_USER,
      to: receiver,
      subject: subject,
      html: msg,
      attachments: attachments.map(file => ({
        filename: `invoice_${file.invoiceNumber}.pdf`,
        path: file.path
      })),
    };

    await transporter.sendMail(mailOptions);

    return `Message sent`;
  } catch (err) {
    console.log(err);
    throw new CustomError(500, 'Server Error');
  }
};

export default emailSenderTemplate;
