import User from "../models/users.model.js";
import Company from "../models/companys.model.js";
import Account from "../models/accounts.model.js";
import {errorResMsg, successResMsg} from '../lib/responses.js';
import cloudinary from "../public/images/cloudinary.js";
import fs from "fs"

export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return errorResMsg(res, 401, 'User not found');
    }

    // Find the company associated with the user (if available)
    const company = await Company.findOne({ user: user._id });

    // Build the user profile based on available information
    const userProfile = {
      firstName: user.firstName,
       lastName: user.lastName,
      phoneNumber: user.phoneNumber || null,
      // address: user.address || null,
      registrationDate: user.registrationDate || null,
      companyName: company?.companyName || null,
      companyLogo: company?.companyLogo || null,
      occupation: company?.occupation || null,
      industry: company?.industry || null,
      country: company?.country || null,
      state: company?.state || null,
      zipCode: company?.zipCode || null,
      companyAddress: company?.companyAddress || null,
    };

    return successResMsg(res, 200, {
      success: true,
      user: userProfile,
    });

  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, "Server Error");
  }
};

export const createAccount = async (req, res) => {
  try {
    const user = req.user;
    const {
      firstName,
      lastName,
      phoneNumber,
      companyName,
      occupation,
      industry,
      country,
      state,
      zipCode,
      companyAddress,
    } = req.body;
    const companyLogo = req.file; // Optional field

    // Check required fields
    if (
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !companyAddress ||
      !companyName ||
      !industry ||
      !country ||
      !state
    ) {
      return errorResMsg(res, 400, 'Please fill in the required fields');
    }

    // Initialize logo URL as null
    let logoUrl = null;

    // Upload company logo if provided
    if (companyLogo) {
      const result = await cloudinary.v2.uploader.upload(companyLogo.path);
      logoUrl = result.secure_url;

      // Cleanup temporary file
      fs.unlink(companyLogo.path, (err) => {
        if (err) console.error('Error removing temporary file:', err);
      });
    }

    // Update User details
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        firstName,
        lastName,
        phoneNumber,
      },
      { new: true }
    );

    if (!updatedUser) {
      return errorResMsg(res, 404, 'User not found');
    }

    // Update or create Company details
    let updatedCompany = await Company.findOneAndUpdate(
      { user: user._id },
      {
        companyName,
        companyLogo: logoUrl, 
        occupation,
        industry,
        country,
        state,
        zipCode,
        companyAddress,
      },
      { new: true, upsert: true } // Create a new company if it doesn't exist
    );

    // Combine updates
    const filteredUser = {
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      phoneNumber: updatedUser.phoneNumber,
      companyName: updatedCompany.companyName,
      companyLogo: updatedCompany.companyLogo,
      occupation: updatedCompany.occupation,
      industry: updatedCompany.industry,
      country: updatedCompany.country,
      state: updatedCompany.state,
      zipCode: updatedCompany.zipCode,
      companyAddress: updatedCompany.companyAddress,
    };

    return successResMsg(res, 200, {
      success: true,
      user: filteredUser,
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, 'Server Error');
  }
};

export const editProfile = async (req, res) => {
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
    let logoUrl = null;

    // Upload company logo if provided
    if (companyLogo && companyLogo.path) {
      const result = await cloudinary.v2.uploader.upload(companyLogo.path);
      logoUrl = result.secure_url;

      fs.unlink(companyLogo.path, (err) => {
        if (err) console.error('Error removing temporary company logo file:', err);
      });
    }

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
      { user: user._id },
      {
        companyName,
        occupation,
        industry,
        country,
        state,
        zipCode,
        city,
        companyAddress
      },
      { new: true, upsert: true }
    );

    // Update the company logo if logoUrl is available
    if (logoUrl) {
      updatedCompany.companyLogo = logoUrl;
      await updatedCompany.save(); // Save the updated company document
    }

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
    return errorResMsg(res, 500, 'Server Error');
  }
};
