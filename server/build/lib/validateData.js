'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

const validateData = (requiredProperties, data) => requiredProperties.find(property => data[property] === undefined || data[property] === '');
exports.default = validateData;