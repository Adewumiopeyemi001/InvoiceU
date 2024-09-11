import passport from 'passport';
import dotenv from 'dotenv';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2'; // Corrected import
import User from '../models/users.model.js'; // Adjust path as necessary

dotenv.config();

// Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Check if user with the same email exists to avoid duplicates
          user = await User.findOne({ email: profile.emails[0].value });

          if (!user) {
            user = await User.create({
              googleId: profile.id,
              email: profile.emails[0].value,
              password: '12345',
            });
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// LinkedIn OAuth strategy
passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: process.env.LINKEDIN_CALLBACK_URL,
      scope: ['email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Try to find the user by their LinkedIn ID or email
        let user = await User.findOne({ linkedinId: profile.id });

        if (!user) {
          user = await User.findOne({ email: profile.emails[0].value });

          if (!user) {
            // Create a new user if not found
            user = new User({
              linkedinId: profile.id,
              email: profile.emails[0].value,
              password: '12345', // Ensure password is hashed, or use a proper flow
            });
            await user.save(); // Save the newly created user
          }
        }

        // Ensure `user` is an instance of `User` schema
        user = await User.findById(user._id); // Refetch to get instance methods like generateAuthToken

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);


// Serialize user for session management
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
