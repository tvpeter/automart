import jwt from 'jsonwebtoken';


/**
 * @description - generate auth token for users
 * @param {string} id
 * @param {boolean} userRole
 * @return {string} token
 */
const generateToken = (id, userRole, fn) => {
  const token = jwt.sign({
    id, role: userRole, fn,
  }, process.env.JWT_SECRET, { expiresIn: '12h' });
  return token;
};

export default generateToken;
