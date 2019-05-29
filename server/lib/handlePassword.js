import bcrypt from 'bcrypt';

/**
 * @description -function to hash password
 * @param {string} password
 * @returns {Promise}
 */

export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);

    const hashed = await bcrypt.hash(password, salt);
    return hashed;
  } catch (error) {
    throw error;
  }
};

/**
 * @description check supplied password against hashed password in db
 * @param {string} password -plain password
 * @param {string} hashedPassword - hashed password from db
 * @returns {<boolean>}
 */

export const comparePassword = async (password, hashedPassword) => {
  try {
    const checkPassword = await bcrypt.compare(password, hashedPassword);
    return checkPassword;
  } catch (error) {
    throw error;
  }
};
