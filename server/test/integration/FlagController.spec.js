import chai from 'chai';
import chaiHttp from 'chai-http';
import carsData from '../carsData';
import server from '../../index';
import CarModel from '../../models/CarModel';
import UserModel from '../../models/UserModel';
import generateToken from '../../lib/generateToken';
import usersData from '../usersData';


const { expect } = chai;
chai.use(chaiHttp);

describe('Flags controller', () => {
  afterEach(() => {
    CarModel.cars = [];
    UserModel.users = [];
  });
  describe('Create a flag', () => {
    it('should create a flag on an ad', (done) => {
      carsData[0].owner = usersData[1].id;
      CarModel.cars = carsData;
      UserModel.users = usersData;

      const user = usersData[0];
      user.isAdmin = false;
      const token = generateToken(user.id, user.isAdmin);
      const data = {
        carId: carsData[0].id,
        reason: 'Wrong Description',
        description: 'The car description is misleading',
        reportedBy: user.id,
      };
      chai.request(server).post('/api/v1/flag').set('x-auth', token).send(data)
        .end((err, res) => {
          expect(res.status).to.eq(200);
          expect(res.body.data).to.have.property('id');
          expect(res.body.data).to.have.property('carId').eq(data.carId);
          expect(res.body.data.reason).to.eq(data.reason);
          done();
        });
    });
    it('should return error 400 if reason is not stated', (done) => {
      carsData[0].owner = usersData[1].id;
      CarModel.cars = carsData;
      UserModel.users = usersData;

      const user = usersData[0];
      user.isAdmin = false;
      const token = generateToken(user.id, user.isAdmin);
      const data = {
        carId: carsData[0].id,
        reason: '',
        description: 'Weird description of the car by the owner',
        reportedBy: user.id,
      };
      chai.request(server).post('/api/v1/flag').set('x-auth', token).send(data)
        .end((err, res) => {
          expect(res.status).to.eq(400);
          expect(res.body.message).to.eq('Ensure to indicate the ad id and reason for the report');
          done();
        });
    });
    it('should return error 400 if ad id is not stateds', (done) => {
      carsData[0].owner = usersData[1].id;
      CarModel.cars = carsData;
      UserModel.users = usersData;

      const user = usersData[0];
      user.isAdmin = false;
      const token = generateToken(user.id, user.isAdmin);
      const data = {
        carId: '',
        reason: 'stolen',
        description: 'Weird description of the car by the owner',
        reportedBy: user.id,
      };
      chai.request(server).post('/api/v1/flag').set('x-auth', token).send(data)
        .end((err, res) => {
          expect(res.status).to.eq(400);
          expect(res.body.message).to.eq('Ensure to indicate the ad id and reason for the report');
          done();
        });
    });
    it('should return error 404 if ad is not found', (done) => {
      carsData[0].owner = usersData[1].id;
      CarModel.cars = carsData;
      UserModel.users = usersData;

      const user = usersData[0];
      user.isAdmin = false;
      const token = generateToken(user.id, user.isAdmin);
      const data = {
        carId: carsData[0] + 1,
        reason: 'stolen',
        description: 'Weird description of the car by the owner',
        reportedBy: user.id,
      };
      chai.request(server).post('/api/v1/flag').set('x-auth', token).send(data)
        .end((err, res) => {
          expect(res.status).to.eq(404);
          expect(res.body.message).to.eq('The ad is not longer active. Thank you.');
          done();
        });
    });
    it('should return error 404 if the status of the ad is not equal available', (done) => {
      carsData[0].owner = usersData[1].id;
      CarModel.cars = carsData;
      UserModel.users = usersData;
      carsData[1].status = 'sold';

      const user = usersData[0];
      user.isAdmin = false;
      const token = generateToken(user.id, user.isAdmin);
      const data = {
        carId: carsData[1],
        reason: 'stolen',
        description: 'Weird description of the car by the owner',
        reportedBy: user.id,
      };
      chai.request(server).post('/api/v1/flag').set('x-auth', token).send(data)
        .end((err, res) => {
          expect(res.status).to.eq(404);
          expect(res.body.message).to.eq('The ad is not longer active. Thank you.');
          done();
        });
    });
    it('should create an extreme flag if car is flag as stolen or fake or suspicious', (done) => {
      carsData[0].owner = usersData[1].id;
      CarModel.cars = carsData;
      UserModel.users = usersData;

      const user = usersData[0];
      user.isAdmin = false;
      const token = generateToken(user.id, user.isAdmin);
      const data = {
        carId: carsData[0].id,
        reason: 'stolen',
        description: 'Weird description of the car by the owner',
        reportedBy: user.id,
      };
      chai.request(server).post('/api/v1/flag').set('x-auth', token).send(data)
        .end((err, res) => {
          expect(res.status).to.eq(200);
          expect(res.body.data.severity).to.eq('extreme');
          done();
        });
    });
  });
});
