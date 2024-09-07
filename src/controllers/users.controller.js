import User from "../models/users.model.js";
import {errorResMsg, successResMsg} from '../lib/responses.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import emailSenderTemplate from "../middlewares/email.js";
import ejs from 'ejs';
import jwt from 'jsonwebtoken';
import { checkExistingPassword, checkExistingUser } from "../middlewares/services.js";
import cloudinary from "../public/images/cloudinary.js";

export const register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required." });
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

    const token = jwt.sign({ userId: newUser._id }, process.env.SECRET_KEY, {
      expiresIn: '1h', // Token expiration time
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
      message: 'User created successfully. Please check your email to verify your account.',
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, "Server Error");
  }
};

export const login = async(req, res) => {
  try {
    const {email, password} = req.body;
    if(!email ||!password) {
        return errorResMsg(res, 400, 'Please Enter your email address and password');
    }
    const user = await checkExistingUser(email);
    if(!user) {
        return errorResMsg(res, 401, 'Invalid email or password');
    }

     // Check if the email is verified
     if (user.emailStatus === false) {
      return errorResMsg(res, 401, 'Please verify your email to log in.');
    }
    // Check if the password is correct
    const passwordMatch = await checkExistingPassword(password, user);
  
    if (!passwordMatch) {
      return errorResMsg(res, 400, 'Password Does Not Match');
    }

    const token = user.generateAuthToken();

    return successResMsg(res, 200, {
      success: true,
      data: {
        token
      },
    });

  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, "Server Error");
    
  }
};

export const verifyEmail = async(req, res) => {
  try {
    const token = req.query.token;
    if(!token) {
        return errorResMsg(res, 400, 'Invalid Token');
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const userId = decoded.userId;
    const user = await User.findByIdAndUpdate(userId, {emailStatus: null}, {new: true});
    if(!user) {
        return errorResMsg(res, 400, 'User not found');
    }
    return successResMsg(res, 200, {
        success: true,
        message: 'Email verified successfully',
      });
    
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, "Server Error");
    
  }
};

export const getProfile = async(req, res) => {
  try {
    const user = req.user;
    console.log(user);
    
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

export const updateProfile = async(req, res) => {
  try {
    const user = req.user;
    const { firstName, lastName, phoneNumber, city, address } = req.body;
    const profilePicture = req.file;
    if(!firstName ||!lastName || !phoneNumber || !city || !address) {
        return errorResMsg(res, 400, 'Please fill in the first name, last name, phone number, city and address');
    }
    if(!profilePicture) {
      return errorResMsg(res, 400, 'Please upload a profile picture');
    }
    const result = await cloudinary.v2.uploader.upload(profilePicture.path);
    const updatedUser = await User.findByIdAndUpdate(user._id, {firstName, lastName, phoneNumber, city, address, profilePicture: result.secure_url}, {new: true});
    if(!updatedUser) {
        return errorResMsg(res, 400, 'User not found');
    }
    const filteredUser = {
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phoneNumber: updatedUser.phoneNumber,
      city: updatedUser.city,
      address: updatedUser.address,
      profilePicture: updatedUser.profilePicture
    }
    return successResMsg(res, 200, {
        success: true,
        user: filteredUser,
      });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, "Server Error");
    
  }
};