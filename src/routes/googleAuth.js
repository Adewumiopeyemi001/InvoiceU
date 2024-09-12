import express from 'express';
import passport from 'passport';
import '../config/passport.js'; // Ensure this file is imported to configure passport
import { googleSign } from '../controllers/google.user.js';

const router = express.Router();

// Google OAuth
 router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email'] }));
  // Redirect to the home page after successful authentication
router.get(
  '/auth/google/redirect',
  passport.authenticate('google', { failureRedirect: '/login' }), googleSign);

  // Redirect the user to LinkedIn for authentication
// router.get('/auth/linkedin', passport.authenticate('linkedin', { scope: ['email'] }));

// // Handle the callback after LinkedIn has authenticated the user
// router.get(
//   '/auth/linkedin/redirect',
//   passport.authenticate('linkedin', { failureRedirect: '/login' }),
//   linkedinLogin
// );


export default router;
