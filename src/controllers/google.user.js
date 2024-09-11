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

  // export const linkedinLogin = async (req, res) => {
  //   try {
  //     const user = req.user;
  
  //     // Generate the auth token using the user instance
  //     const token = user.generateAuthToken();
  
  //     // Check if the user email is already verified
  //     if (user.emailStatus === false) {
  //       const verificationLink = `${req.protocol}://${req.get('host')}/verify-email?token=${token}`;
  
  //       // Resolve the template path
  //       const currentFilePath = fileURLToPath(import.meta.url);
  //       const currentDir = dirname(currentFilePath);
  //       const templatePath = path.join(currentDir, '../public/emails/register.ejs');
  
  //       // Render the email template
  //       await ejs.renderFile(
  //         templatePath,
  //         {
  //           title: `Welcome to invoiceU`,
  //           body: `Welcome`,
  //           verificationLink: verificationLink,
  //         },
  //         async (err, data) => {
  //           if (err) {
  //             console.error('EJS render error:', err);
  //             return errorResMsg(res, 500, "Error rendering email template");
  //           }
  
  //           // Send the email
  //           await emailSenderTemplate(
  //             data,
  //             'Account Created Successfully - Verify Your Email',
  //             user.email // Send the email to the user's email address
  //           );
  //         }
  //       );
  
  //       // Inform the user to verify their email
  //       return successResMsg(res, 200, {
  //         message: 'Account created. Please verify your email to log in.',
  //       });
  //     }
  
  //     // If the user is already verified, send the auth token
  //     return successResMsg(res, 200, {
  //       token,
  //       message: 'Login successful',
  //     });
  //   } catch (error) {
  //     console.error('LinkedIn login error:', error);
  //     return errorResMsg(res, 500, 'Server error during LinkedIn login');
  //   }
  // };

  export const linkedinLogin = async (req, res) => {
    try {
      const user = req.user; // Passport attaches the authenticated user to `req.user`
  
      if (!user) {
        return errorResMsg(res, 401, 'User not found');
      }
  
      // Generate the auth token using the user instance
      const token = user.generateAuthToken();
  
      // Check if the user's email is already verified
      if (!user.emailStatus) {
        const verificationLink = `${req.protocol}://${req.get('host')}/verify-email?token=${token}`;
  
        // Resolve the template path
        const currentFilePath = fileURLToPath(import.meta.url);
        const currentDir = dirname(currentFilePath);
        const templatePath = path.join(currentDir, '../public/emails/register.ejs');
  
        // Render the email template
        await ejs.renderFile(
          templatePath,
          {
            title: 'Welcome to InvoiceU',
            body: 'Welcome',
            verificationLink: verificationLink,
          },
          async (err, data) => {
            if (err) {
              console.error('EJS render error:', err);
              return errorResMsg(res, 500, 'Error rendering email template');
            }
  
            // Send the email
            await emailSenderTemplate(
              data,
              'Account Created Successfully - Verify Your Email',
              user.email // Send the email to the user's email address
            );
          }
        );
        
        // Inform the user to verify their email
        return successResMsg(res, 200, {
          message: 'Account created. Please verify your email to log in.',
        });
      }
  
      // If the user is already verified, send the auth token
      return successResMsg(res, 200, {
        token,
        message: 'Login successful',
      });
    } catch (error) {
      console.error('LinkedIn login error:', error);
      return errorResMsg(res, 500, 'Server error during LinkedIn login');
    }
  };
  