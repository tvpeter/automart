'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _usersData = require('../usersData');

var _usersData2 = _interopRequireDefault(_usersData);

var _carsData = require('../carsData');

var _carsData2 = _interopRequireDefault(_carsData);

var _FlagModel = require('../../models/FlagModel');

var _FlagModel2 = _interopRequireDefault(_FlagModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { expect } = _chai2.default;

describe('Flag model', () => {
  describe('Create a flag', () => {
    it('should create a minor new flag', done => {
      const data = {
        carId: _carsData2.default[0].id,
        reason: 'Over price',
        description: 'The car has been used for more than 10 years. The price is too ridiculous',
        reportedBy: _usersData2.default[0].id
      };
      const newFlag = _FlagModel2.default.createFlag(data);
      const { flags } = _FlagModel2.default;
      expect(newFlag).to.have.property('id');
      expect(newFlag).to.have.property('carId').eq(data.carId);
      expect(newFlag).to.have.property('status').eq('pending');
      expect(newFlag).to.have.property('reportedBy').eq(data.reportedBy);
      expect(newFlag).to.have.property('severity').eq('minor');
      expect(newFlag).to.have.property('reason');
      expect(newFlag).to.have.property('description');
      expect(flags.length).to.be.greaterThan(0);
      done();
    });
    it('should create a severe flag', done => {
      const data = {
        carId: _carsData2.default[1].id,
        reason: 'Stolen',
        severity: 'Extreme',
        description: 'Vehicle seems stolen and reported',
        reportedBy: _usersData2.default[1].id
      };
      const newFlag = _FlagModel2.default.createFlag(data);
      const { flags } = _FlagModel2.default;
      expect(newFlag).to.have.property('id');
      expect(newFlag).to.have.property('carId').eq(data.carId);
      expect(newFlag).to.have.property('status').eq('pending');
      expect(newFlag).to.have.property('severity').eq(data.severity);
      expect(newFlag).to.have.property('reportedBy').eq(data.reportedBy);
      expect(flags.length).to.be.greaterThan(0);
      done();
    });
  });
});