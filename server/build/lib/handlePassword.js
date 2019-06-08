'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.comparePassword = exports.hashPassword = undefined;

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @description -function to hash password
 * @param {string} password
 * @returns {Promise}
 */

const hashPassword = exports.hashPassword = async password => {
  try {
    const salt = await _bcrypt2.default.genSalt(10);

    const hashed = await _bcrypt2.default.hash(password, salt);
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

const comparePassword = exports.comparePassword = async (password, hashedPassword) => {
  try {
    const checkPassword = await _bcrypt2.default.compare(password, hashedPassword);
    return checkPassword;
  } catch (error) {
    throw error;
  }
};