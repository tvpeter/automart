import jwt from 'jsonwebtoken';


/**
 * @description - generate auth token for users
 * @param {string} id
 * @param {boolean} is_admin
 * @return {string} token
 */
// eslint-disable-next-line camelcase
const generateToken = (id, is_admin, fn) => {
  const token = jwt.sign({
    id, is_admin, fn,
  }, process.env.JWT_SECRET, { expiresIn: '12h' });
  return token;
};

export default generateToken;
