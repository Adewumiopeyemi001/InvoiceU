
import User from "../models/users.model.js";
import {errorResMsg, successResMsg} from '../lib/responses.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import emailSenderTemplate from "../middlewares/email.js";
import ejs from 'ejs';
import crypto from 'crypto';
import { checkExistingPassword, checkExistingUser } from "../middlewares/services.js";


export const forgotPassword = async(req, res) => {
    try {
      const { email } = req.body;
      if(!email) {
          return errorResMsg(res, 400, 'Please enter your email address');
      }
      const user = await checkExistingUser(email);
      if(!user) {
          return errorResMsg(res, 401, 'Invalid email address');
      }
  
      // Check if there's already an unexpired reset token
      if (user.resetPasswordToken && user.resetPasswordExpires > Date.now()) {
        return successResMsg(res, 200, {
          success: true,
          resetPasswordToken: user.resetPasswordToken,
          message: 'A reset token is already sent. Please check your email.',
        });
      }
      
      const resetToken = crypto.randomBytes(20).toString('hex');
      const resetPasswordExpires = Date.now() + 3600000; // 1 hour
      
     // Store the token and expiration in the user's record
     user.resetPasswordToken = resetToken;
     user.resetPasswordExpires = resetPasswordExpires;
     await user.save();
  
     // Create reset password URL
     const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
      
      const currentFilePath = fileURLToPath(import.meta.url);
      const currentDir = dirname(currentFilePath);
      const templatePath = path.join(
        currentDir,
        '../public/emails/forgotPassword.ejs'
      );
  
      await ejs.renderFile(
        templatePath,
        {
          title: 'Reset Your Password',
          resetPasswordToken: resetUrl,
          firstName: user.firstName
        },
        async (err, data) => {
          await emailSenderTemplate(data, 'Reset Your Password', email);
        }
      );
  
      return successResMsg(res, 200, {
        success: true,
        resetPasswordToken: resetUrl,
        message: 'Please check your email to reset your password',
      });
    } catch (error) {
      console.error(error);
      return errorResMsg(res, 500, "Server Error");
      
    }
  };
  
  export const resetPassword = async(req, res) => {
    try {
      const { newPassword, confirmPassword } = req.body;
      const token = req.query.token;
      if(!token ||!newPassword || !confirmPassword) {
          return errorResMsg(res, 400, 'Please provide a token and password');
      }
      if(newPassword!== confirmPassword) {
          return errorResMsg(res, 400, 'Passwords do not match');
      }
  
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });
      if(!user) {
          return errorResMsg(res, 401, 'Invalid token or token expired');
      }
      user.password = newPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
  
      const currentFilePath = fileURLToPath(import.meta.url);
      const currentDir = dirname(currentFilePath);
      const templatePath = path.join(
        currentDir,
        '../public/emails/resetpassword.ejs'
      );
  
      await ejs.renderFile(
        templatePath,
        {
          title: `Hello ${user.firstName},`,
          body: 'Password Reset Successfully, Please Login',
        },
        async (err, data) => {
          await emailSenderTemplate(
            data,
            'Password Reset Successfully',
            user.email
          );
        }
      );
  
      return successResMsg(res, 200, {
        success: true,
        message: 'Password reset successfully',
      });
      
    } catch (error) {
      
    }
  };

  
export const changePassword = async (req, res) => {
    try {
      const { password, newPassword, confirmPassword } = req.body;
      
      // Ensure all fields are provided
      if (!password || !newPassword || !confirmPassword) {
        return errorResMsg(res, 400, 'Please provide all required fields');
      }
  
      // Ensure the new password and confirm password match
      if (newPassword !== confirmPassword) {
        return errorResMsg(res, 400, 'New password and confirmation do not match');
      }
  
      // Ensure req.user exists
      const user = req.user; 
      if (!user) {
        return errorResMsg(res, 401, 'User not authenticated');
      }
  
      // Check if the old password matches the current password in the database
      const isMatch = await checkExistingPassword(password, user.password);
      if (!isMatch) {
        return errorResMsg(res, 401, 'Invalid old password');
      }
  
      // Set the new password (it will be hashed by the 'pre' save hook)
      user.password = newPassword;
      
      // Save the user with the new password
      await user.save();
  
      const currentFilePath = fileURLToPath(import.meta.url);
      const currentDir = dirname(currentFilePath);
      const templatePath = path.join(currentDir, '../public/emails/changePassword.ejs');
  
      await ejs.renderFile(
        templatePath,
        {
          title: "",
          // body: `Paasword Changed`,
          firstName: user.firstName
        },
        async (err, data) => {
          if (err) {
            console.error('EJS render error:', err);
            return errorResMsg(res, 500, "Error rendering email template");
          }
          await emailSenderTemplate(
            data,
            'Your Password Has Been Successfully Changed',
            user.email
          );
        }
      );
  
      return successResMsg(res, 200, {
        success: true,
        message: 'Password changed successfully',
      });
  
    } catch (error) {
      console.error(error);
      return errorResMsg(res, 500, 'Server Error');
    }
  };