import { errorResMsg, successResMsg } from "../lib/responses.js";
import Account from "../models/accounts.model.js"

export const addAccount = async (req, res) => {
    try {
        const { user } = req;
        const { accountType, bankName, accountName, accountNumber } = req.body;

        // Check if all required fields are provided
        if (!accountType || !bankName || !accountName || !accountNumber) {
            return errorResMsg(res, 400, 'Please provide all required fields');
        }

        // Ensure user exists
        if (!user) {
            return errorResMsg(res, 401, 'User not found');
        }

        // Check if account already exists for this user
        const existingAccount = await Account.findOne({ accountNumber, user: user._id });
        if (existingAccount) {
            return errorResMsg(res, 400, 'Account already exists');
        }

        // Create new account
        const newAccount = new Account({
            accountType,
            bankName,
            accountName,
            accountNumber,
            user: user._id
        });

        // Save the account to the database
        await newAccount.save();

        return successResMsg(res, 201, {
            success: true,
            account: newAccount,
            message: 'Account created successfully',
        });

    } catch (error) {
        console.error(error);

        // Check for validation error
        if (error.name === 'ValidationError') {
            // Collect and format validation error messages
            const messages = Object.values(error.errors).map(err => err.message);
            return errorResMsg(res, 400, messages.join(', '));
        }

        // Handle general server error
        return errorResMsg(res, 500, 'Server Error');
    }
};

export const getAccounts = async (req, res) => {
    try {
        const { user } = req;
        const { page = 1, limit = 10 } = req.query;
        
        if (!user) {
            return errorResMsg(res, 401, 'User not found');
        }
        
        // Fetch all accounts for the current user
        const accounts = await Account.find({ user: user._id })
           .skip((page - 1) * limit)
           .limit(limit)
           .exec();
            return successResMsg(res, 200, {
            success: true,
            accounts,
            message: 'Account successfully retrieved',
        });
        
    } catch (error) {
        console.error(error);
        return errorResMsg(res, 500, 'Server Error');
    
    }
};

export const updateAccount = async (req, res) => {
    try {
        const { user } = req;
        const { accountId } = req.params;
        const { accountType, bankName, accountName, accountNumber } = req.body;
        
        // Validate required fields
        if (!accountType || !bankName || !accountName || !accountNumber) {
            return errorResMsg(res, 400, 'Please provide all required fields');
        }
        
        if (!user) {
            return errorResMsg(res, 401, 'User not found');
        }
        
        // Find the account belonging to the logged-in user
        const account = await Account.findOne({ _id: accountId, user: user._id });
        
        // Check if account exists and belongs to the user
        if (!account) {
            return errorResMsg(res, 404, 'Account not found or not authorized to update this account');
        }
        
        // Update the account fields
        account.accountType = accountType;
        account.bankName = bankName;
        account.accountName = accountName;
        account.accountNumber = accountNumber;
        
        // Save the updated account
        await account.save();
        
        return successResMsg(res, 200, {
            success: true,
            account,
            message: 'Account updated successfully'
        });
        
    } catch (error) {
        console.error(error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return errorResMsg(res, 400, messages.join(', '));
        }
        
        return errorResMsg(res, 500, 'Server Error');
    }
};

export const getAccountById = async(req, res) => {
    try {
        const { user } = req;
        const { accountId } = req.params;
        
        if (!user) {
            return errorResMsg(res, 401, 'User not found');
        }
        
        // Fetch the account belonging to the logged-in user
        const account = await Account.findOne({ _id: accountId, user: user._id });
        
        // Check if account exists and belongs to the user
        if (!account) {
            return errorResMsg(res, 404, 'Account not found or not authorized to view this account');
        }
        
        return successResMsg(res, 200, {
            success: true,
            account,
            message: 'Account successfully retrieved'
        });
        
    } catch (error) {
        console.error(error);
        return errorResMsg(res, 500, 'Server Error');
        
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const { user } = req;
        const { accountId } = req.params;
        
        if (!user) {
            return errorResMsg(res, 401, 'User not found');
        }
        
        // Fetch the account belonging to the logged-in user
        const account = await Account.findOne({ _id: accountId, user: user._id });
        
        // Check if account exists and belongs to the user
        if (!account) {
            return errorResMsg(res, 404, 'Account not found or not authorized to delete this account');
        }
        
        // Delete the account
        await Account.deleteOne({ _id: accountId, user: user._id });

        return successResMsg(res, 200, {
            success: true,
            message: 'Account deleted successfully'
        });
        
    } catch (error) {
        console.error(error);
        return errorResMsg(res, 500, 'Server Error');
    }
};



