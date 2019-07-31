import jwt from 'jsonwebtoken';
import Util from '../lib/Util';

/**
 * @description - middleware to check and verify admin tokens
 * @param {object} req - HTTP Request
 * @param {object} res - HTTP Response
 * @param {function} next - callback function
 * @returns {object}
 */
const adminAuth = (req, res, next) => {
  const token = req.header('x-auth') || req.body.token || req.headers['x-auth'] || req.headers.token;
  if (!token) {
    return Util.sendError(res, 401, 'No authorization token provided');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.is_admin = decoded.is_admin;
    if (!decoded.is_admin) {
      return Util.sendError(res, 401, 'You dont have the permission to access this resource');
    }
    return next();
  } catch (err) {
    return Util.sendError(res, 401, 'Unauthorized, invalid token or session have expired');
  }
};

export default adminAuth;
