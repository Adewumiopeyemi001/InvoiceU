import express from 'express';
import {register, login, verifyEmail, getProfile, updateProfile, forgotPassword, resetPassword} from '../controllers/users.controller.js';
import { authenticateUser } from '../middlewares/auth.js';
import upload from "../public/images/multer.js"

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
router.put('/updateprofile', authenticateUser, upload.single("profilePicture"), updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);


export default router;