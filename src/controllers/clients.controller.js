import { errorResMsg, successResMsg } from "../lib/responses.js";
import Client from "../models/clients.model.js";
import User from "../models/users.model.js";
import Company from "../models/companys.model.js";

export const addClient = async (req, res) => {
  try {
    const user = req.user;
    const { businessName, clientIndustry, email, country, city, zipCode, address } = req.body;

    if (!user) {
      return errorResMsg(res, 401, 'User not found');
    }

    // Check if user profile is complete
    const existingUser = await User.findById(user._id);
    if (!existingUser) {
      return errorResMsg(res, 400, 'User not found');
    }

    // Ensure the company profile is updated
    const updatedProfile = await Company.findOne({ user: user._id });
    if (!updatedProfile) {
      return errorResMsg(res, 404, 'Company profile not found. Please complete your profile.');
    }

    const { companyName, companyLogo, occupation, industry } = updatedProfile;
    if (!companyName || !companyLogo || !occupation || !industry) {
      return errorResMsg(res, 400, 'Please complete your company profile before adding a client');
    }

    // Check for required client fields
    if (!businessName || !clientIndustry || !email) {
      return errorResMsg(res, 400, 'Please fill in the required fields');
    }

    // Look up client by email or businessName
    const existingClient = await Client.findOne({
      $or: [{ email }, { businessName }]
    });
    if (existingClient) {
      return errorResMsg(res, 400, 'Client with the same email or business name already exists');
    }

    // Create and save the new client
    const client = new Client({
      businessName,
      clientIndustry,
      email,
      country,
      city,
      zipCode,
      address,
      user: user._id
    });

    await client.save();

    return successResMsg(res, 201, {
      success: true,
      client
    });

  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, 'Server Error');
  }
};
