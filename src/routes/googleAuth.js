import express from 'express';
import passport from 'passport';
// import cors from 'cors';
import '../config/passport.js'; // Ensure this file is imported to configure passport
import { googleSign } from '../controllers/google.user.js';

const router = express.Router();

// Apply CORS to Google authentication routes if needed
// const corsOptions = {
//   origin: 'http://localhost:5173',
//   credentials: true,
// };
// router.use(cors(corsOptions));

// Google OAuth

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google authentication
 *     description: Redirects the user to Google for authentication.
 *     tags:
 *       - Auth
 *     responses:
 *       302:
 *         description: Redirects to Google's authentication page.
 * 
 * /auth/google/redirect:
 *   get:
 *     summary: Handle Google authentication callback
 *     description: Callback endpoint after Google authentication. Generates a token for the user and sends a verification email if needed.
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: User authenticated successfully and token generated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *       401:
 *         description: Unauthorized - User not authenticated.
 *       500:
 *         description: Internal server error - Failed to generate token or send email.
 */
 router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email'] }));
  // Redirect to the home page after successful authentication
router.get(
  '/auth/google/redirect',
  passport.authenticate('google', { failureRedirect: '/login' }), googleSign);



export default router;
