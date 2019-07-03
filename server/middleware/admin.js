import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Util from '../lib/Util';

/**
 * @description - middleware to check and verify tokens
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 * @param {function} next - callback function
 * @returns {object}
 */
dotenv.config();

const adminAuth = (req, res, next) => {
  const token = req.header('x-auth');
  if (!token) {
    return Util.sendError(res, 401, 'No authorization token provided');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.role = decoded.role;
    if (!decoded.role) {
      return Util.sendError(res, 401, 'You dont have the permission to access this resource');
    }
    return next();
  } catch (err) {
    return Util.sendError(res, 401, 'Unauthorized, invalid token or session have expired');
  }
};

export default adminAuth;
