'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

const logout = (req, res, next) => {
  delete req.header('x-auth');
  return next();
};

exports.default = logout;