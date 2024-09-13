import jwt from 'jsonwebtoken';
import User from '../models/users.model.js';
import { errorResMsg } from '../lib/responses.js';

// export const authenticateUser = async (req, res, next) => {
//   try {
//     // Extract the token from the Authorization header
//     const token = req.headers.authorization?.split(' ')[1];

//     if (!token) {
//       return errorResMsg(res, 401, 'Not authorized, no token');
//     }

//     // Verify the token using the secret key
//     const decoded = jwt.verify(token, process.env.SECRET_KEY);

//     // Find the user by decoded _id and exclude password field
//     const user = await User.findById(decoded._id).select('-password');

//     if (!user) {
//       return errorResMsg(res, 401, 'User not found');
//     }

//     // Check if the token exists in the user's token array
//     const isTokenValid = user.tokens.find(tokenObj => tokenObj.token === token);

//     if (!isTokenValid) {
//       return errorResMsg(res, 401, 'Invalid token or session expired');
//     }

//     // Attach user and token to the request object
//     req.user = user;
//     req.token = token;

//     next(); // Proceed to the next middleware or route handler
//   } catch (error) {
//     console.error(error);
//     return errorResMsg(res, 401, 'Not authorized, token verification failed');
//   }
// };
export const authenticateUser = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return errorResMsg(res, 401, 'No token provided, authorization denied');
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded._id);

    if (!user) {
      return errorResMsg(res, 401, 'User not found');
    }

    req.user = user;  // Attach the user object to the request
    next();
  } catch (error) {
    console.error(error);
    return errorResMsg(res, 401, 'Invalid token');
  }
};