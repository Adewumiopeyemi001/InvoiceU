import express from 'express';
import passport from 'passport';
import { successResMsg, errorResMsg } from '../lib/responses.js';
import '../config/passport.js'; // Ensure this file is imported to configure passport
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import ejs from 'ejs';
import emailSenderTemplate from '../middlewares/email.js';

const router = express.Router();

// Google OAuth
 router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/auth/google/redirect',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async(req, res) => {
    // Successful authentication
    const token = req.user.generateAuthToken();

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
          email
        );
      }
    );


    successResMsg(res, 200, {
      success: true,
      data: {
        token
      },
    });
  }
);

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

export default router;
