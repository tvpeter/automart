import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
/**
 * @description - generate auth token for users
 * @param {string} id
 * @param {boolean} userRole
 * @return {string} token
 */

dotenv.config();

const generateToken = (id, userRole, fn) => {
  const token = jwt.sign({
    id, role: userRole, fn,
  }, process.env.JWT_SECRET, { expiresIn: '12h' });
  return token;
};

export default generateToken;
