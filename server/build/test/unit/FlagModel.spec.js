'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _usersData = require('../usersData');

var _usersData2 = _interopRequireDefault(_usersData);

var _carsData = require('../carsData');

var _carsData2 = _interopRequireDefault(_carsData);

var _flagsData = require('../flagsData');

var _flagsData2 = _interopRequireDefault(_flagsData);

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
  describe('Find a single flag', () => {
    it('should return a single flag with given id', done => {
      _FlagModel2.default.flags = _flagsData2.default;
      const flagId = _flagsData2.default[0].id;

      const flag = _FlagModel2.default.findSingleFlag(flagId);
      expect(flag).to.have.property('id').eq(_flagsData2.default[0].id);
      expect(flag).to.have.property('carId').eq(_flagsData2.default[0].carId);
      expect(flag).to.have.property('status').eq(_flagsData2.default[0].status);
      expect(flag).to.have.property('severity').eq(_flagsData2.default[0].severity);
      done();
    });
  });
  describe('Update a flag status', () => {
    it('should update a given flag status to resolved', () => {
      _flagsData2.default[0].status = 'pending';
      _FlagModel2.default.flags = _flagsData2.default;
      const flagId = _flagsData2.default[0].id;

      const flag = _FlagModel2.default.updateFlagStatus(flagId);
      expect(flag).to.have.property('id').eq(_flagsData2.default[0].id);
      expect(flag).to.have.property('carId').eq(_flagsData2.default[0].carId);
      expect(flag).to.have.property('status').eq('resolved');
    });
  });
  describe('Deletes a flag', () => {
    it('should delete a given flag', () => {
      _FlagModel2.default.flags = _flagsData2.default;
      const { length } = _flagsData2.default;
      const flag = _flagsData2.default[0];

      _FlagModel2.default.deleteFlag(flag);
      const res = _FlagModel2.default.findSingleFlag(flag.id);
      expect(res).to.eq(undefined);
      expect(_flagsData2.default.length).to.eq(length - 1);
    });
  });
});