import User from "../models/users.model.js";
import {errorResMsg, successResMsg} from '../lib/responses.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import emailSenderTemplate from "../middlewares/email.js";
import ejs from 'ejs';
import jwt from 'jsonwebtoken';
import { checkExistingPassword, checkExistingUser } from "../middlewares/services.js";

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

    // Redirect to the success URL with the token as a query parameter
    return res.redirect(`https://invoice-u.vercel.app/success?token=${sessionToken}`);
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, 'Server Error');
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


