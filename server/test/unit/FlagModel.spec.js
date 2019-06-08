import chai from 'chai';
import usersdata from '../usersData';
import carsdata from '../carsData';
import flagsData from '../flagsData';
import FlagModel from '../../models/FlagModel';

const { expect } = chai;

describe('Flag model', () => {
  describe('Create a flag', () => {
    it('should create a minor new flag', (done) => {
      const data = {
        carId: carsdata[0].id,
        reason: 'Over price',
        description: 'The car has been used for more than 10 years. The price is too ridiculous',
        reportedBy: usersdata[0].id,
      };
      const newFlag = FlagModel.createFlag(data);
      const { flags } = FlagModel;
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
    it('should create a severe flag', (done) => {
      const data = {
        carId: carsdata[1].id,
        reason: 'Stolen',
        severity: 'Extreme',
        description: 'Vehicle seems stolen and reported',
        reportedBy: usersdata[1].id,
      };
      const newFlag = FlagModel.createFlag(data);
      const { flags } = FlagModel;
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
    it('should return a single flag with given id', (done) => {
      FlagModel.flags = flagsData;
      const flagId = flagsData[0].id;

      const flag = FlagModel.findSingleFlag(flagId);
      expect(flag).to.have.property('id').eq(flagsData[0].id);
      expect(flag).to.have.property('carId').eq(flagsData[0].carId);
      expect(flag).to.have.property('status').eq(flagsData[0].status);
      expect(flag).to.have.property('severity').eq(flagsData[0].severity);
      done();
    });
  });
  describe('Update a flag status', () => {
    it('should update a given flag status to resolved', () => {
      flagsData[0].status = 'pending';
      FlagModel.flags = flagsData;
      const flagId = flagsData[0].id;

      const flag = FlagModel.updateFlagStatus(flagId);
      expect(flag).to.have.property('id').eq(flagsData[0].id);
      expect(flag).to.have.property('carId').eq(flagsData[0].carId);
      expect(flag).to.have.property('status').eq('resolved');
    });
  });
  describe('Deletes a flag', () => {
    it('should delete a given flag', () => {
      FlagModel.flags = flagsData;
      const { length } = flagsData;
      const flag = flagsData[0];

      FlagModel.deleteFlag(flag);
      const res = FlagModel.findSingleFlag(flag.id);
      expect(res).to.eq(undefined);
      expect(flagsData.length).to.eq(length - 1);
    });
  });
});
