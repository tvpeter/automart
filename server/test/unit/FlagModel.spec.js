import chai from 'chai';
import usersdata from '../usersData';
import carsdata from '../carsData';
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
});
