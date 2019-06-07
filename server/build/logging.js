'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = _winston2.default.createLogger({
  level: 'info',
  format: _winston2.default.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [new _winston2.default.transports.File({ filename: 'error.log', level: 'error' }), new _winston2.default.transports.File({ filename: 'combined.log' })]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new _winston2.default.transports.Console({
    format: _winston2.default.format.simple()
  }));
}

exports.default = logger;