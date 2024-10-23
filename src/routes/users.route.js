import express from 'express';
import {register, login, verifyEmail, logout} from '../controllers/auth.controller.js';
import { authenticateUser } from '../middlewares/auth.js';
import upload from "../public/images/multer.js"
import { changePassword, forgotPassword, resetPassword } from '../controllers/password.controller.js';
import { createAccount, editProfile, getProfile } from '../controllers/user.controller.js';

const router = express.Router();

/** 
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with a username, email, password, and role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Enter your email address
 *               password:
 *                 type: string
 *                 description: Enter your password
 *     responses:
 *       201:
 *         description: Created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/register', register);
/** 
 * @swagger
 * /login:
 *   post:
 *     summary: Login into your account
 *     description: Enter your email address and password to login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Enter your email address
 *               password:
 *                 type: string
 *                 description: Enter your password
 *     responses:
 *       200:
 *         description: Lgoin successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/login', login);

/**
 * @swagger
 * /verify-email:
 *   get:
 *     summary: Verify user email
 *     description: This endpoint verifies a user's email by checking a token sent via email.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The token sent to the user's email for verification.
 *     responses:
 *       200:
 *         description: Email verified successfully.
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
 *                   example: "Email verified successfully"
 *       400:
 *         description: Invalid or missing token.
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
 *                   example: "Invalid Token"
 *       500:
 *         description: Internal server error.
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
router.get('/verify-email', verifyEmail);

/**
 * @swagger
 * /myprofile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieves the authenticated user's profile information.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                       example: "Opeyemi"
 *                     lastName:
 *                       type: string
 *                       example: "Adewumi"
 *                     phoneNumber:
 *                       type: string
 *                       example: "+2347069096744"
 *                     city:
 *                       type: string
 *                       example: "Abeokuta"
 *                     address:
 *                       type: string
 *                       example: "c1/38, FHE, ELEGA"
 *                     registrationDate:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-09-07T16:20:27.651Z"
 *                     profilePicture:
 *                       type: string
 *                       example: "https://example.com/profile.jpg"
 *       401:
 *         description: User not authenticated or profile not found.
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
 *         description: Server error.
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
router.get('/myprofile', authenticateUser, getProfile);

/**
 * @swagger
 * /createaccount:
 *   put:
 *     summary: Create or update a user's account and company details
 *     description: This endpoint allows authenticated users to create or update their account details including personal information and company details. A company logo can be uploaded.
 *     tags:
 *       - Account
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The user's first name
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: The user's last name
 *                 example: "Doe"
 *               phoneNumber:
 *                 type: string
 *                 description: The user's phone number
 *                 example: "+1234567890"
 *               address:
 *                 type: string
 *                 description: The user's residential address
 *                 example: "123 Main St"
 *               companyName:
 *                 type: string
 *                 description: The company's name
 *                 example: "Tech Corp"
 *               occupation:
 *                 type: string
 *                 description: The user's occupation
 *                 example: "Software Developer"
 *               industry:
 *                 type: string
 *                 description: The industry the company operates in
 *                 example: "Technology"
 *               country:
 *                 type: string
 *                 description: The country of the company
 *                 example: "USA"
 *               state:
 *                 type: string
 *                 description: The state where the company is located
 *                 example: "California"
 *               city:
 *                 type: string
 *                 description: The city where the company is located
 *                 example: "San Francisco"
 *               zipCode:
 *                 type: string
 *                 description: The zip code of the company's address
 *                 example: "94105"
 *               companyAddress:
 *                 type: string
 *                 description: The company's address
 *                 example: "456 Market St"
 *               companyLogo:
 *                 type: string
 *                 format: binary
 *                 description: The company's logo file to be uploaded
 *     responses:
 *       200:
 *         description: Account and company details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     phoneNumber:
 *                       type: string
 *                       example: "+1234567890"
 *                     address:
 *                       type: string
 *                       example: "123 Main St"
 *                     companyName:
 *                       type: string
 *                       example: "Tech Corp"
 *                     companyLogo:
 *                       type: string
 *                       example: "https://example.com/logo.png"
 *                     occupation:
 *                       type: string
 *                       example: "Software Developer"
 *                     industry:
 *                       type: string
 *                       example: "Technology"
 *                     country:
 *                       type: string
 *                       example: "USA"
 *                     state:
 *                       type: string
 *                       example: "California"
 *                     city:
 *                       type: string
 *                       example: "San Francisco"
 *                     zipCode:
 *                       type: string
 *                       example: "94105"
 *                     companyAddress:
 *                       type: string
 *                       example: "456 Market St"
 *       400:
 *         description: Bad request. Missing required fields or logo file.
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
 *                   example: "Please fill in the required fields"
 *       404:
 *         description: User not found.
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
router.put('/createaccount', authenticateUser, upload.single("companyLogo"), createAccount);

/**
 * @swagger
 * /editprofile:
 *   put:
 *     summary: Edit user profile and company details
 *     description: This endpoint allows authenticated users to edit their profile information, including personal details, company details, and optionally upload a new profile picture or company logo.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: The user's first name
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: The user's last name
 *                 example: "Doe"
 *               phoneNumber:
 *                 type: string
 *                 description: The user's phone number
 *                 example: "+1234567890"
 *               address:
 *                 type: string
 *                 description: The user's residential address
 *                 example: "123 Main St"
 *               companyName:
 *                 type: string
 *                 description: The company's name
 *                 example: "Tech Corp"
 *               occupation:
 *                 type: string
 *                 description: The user's occupation
 *                 example: "Software Developer"
 *               industry:
 *                 type: string
 *                 description: The industry the company operates in
 *                 example: "Technology"
 *               country:
 *                 type: string
 *                 description: The country where the company is based
 *                 example: "USA"
 *               state:
 *                 type: string
 *                 description: The state where the company is located
 *                 example: "California"
 *               city:
 *                 type: string
 *                 description: The city where the company is located
 *                 example: "San Francisco"
 *               zipCode:
 *                 type: string
 *                 description: The zip code of the company's address
 *                 example: "94105"
 *               companyAddress:
 *                 type: string
 *                 description: The company's address
 *                 example: "456 Market St"
 *               companyLogo:
 *                 type: string
 *                 format: binary
 *                 description: The company logo file to upload
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: The user's profile picture file to upload
 *     responses:
 *       200:
 *         description: Profile and company details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     phoneNumber:
 *                       type: string
 *                       example: "+1234567890"
 *                     address:
 *                       type: string
 *                       example: "123 Main St"
 *                     profilePicture:
 *                       type: string
 *                       example: "https://example.com/profile.jpg"
 *                     companyName:
 *                       type: string
 *                       example: "Tech Corp"
 *                     companyLogo:
 *                       type: string
 *                       example: "https://example.com/logo.png"
 *                     occupation:
 *                       type: string
 *                       example: "Software Developer"
 *                     industry:
 *                       type: string
 *                       example: "Technology"
 *                     country:
 *                       type: string
 *                       example: "USA"
 *                     state:
 *                       type: string
 *                       example: "California"
 *                     city:
 *                       type: string
 *                       example: "San Francisco"
 *                     zipCode:
 *                       type: string
 *                       example: "94105"
 *                     companyAddress:
 *                       type: string
 *                       example: "456 Market St"
 *       400:
 *         description: Bad request. Missing required fields or invalid file uploads.
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
 *                   example: "Please fill in the required fields"
 *       404:
 *         description: User not found.
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
router.put('/editprofile', authenticateUser, upload.fields([{ name: 'companyLogo' }, { name: 'profilePicture' }]), editProfile);

/**
 * @swagger
 * /forgot-password:
 *   post:
 *     summary: Forgot Password - Request Password Reset Link
 *     description: This endpoint allows users to request a password reset link by providing their email address. If the email is valid and associated with an account, a reset token is generated and emailed to the user.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email address associated with the user's account
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 resetPasswordToken:
 *                   type: string
 *                   description: The password reset token or URL
 *                   example: "http://example.com/reset-password?token=abcdef123456"
 *                 message:
 *                   type: string
 *                   example: "Please check your email to reset your password"
 *       400:
 *         description: Bad request due to missing or invalid email
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
 *                   example: "Please enter your email address"
 *       401:
 *         description: Unauthorized due to invalid email address
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
 *                   example: "Invalid email address"
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
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /reset-password:
 *   post:
 *     summary: Reset Password
 *     description: This endpoint allows users to reset their password by providing a valid reset token and a new password. The token must be obtained via the "forgot password" process.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *           description: The reset token sent via email to the user
 *           example: "abcdef123456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 description: The new password for the account
 *                 example: "newSecurePassword123"
 *               confirmPassword:
 *                 type: string
 *                 description: Confirmation of the new password (must match newPassword)
 *                 example: "newSecurePassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
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
 *                   example: "Password reset successfully"
 *       400:
 *         description: Bad request due to missing token or password, or if passwords do not match
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
 *                   example: "Please provide a token and password"
 *       401:
 *         description: Unauthorized due to invalid or expired token
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
 *                   example: "Invalid token or token expired"
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
router.post('/reset-password', resetPassword);

/**
 * @swagger
 * /change-password:
 *   put:
 *     summary: Change User Password
 *     description: Allows an authenticated user to change their password by providing the current password and a new password.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               password:
 *                 type: string
 *                 description: The current password of the user
 *                 example: "currentPassword123"
 *               newPassword:
 *                 type: string
 *                 description: The new password that the user wants to set
 *                 example: "newPassword456"
 *               confirmPassword:
 *                 type: string
 *                 description: Confirmation of the new password (must match newPassword)
 *                 example: "newPassword456"
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                   example: "Password changed successfully"
 *       400:
 *         description: Bad request due to missing fields or password mismatch
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
 *                   example: "New password and confirmation do not match"
 *       401:
 *         description: Unauthorized due to incorrect current password or unauthenticated user
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
 *                   example: "Invalid old password"
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
router.put('/change-password', authenticateUser, changePassword);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout User
 *     description: Logs out an authenticated user by removing their session token from the tokens array.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
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
 *                   example: "Logged out successfully"
 *       401:
 *         description: Unauthorized request, no valid user session
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
 *                   example: "Unauthorized"
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
router.post('/logout', authenticateUser, logout);



export default router;