"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @description - function to verify email addresses
 * @param {string} -email
 * @return {boolean}
 */

const emailIsValid = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

exports.default = emailIsValid;