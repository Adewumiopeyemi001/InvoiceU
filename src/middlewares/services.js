
import User from '../models/users.model.js';
import bcrypt from 'bcryptjs';

export const checkExistingUser = async (email) => {
  return User.findOne({ email });
};

export const findUserById = async (id) => {
  return User.findById(id);
};

// export const checkExistingPassword = async (password, user) => {
//   return bcrypt.compare(password, user.password);
// };
export const checkExistingPassword = async (password, userPassword) => {
  if (!userPassword) {
    throw new Error('User password not found');
  }
  return bcrypt.compare(password, userPassword);
};

export const checkExistingUserToken = async ({ resetPasswordToken: token }) => {
  return User.findOne({ resetPasswordToken: token });
};




