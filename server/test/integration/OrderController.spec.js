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

describe('Order transaction', () => {
  describe('Create order', () => {
    it('should create an order', (done) => {
      carsData[0].owner = usersData[1].id;
      CarModel.cars = carsData;
      UserModel.users = usersData;

      const user = usersData[0];
      user.isAdmin = false;
      const token = generateToken(user.id, user.isAdmin);
      const price = parseInt(carsData[0].price, 10) - 500000;
      const data = {
        buyerId: user.id,
        carId: carsData[0].id,
        price: carsData[0].price,
        priceOffered: price,
        sellerId: usersData[1].id,
      };
      chai.request(server).post('/api/v1/order').set('x-auth', token).send(data)
        .end((err, res) => {
          expect(res.status).to.eq(200);
          expect(res.body.data).to.have.property('id');
          expect(res.body.data).to.have.property('car_id').eq(data.carId);
          expect(res.body.data.price).to.eq(data.price);
          expect(res.body.data.priceOffered).to.eq(data.priceOffered);
          expect(res.body.data.owner).to.eq(data.sellerId);
          expect(res.body.data.buyer).to.eq(data.buyerId);
          done();
        });
    });
    it('should return error 412 if carId or price is not supplied', (done) => {
      carsData[0].owner = usersData[1].id;
      CarModel.cars = carsData;
      UserModel.users = usersData;

      const user = usersData[0];
      user.isAdmin = false;
      const token = generateToken(user.id, user.isAdmin);
      const data = {
        buyerId: user.id,
        carId: carsData[0].id,
        price: carsData[0].price,
        priceOffered: '',
        sellerId: usersData[1].id,
      };
      chai.request(server).post('/api/v1/order').set('x-auth', token).send(data)
        .end((err, res) => {
          expect(res.status).to.eq(412);
          expect(res.body.message).to.eq('Select car and state amount you want to pay');
          done();
        });
    });
    it('should return error 400 if car id is invalid', (done) => {
      carsData[0].owner = usersData[1].id;
      CarModel.cars = carsData;
      UserModel.users = usersData;

      const user = usersData[0];
      user.isAdmin = false;
      const price = parseInt(carsData[0].price, 10) - 500000;
      const token = generateToken(user.id, user.isAdmin);
      const data = {
        buyerId: user.id,
        carId: 111222333444,
        price: carsData[0].price,
        priceOffered: price,
        sellerId: usersData[1].id,
      };
      chai.request(server).post('/api/v1/order').set('x-auth', token).send(data)
        .end((err, res) => {
          expect(res.status).to.eq(400);
          expect(res.body.message).to.eq('Invalid ad id');
          done();
        });
    });
    it('should return error 404 if car is not found', (done) => {
      carsData[0].owner = usersData[1].id;
      CarModel.cars = carsData;
      UserModel.users = usersData;

      const user = usersData[0];
      user.isAdmin = false;
      const price = parseInt(carsData[0].price, 10) - 500000;
      const token = generateToken(user.id, user.isAdmin);
      const data = {
        buyerId: user.id,
        carId: 1112223334445,
        price: carsData[0].price,
        priceOffered: price,
        sellerId: usersData[1].id,
      };
      chai.request(server).post('/api/v1/order').set('x-auth', token).send(data)
        .end((err, res) => {
          expect(res.status).to.eq(404);
          expect(res.body.message).to.eq('This car is no longer available');
          done();
        });
    });
    it('should return error 403 if car status is not == available', (done) => {
      carsData[0].owner = usersData[1].id;
      CarModel.cars = carsData;
      UserModel.users = usersData;

      const user = usersData[0];
      user.isAdmin = false;
      carsData[0].status = 'sold';
      const price = parseInt(carsData[0].price, 10) - 500000;
      const token = generateToken(user.id, user.isAdmin);
      const data = {
        buyerId: user.id,
        carId: carsData[0].id,
        price: carsData[0].price,
        priceOffered: price,
        sellerId: usersData[1].id,
      };
      chai.request(server).post('/api/v1/order').set('x-auth', token).send(data)
        .end((err, res) => {
          expect(res.status).to.eq(403);
          expect(res.body.message).to.eq('The car is not available for purchase now');
          done();
        });
    });
    it('should return 412 if seller is not active', (done) => {
      carsData[0].owner = usersData[1].id;
      CarModel.cars = carsData;
      UserModel.users = usersData;

      const user = usersData[0];
      user.isAdmin = false;
      usersData[1].status = 'suspended';
      carsData[0].status = 'available';
      const token = generateToken(user.id, user.isAdmin);
      const price = parseInt(carsData[0].price, 10) - 500000;
      const data = {
        buyerId: user.id,
        carId: carsData[0].id,
        price: carsData[0].price,
        priceOffered: price,
        sellerId: usersData[1].id,
      };
      chai.request(server).post('/api/v1/order').set('x-auth', token).send(data)
        .end((err, res) => {
          expect(res.status).to.eq(412);
          expect(res.body.message).to.eq('The seller is not permitted transactions');
          done();
        });
    });
    it('should return 401 if user is not logged in', (done) => {
      carsData[0].owner = usersData[1].id;
      CarModel.cars = carsData;
      UserModel.users = usersData;

      const user = usersData[0];
      user.isAdmin = false;
      const price = parseInt(carsData[0].price, 10) - 500000;
      const data = {
        buyerId: user.id,
        carId: carsData[0].id,
        price: carsData[0].price,
        priceOffered: price,
        sellerId: usersData[1].id,
      };
      chai.request(server).post('/api/v1/order').send(data)
        .end((err, res) => {
          expect(res.status).to.eq(401);
          expect(res.body.message).to.eq('No authorization token provided');
          done();
        });
    });
  });
});
