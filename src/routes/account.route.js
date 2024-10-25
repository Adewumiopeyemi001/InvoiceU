import express from 'express';
import { addAccount, getAccounts, updateAccount, getAccountById, deleteAccount } from '../controllers/account.controller.js';
import { authenticateUser } from '../middlewares/auth.js';
const Router = express.Router();

/**
 * @swagger
 * /addaccount:
 *   post:
 *     summary: Add a new bank account
 *     description: This endpoint allows an authenticated user to add a new bank account.
 *     tags:
 *       - Accounts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accountType
 *               - bankName
 *               - accountName
 *               - accountNumber
 *             properties:
 *               accountType:
 *                 type: string
 *                 description: The type of account (e.g., Savings, Current)
 *                 example: "Savings"
 *               bankName:
 *                 type: string
 *                 description: The name of the bank
 *                 example: "Bank of America"
 *               accountName:
 *                 type: string
 *                 description: The name associated with the bank account
 *                 example: "John Doe"
 *               accountNumber:
 *                 type: string
 *                 description: The account number
 *                 example: "123456789"
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 account:
 *                   type: object
 *                   properties:
 *                     accountType:
 *                       type: string
 *                       example: "Savings"
 *                     bankName:
 *                       type: string
 *                       example: "Bank of America"
 *                     accountName:
 *                       type: string
 *                       example: "John Doe"
 *                     accountNumber:
 *                       type: string
 *                       example: "123456789"
 *                     user:
 *                       type: string
 *                       example: "60d5ec49f79c3e2a8c8b4567"
 *                 message:
 *                   type: string
 *                   example: "Account created successfully"
 *       400:
 *         description: Bad request due to missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Please provide all required fields"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server Error"
 */
Router.post('/addaccount', authenticateUser, addAccount);

/**
 * @swagger
 * /getaccounts:
 *   get:
 *     summary: Retrieve all bank accounts for the authenticated user
 *     description: This endpoint allows an authenticated user to retrieve a list of their bank accounts with pagination.
 *     tags:
 *       - Accounts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of accounts per page
 *     responses:
 *       200:
 *         description: Successfully retrieved accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accounts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       accountType:
 *                         type: string
 *                         example: "Savings"
 *                       bankName:
 *                         type: string
 *                         example: "Bank of America"
 *                       accountName:
 *                         type: string
 *                         example: "John Doe"
 *                       accountNumber:
 *                         type: string
 *                         example: "123456789"
 *                       user:
 *                         type: string
 *                         example: "60d5ec49f79c3e2a8c8b4567"
 *                 message:
 *                   type: string
 *                   example: "Account successfully retrieved"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server Error"
 */
Router.get('/getaccounts', authenticateUser, getAccounts);

/**
 * @swagger
 * /updateaccount/{accountId}:
 *   put:
 *     summary: Update a bank account for the authenticated user
 *     description: Allows an authenticated user to update details of an existing bank account.
 *     tags:
 *       - Accounts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the account to update
 *       - in: body
 *         name: account
 *         description: Updated account details
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             accountType:
 *               type: string
 *               example: "Checking"
 *             bankName:
 *               type: string
 *               example: "Chase Bank"
 *             accountName:
 *               type: string
 *               example: "John Doe"
 *             accountNumber:
 *               type: string
 *               example: "987654321"
 *     responses:
 *       200:
 *         description: Successfully updated account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 account:
 *                   type: object
 *                   properties:
 *                     accountType:
 *                       type: string
 *                       example: "Checking"
 *                     bankName:
 *                       type: string
 *                       example: "Chase Bank"
 *                     accountName:
 *                       type: string
 *                       example: "John Doe"
 *                     accountNumber:
 *                       type: string
 *                       example: "987654321"
 *                 message:
 *                   type: string
 *                   example: "Account updated successfully"
 *       400:
 *         description: Bad request - missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Please provide all required fields"
 *       401:
 *         description: Unauthorized - user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       404:
 *         description: Not found - account not found or not authorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Account not found or not authorized to update this account"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server Error"
 */
Router.put('/updateaccount/:accountId', authenticateUser, updateAccount);

/**
 * @swagger
 * /getaccount/{accountId}:
 *   get:
 *     summary: Get a specific bank account by ID for the authenticated user
 *     description: Allows an authenticated user to retrieve details of a specific bank account.
 *     tags:
 *       - Accounts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the account to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved account
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 account:
 *                   type: object
 *                   properties:
 *                     accountType:
 *                       type: string
 *                       example: "Checking"
 *                     bankName:
 *                       type: string
 *                       example: "Chase Bank"
 *                     accountName:
 *                       type: string
 *                       example: "John Doe"
 *                     accountNumber:
 *                       type: string
 *                       example: "987654321"
 *                 message:
 *                   type: string
 *                   example: "Account successfully retrieved"
 *       400:
 *         description: Bad request - missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       404:
 *         description: Not found - account not found or unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Account not found or not authorized to view this account"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server Error"
 */
Router.get('/getaccount/:accountId', authenticateUser, getAccountById);

/**
 * @swagger
 * /deleteaccount/{accountId}:
 *   delete:
 *     summary: Delete a specific bank account by ID for the authenticated user
 *     description: Allows an authenticated user to delete a specific bank account.
 *     tags:
 *       - Accounts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the account to delete
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Account deleted successfully"
 *       401:
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       404:
 *         description: Not found - Account does not exist or unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Account not found or not authorized to delete this account"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Server Error"
 */
Router.delete('/deleteaccount/:accountId', authenticateUser, deleteAccount);

export default Router;