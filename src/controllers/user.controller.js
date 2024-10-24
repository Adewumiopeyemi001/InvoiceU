import User from "../models/users.model.js";
import Company from "../models/companys.model.js";
import Account from "../models/accounts.model.js";
import {errorResMsg, successResMsg} from '../lib/responses.js';
import cloudinary from "../public/images/cloudinary.js";

export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return errorResMsg(res, 401, 'User not found');
    }

    // Find the company associated with the user (if available)
    const company = await Company.findOne({ user: user._id });

    // Find all accounts associated with the user (if available)
    const accounts = await Account.find({ user: user._id });

    // Build the user profile based on available information
    const userProfile = {
      name: `${user.firstName} ${user.lastName}`,
      phoneNumber: user.phoneNumber || null,
      address: user.address || null,
      registrationDate: user.registrationDate || null,
      profilePicture: user.profilePicture || null,
      companyName: company?.companyName || null,
      companyLogo: company?.companyLogo || null,
      occupation: company?.occupation || null,
      industry: company?.industry || null,
      country: company?.country || null,
      state: company?.state || null,
      city: company?.city || null,
      companyAddress: company?.companyAddress || null,
      accounts: accounts.map(account => ({
        accountType: account.accountType || null,
        bankName: account.bankName || null,
        accountName: account.accountName || null,
        accountNumber: account.accountNumber || null,
      }))
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
      
      const { companyLogo, profilePicture } = req.files || {};
      const companyLogoFile = companyLogo ? companyLogo[0] : null;
      const profilePictureFile = profilePicture ? profilePicture[0] : null;
  
      let companyLogoUrl = null;
      let profilePictureUrl = null;
  
      if (companyLogoFile) {
        const companyLogoResult = await cloudinary.v2.uploader.upload(companyLogoFile.path);
        companyLogoUrl = companyLogoResult.secure_url;
      }
  
      if (profilePictureFile) {
        const profilePictureResult = await cloudinary.v2.uploader.upload(profilePictureFile.path);
        profilePictureUrl = profilePictureResult.secure_url;
      }
  
      // Update User details
      const updatedUser = await User.findByIdAndUpdate(user._id, {
        firstName,
        lastName,
        phoneNumber,
        address,
        ...(profilePictureUrl && { profilePicture: profilePictureUrl }),
      }, { new: true });
  
      if (!updatedUser) {
        return errorResMsg(res, 404, 'User not found');
      }
  
      // Update or create Company details
      let updatedCompany = await Company.findOneAndUpdate(
        { user: user._id },
        {
          companyName,
          ...(companyLogoUrl && { companyLogo: companyLogoUrl }),
          occupation,
          industry,
          country,
          state,
          zipCode,
          city,
          companyAddress,
        },
        { new: true, upsert: true }
      );
  
      // let accountDetails = await Account.findOneAndUpdate(
      //   { user: user._id },
      //   {
      //     accountType,
      //     bankName,
      //     accountName,
      //     accountNumber
      //   },
      //   { new: true, upsert: true }
      // );
  
      const filteredUser = {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
        profilePicture: updatedUser.profilePicture,
        companyName: updatedCompany.companyName,
        companyLogo: updatedCompany.companyLogo,
        occupation: updatedCompany.occupation,
        industry: updatedCompany.industry,
        country: updatedCompany.country,
        state: updatedCompany.state,
        zipCode: updatedCompany.zipCode,
        companyAddress: updatedCompany.companyAddress,
        // accountType: accountDetails.accountType,
        // bankName: accountDetails.bankName,
        // accountName: accountDetails.accountName,
        // accountNumber: accountDetails.accountNumber
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