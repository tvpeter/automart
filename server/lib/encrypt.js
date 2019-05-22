import bcrypt from 'bcrypt';

/**
 * @description -function to hash password
 * @param {string} password
 * @returns {Promise}
 */

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);

  const hashed = await bcrypt.hash(password, salt);
  return hashed;
};

/**
 * @description check supplied password against hashed password in db
 * @param {string} password -plain password
 * @param {string} hashedPassword - hashed password from db
 * @returns {Promise}
 */

export const comparePassword = async (password, hashedPassword) => {
  const checkPassword = await bcrypt.compare(password, hashedPassword);
  return checkPassword;
};
