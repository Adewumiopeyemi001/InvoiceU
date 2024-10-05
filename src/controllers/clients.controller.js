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

    // Look for an existing client with the same businessName under the current user
    const existingClient = await Client.findOne({ businessName, user: user._id });
    if (existingClient) {
      return errorResMsg(res, 400, 'You have already added this client');
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

export const getClientsByUserId = async (req, res) => {
  try {
    const user = req.user;
    const { page = 1, limit = 10 } = req.query;
    if (!user) {
      return errorResMsg(res, 401, 'User not found');
    }
    
    const clients = await Client.find({ user: user._id })
     .skip((page - 1) * limit)
     .limit(parseInt(limit))
     .exec();
     
    return successResMsg(res, 200, {
      success: true,
      clients
    });
    
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, 'Server Error');
    
  }
};

export const getClientById = async (req, res) => {
  try {
    const user = req.user;
    const clientId = req.params.clientId;

    if (!user) {
      return errorResMsg(res, 401, 'User not found');
    }

    const client = await Client.findOne({ _id: clientId, user: user._id });

    if (!client) {
      return errorResMsg(res, 404, 'Client not found');
    }

    return successResMsg(res, 200, {
      success: true,
      client
    });

  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, 'Server Error');
  }
};

export const updateClient = async (req, res) => {
  try {
    const user = req.user;
    const clientId = req.params.clientId;
    const { businessName, clientIndustry,country, email, city, zipCode, address } = req.body;
    
    if (!user) {
      return errorResMsg(res, 401, 'User not found');
    }
    
    const client = await Client.findOneAndUpdate({ _id: clientId, user: user._id }, {businessName, clientIndustry, email,country, city, zipCode, address }, { new: true });
    
    if (!client) {
      return errorResMsg(res, 404, 'Client not found');
    }
    
    return successResMsg(res, 200, {
      success: true,
      client
    });
    
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, 'Server Error');
    
  }
};

export const searchClient = async (req, res) => {
  try {
    const { user } = req;
    const { search: searchQuery } = req.query;
    
    if (!user) {
      return errorResMsg(res, 401, 'User not found');
    }

    if (!searchQuery) {
      return errorResMsg(res, 400, 'Search query is required');
    }

    const clients = await Client.find({
      businessName: { $regex: searchQuery, $options: 'i' }, 
      user: user._id
    }).exec();

    if (clients.length === 0) {
      return successResMsg(res, 200, {
        success: true,
        message: 'No clients found',
        clients: []
      });
    }

    return successResMsg(res, 200, {
      success: true,
      clients
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, 'Server Error');
  }
};

export const filterClients = async (req, res) => {
  try {
    const { user } = req;
    const { search, industry, city } = req.query; // Multiple filters
    
    if (!user) {
      return errorResMsg(res, 401, 'User not found');
    }

    // Construct the filter object dynamically based on query parameters
    let filter = { user: user._id };

    if (search) {
      filter.businessName = { $regex: search, $options: 'i' };
    }
    
    if (industry) {
      filter.clientIndustry = industry; // Exact match for industry
    }

    if (city) {
      filter.city = { $regex: city, $options: 'i' }; // Partial match for city
    }

    const clients = await Client.find(filter).exec();

    if (clients.length === 0) {
      return successResMsg(res, 200, {
        success: true,
        message: 'No clients found',
        clients: []
      });
    }

    return successResMsg(res, 200, {
      success: true,
      clients
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, 'Server Error');
  }
};

export const deleteClient = async (req, res) => {
  try {
    const { user } = req;
    const { clientId } = req.params;

    if (!user) {
      return errorResMsg(res, 401, 'User not found');
    }

    if (!clientId) {
      return errorResMsg(res, 400, 'Client ID is required');
    }

    // Find and delete the client belonging to the logged-in user
    const client = await Client.findOneAndDelete({ _id: clientId, user: user._id });

    if (!client) {
      return errorResMsg(res, 404, 'Client not found or not authorized to delete this client');
    }

    return successResMsg(res, 200, {
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, 'Server Error');
  }
};

export const totalClients = async(req, res) => {
  try {
    const {user} = req;
    
    if(!user) {
      return errorResMsg(res, 401, 'User not found');
    }

    const totalClients = await Client.countDocuments({user: user._id});

    return successResMsg(res, 200, {
      success: true,
      totalClients
    });
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 500, 'Server Error');
    
  }
};


