import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

/**
 * @description - middleware to check and verify tokens
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 * @param {function} next - callback function
 * @returns {object}
 */
dotenv.config();

const auth = (req, res, next) => {
  const error = {};
  const token = req.header('x-auth');
  if (!token) {
    error.token = 'No authorization token provided';
    return res.status(401).send({
      status: 'error',
      message: error.token,
      error,
    });
  }
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    // req.userId = decoded.id;
    // req.role = decoded.role;
    return next();
  } catch (err) {
    error.message = 'Unauthorized, invalid token or session have expired';
    return res.status(401).json({
      status: 'error',
      message: error.message,
      error,
    });
  }
};

export default auth;
