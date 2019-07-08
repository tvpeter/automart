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

const auth = (req, res, next) => {
  const token = req.cookies['x-auth'] || req.header('x-auth');
  if (!token) {
    // return res.status(401).redirect('/');
    return Util.sendError(res, 401, 'No authorization token provided');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.role = decoded.role;
    if (!req.cookies.fn) {
      res.cookie('fn', decoded.fn, { httpOnly: false });
    }
    return next();
  } catch (err) {
    // return res.status(401).redirect('/');
    return Util.sendError(res, 401, 'Unauthorized, invalid token or session have expired');
  }
};

export default auth;
