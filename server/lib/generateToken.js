import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
/**
 * @description - generate auth token for users
 * @param {string} id
 * @param {boolean} userRole
 * @return {string} token
 */

dotenv.config();

const generateToken = (id, userRole) => {
  const token = jwt.sign({
    _id: id, role: userRole,
  }, process.env.JWT_SECRET, { expiresIn: '12h' });
  return token;
};

export default generateToken;
