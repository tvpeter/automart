'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @description - generate auth token for users
 * @param {string} id
 * @param {boolean} userRole
 * @return {string} token
 */

_dotenv2.default.config();

const generateToken = (id, userRole) => {
  const token = _jsonwebtoken2.default.sign({
    id, role: userRole
  }, process.env.JWT_SECRET, { expiresIn: '12h' });
  return token;
};

exports.default = generateToken;