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
 * @description - middleware to check and verify tokens
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 * @param {function} next - callback function
 * @returns {object}
 */
_dotenv2.default.config();

const auth = (req, res, next) => {
  const token = req.header('x-auth');
  if (!token) {
    return res.status(401).send({
      status: 401,
      message: 'No authorization token provided'
    });
  }
  try {
    const decoded = _jsonwebtoken2.default.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.role = decoded.role;
    return next();
  } catch (err) {
    return res.status(401).send({
      status: 401,
      message: 'Unauthorized, invalid token or session have expired'
    });
  }
};

exports.default = auth;