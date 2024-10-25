import { successResMsg, errorResMsg } from '../lib/responses.js';
import '../config/passport.js'; // Ensure this file is imported to configure passport
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import ejs from 'ejs';
import emailSenderTemplate from '../middlewares/email.js';

export const googleSign = async (req, res) => {
    try {
      const user = req.user;

      // Generate the auth token using the user instance
      const token = user.generateAuthToken();

      // Check if the user email is already verified
      if (user.emailStatus === false) {
        const verificationLink = `${req.protocol}://${req.get('host')}/verify-email?token=${token}`;

        const currentFilePath = fileURLToPath(import.meta.url);
        const currentDir = dirname(currentFilePath);
        const templatePath = path.join(currentDir, '../public/emails/register.ejs');

        await ejs.renderFile(
          templatePath,
          {
            title: `Welcome to invoiceU`,
            body: `Welcome`,
            verificationLink: verificationLink,
          },
          async (err, data) => {
            if (err) {
              console.error('EJS render error:', err);
              return errorResMsg(res, 500, "Error rendering email template");
            }
            await emailSenderTemplate(
              data,
              'Account Created Successfully - Verify Your Email',
              user.email // Send the email to the user's email address
            );
          }
        );
      }

      // Send the token to the user or proceed with any other flow
      successResMsg(res, 200, {
        success: true,
        data: {
          token
        },
      });
    } catch (error) {
      console.error(error);
      return errorResMsg(res, 500, "Server Error");
    }
  }


  