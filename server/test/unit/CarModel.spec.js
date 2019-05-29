import chai from 'chai';
import CarModel from '../../models/CarModel';
import carsdata from '../carsData';

const { expect } = chai;

describe('Car Model', () => {
  describe('Create a car advert', () => {
    it('should create a new advert', () => {
      const newCar = CarModel.createCar({
        owner: '158372637283904',
        state: 'new',
        status: 'available',
        price: 12000000,
        manufacturer: 'Ford',
        model: 'Ford Fiesta 2017',
        body_type: 'Sedan',
        description: 'This is the description',
      });
      expect(newCar).to.have.property('created_on');
      expect(newCar).to.have.property('id');
    });
  });
  describe('Get all adverts', () => {
    it('should return an array of all ads', () => {
      CarModel.cars = carsdata;
      const cars = CarModel.getAllCars();
      expect(cars).to.be.an('Array');
      expect(cars[0]).to.have.property('id');
    });
    it('should return an empty array if there are no ads', () => {
      const cars = CarModel.getAllCars();
      expect(cars).to.be.an('Array');
    });
  });
  describe('It should return a single ad', () => {
    it('should an ad with the given id', () => {
      CarModel.cars = carsdata;
      const { id } = carsdata[0];
      const res = CarModel.findSingle(id);
      expect(res).to.be.an('Object');
      expect(res.id).to.eq(id);
    });
    it('should return undefined if there is no ad with given id', () => {
      CarModel.cars = carsdata;
      const res = CarModel.findSingle('1111111');
      // eslint-disable-next-line no-unused-expressions
      expect(res).to.be.undefined;
    });
  });
  describe('Get unsold cars by an attribute', () => {
    it('should return all unsold cars by manufacturer', () => {
      CarModel.cars = carsdata;
      const { manufacturer } = carsdata[0];
      const res = CarModel.getUnsoldCarsByProperty('manufacturer', manufacturer);
      expect(res).to.be.an('Array');
    });
    it('should return all unsold cars by body type', () => {
      CarModel.cars = carsdata;
      // eslint-disable-next-line camelcase
      const { body_type } = carsdata[0];
      const res = CarModel.getUnsoldCarsByProperty('body_type', body_type);
      expect(res).to.be.an('Array');
    });
    it('should return all unsold cars by state', () => {
      CarModel.cars = carsdata;
      const { state } = carsdata[0];
      const res = CarModel.getUnsoldCarsByProperty('state', state);
      expect(res).to.be.an('Array');
    });
  });

  describe('Get all unsold cars', () => {
    it('should return all unsold cars', () => {
      CarModel.cars = carsdata;
      const res = CarModel.getAllUnsoldCars();
      expect(res).to.be.an('Array');
      expect(res[0]).to.have.property('status').eq('available');
    });
  });
  describe('Complete ad update', () => {
    it('should return an ad with updated properties', () => {
      CarModel.cars = carsdata;
      const { id } = carsdata[1];

      const data = {
        state: 'New',
        status: 'Sold',
        price: 400000,
        description: 'This is a new description',
      };
      const res = CarModel.completeUpdate(id, data);
      expect(res.state).to.eq(data.state);
      expect(res.status).to.eq(data.status);
      expect(res.price).to.eq(data.price);
    });
  });
  describe('Complete update status', () => {
    it('should return an ad with status updated', () => {
      CarModel.cars = carsdata;
      const { id } = carsdata[0];

      const data = {
        status: 'Sold',
      };
      const res = CarModel.updateAdStatus(id, data);
      expect(res.status).to.eq(data.status);
    });
  });
  describe('Complete get cars within a price range', () => {
    it('should return cars within the given price range', () => {
      CarModel.cars = carsdata;
      const min = 5000000; const max = 8000000;

      const res = CarModel.getCarsWithinPriceRange(min, max);
      expect(res).to.be.an('Array');
    });
  });
});
