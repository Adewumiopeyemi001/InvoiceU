import express from 'express';
import passport from 'passport';
import '../config/passport.js'; // Ensure this file is imported to configure passport
import { googleSign } from '../controllers/google.user.js';

const router = express.Router();

// Google OAuth
 router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));
  // Redirect to the home page after successful authentication
router.get(
  '/auth/google/redirect',
  passport.authenticate('google', { failureRedirect: '/login' }), googleSign);

export default router;
