import User from "../models/users.model.js";
import Company from "../models/companys.model.js";
import {errorResMsg, successResMsg} from '../lib/responses.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import emailSenderTemplate from "../middlewares/email.js";
import ejs from 'ejs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { checkExistingPassword, checkExistingUser } from "../middlewares/services.js";
import cloudinary from "../public/images/cloudinary.js";

export const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Enter your email address and password." });
    }

    const existingUser = await checkExistingUser(email);
    if (existingUser) {
      return errorResMsg(res, 200, "User already exists");
    }

    const newUser = await User.create({
      email,
      password,
      role,
      emailStatus: false,
    });

    // Use _id instead of userId in the token
    const token = jwt.sign({ _id: newUser._id }, process.env.SECRET_KEY, {
      expiresIn: process.env.expiresIn, // Token expiration time
    });

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

    return successResMsg(res, 201, {
      success: true,
      newUser: {
        email: newUser.email
      },
      message: `User created successfully. Your verification link has been sent to ${email}`,
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, "Server Error");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Ensure both email and password are provided
    if (!email || !password) {
      return errorResMsg(res, 400, 'Please enter your email address and password');
    }

    // Check if user exists
    const user = await checkExistingUser(email);
    if (!user) {
      return errorResMsg(res, 401, 'Invalid email or password');
    }

    // Check if the email is verified
    if (user.emailStatus === false) {
      return errorResMsg(res, 401, 'Please verify your email to log in.');
    }

    // Check if the password is correct
    const passwordMatch = await checkExistingPassword(password, user.password);
    if (!passwordMatch) {
      return errorResMsg(res, 400, 'Password does not match');
    }

    // Generate a new token
    const token = user.generateAuthToken();

    // Clear previous tokens and store only the new one
    user.tokens = [{ token }];
    await user.save();

    return successResMsg(res, 200, {
      success: true,
      data: {
        token,
      },
    });
    
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, 'Server error');
  }
};


export const verifyEmail = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return errorResMsg(res, 400, 'Invalid Token');
    }

    // Decode the token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Use _id instead of userId (to match the token payload)
    const userId = decoded._id;
    
    const user = await User.findByIdAndUpdate(userId, { emailStatus: null }, { new: true });
    if (!user) {
      return errorResMsg(res, 400, 'User not found');
    }
    // Generate a new token for the user session after successful verification
    const sessionToken = user.generateAuthToken();

    // Add the token to the user's tokens array and save it
    user.tokens = user.tokens.concat({ token: sessionToken });
    await user.save();

    return successResMsg(res, 200, {
      success: true,
      message: 'Email verified successfully',
      token: sessionToken,  
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, 'Server Error');
  }
};


export const getProfile = async(req, res) => {
  try {
    const user = req.user;
    if(!user) {
        return errorResMsg(res, 401, 'User not found');
    }
    const userProfile = {
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      city: user.city,
      address: user.address,
      registrationDate: user.registrationDate,
      profilePicture: user.profilePicture
    }
    return successResMsg(res, 200, {
        success: true,
        user: userProfile,
      });
    
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, "Server Error");
    
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { 
      firstName, 
      lastName, 
      phoneNumber, 
      address,
      companyName, 
      occupation, 
      industry, 
      country, 
      state,
      city, 
      zipCode, 
      companyAddress 
    } = req.body;
    const companyLogo = req.file;

    // Check required fields
    if (
      !firstName || !lastName || !phoneNumber || ! address || !city || !companyAddress ||
      !companyName || !occupation || !industry || !country || !state || !zipCode
    ) {
      return errorResMsg(res, 400, 'Please fill in the required fields');
    }

    if (!companyLogo) {
      return errorResMsg(res, 400, 'Please upload a company logo');
    }

    // Upload company logo to Cloudinary
    const result = await cloudinary.v2.uploader.upload(companyLogo.path);

    // Update User details
    const updatedUser = await User.findByIdAndUpdate(user._id, {
      firstName, 
      lastName, 
      phoneNumber, 
      address
    }, { new: true });

    if (!updatedUser) {
      return errorResMsg(res, 404, 'User not found');
    }

    // Update or create Company details
    let updatedCompany = await Company.findOneAndUpdate(
      { user: user._id }, // Find the company linked to the user
      {
        companyName, 
        companyLogo: result.secure_url, 
        occupation, 
        industry, 
        country, 
        state, 
        zipCode, 
        city,
        companyAddress
      },
      { new: true, upsert: true } // Create a new company if it doesn't exist
    );

    // Combine both updates
    const filteredUser = {
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phoneNumber: updatedUser.phoneNumber,
      address: updatedUser.address,
      companyName: updatedCompany.companyName,
      companyLogo: updatedCompany.companyLogo,
      occupation: updatedCompany.occupation,
      industry: updatedCompany.industry,
      country: updatedCompany.country,
      state: updatedCompany.state,
      zipCode: updatedCompany.zipCode,
      companyAddress: updatedCompany.companyAddress
    };

    return successResMsg(res, 200, {
      success: true,
      user: filteredUser
    });

  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, "Server Error");
  }
};

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

export const logout = async (req, res) => {
  try {
    if (!req.user) {
      return errorResMsg(res, 401, 'Unauthorized');
    }
    // Filter out the current session token from the user's tokens array
    req.user.tokens = req.user.tokens.filter((tokenObj) => {
      return tokenObj.token !== req.token;
    });
    // Save the updated user
    await req.user.save();

    return successResMsg(res, 200, {
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, 'Server Error');
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

    return successResMsg(res, 200, {
      success: true,
      message: 'Password changed successfully',
    });

  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, 'Server Error');
  }
};


