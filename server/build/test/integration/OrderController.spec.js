'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _chaiHttp = require('chai-http');

var _chaiHttp2 = _interopRequireDefault(_chaiHttp);

var _carsData = require('../carsData');

var _carsData2 = _interopRequireDefault(_carsData);

var _index = require('../../index');

var _index2 = _interopRequireDefault(_index);

var _CarModel = require('../../models/CarModel');

var _CarModel2 = _interopRequireDefault(_CarModel);

var _UserModel = require('../../models/UserModel');

var _UserModel2 = _interopRequireDefault(_UserModel);

var _generateToken = require('../../lib/generateToken');

var _generateToken2 = _interopRequireDefault(_generateToken);

var _usersData = require('../usersData');

var _usersData2 = _interopRequireDefault(_usersData);

var _ordersData = require('../ordersData');

var _ordersData2 = _interopRequireDefault(_ordersData);

var _OrderModel = require('../../models/OrderModel');

var _OrderModel2 = _interopRequireDefault(_OrderModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { expect } = _chai2.default;
_chai2.default.use(_chaiHttp2.default);

describe('Order transaction', () => {
  describe('Create order', () => {
    it('should create an order', done => {
      _carsData2.default[0].owner = _usersData2.default[1].id;
      _CarModel2.default.cars = _carsData2.default;
      _UserModel2.default.users = _usersData2.default;

      const user = _usersData2.default[0];
      user.isAdmin = false;
      const token = (0, _generateToken2.default)(user.id, user.isAdmin);
      const price = parseInt(_carsData2.default[0].price, 10) - 500000;
      const data = {
        buyerId: user.id,
        carId: _carsData2.default[0].id,
        price: _carsData2.default[0].price,
        priceOffered: price,
        sellerId: _usersData2.default[1].id
      };
      _chai2.default.request(_index2.default).post('/api/v1/order').set('x-auth', token).send(data).end((err, res) => {
        expect(res.status).to.eq(200);
        expect(res.body.data).to.have.property('id');
        expect(res.body.data).to.have.property('carId').eq(data.carId);
        expect(res.body.data.price).to.eq(data.price);
        expect(res.body.data.priceOffered).to.eq(data.priceOffered);
        expect(res.body.data.sellerId).to.eq(data.sellerId);
        expect(res.body.data.buyerId).to.eq(data.buyerId);
        done();
      });
    });
    it('should return error 400 if carId or price is not supplied', done => {
      _carsData2.default[0].owner = _usersData2.default[1].id;
      _CarModel2.default.cars = _carsData2.default;
      _UserModel2.default.users = _usersData2.default;

      const user = _usersData2.default[0];
      user.isAdmin = false;
      const token = (0, _generateToken2.default)(user.id, user.isAdmin);
      const data = {
        buyerId: user.id,
        carId: _carsData2.default[0].id,
        price: _carsData2.default[0].price,
        priceOffered: '',
        sellerId: _usersData2.default[1].id
      };
      _chai2.default.request(_index2.default).post('/api/v1/order').set('x-auth', token).send(data).end((err, res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.eq('Select car and state amount you want to pay');
        done();
      });
    });
    it('should return error 400 if car id is invalid', done => {
      _carsData2.default[0].owner = _usersData2.default[1].id;
      _CarModel2.default.cars = _carsData2.default;
      _UserModel2.default.users = _usersData2.default;

      const user = _usersData2.default[0];
      user.isAdmin = false;
      const price = parseInt(_carsData2.default[0].price, 10) - 500000;
      const token = (0, _generateToken2.default)(user.id, user.isAdmin);
      const data = {
        buyerId: user.id,
        carId: 111222333444,
        price: _carsData2.default[0].price,
        priceOffered: price,
        sellerId: _usersData2.default[1].id
      };
      _chai2.default.request(_index2.default).post('/api/v1/order').set('x-auth', token).send(data).end((err, res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.eq('Select car and state amount you want to pay');
        done();
      });
    });
    it('should return error 404 if car is not found', done => {
      _carsData2.default[0].owner = _usersData2.default[1].id;
      _CarModel2.default.cars = _carsData2.default;
      _UserModel2.default.users = _usersData2.default;

      const user = _usersData2.default[0];
      user.isAdmin = false;
      const price = parseInt(_carsData2.default[0].price, 10) - 500000;
      const token = (0, _generateToken2.default)(user.id, user.isAdmin);
      const data = {
        buyerId: user.id,
        carId: 1112223334445,
        price: _carsData2.default[0].price,
        priceOffered: price,
        sellerId: _usersData2.default[1].id
      };
      _chai2.default.request(_index2.default).post('/api/v1/order').set('x-auth', token).send(data).end((err, res) => {
        expect(res.status).to.eq(404);
        expect(res.body.message).to.eq('This car is not available for purchase');
        done();
      });
    });
    it('should return error 404 if car status is not == available', done => {
      _carsData2.default[0].owner = _usersData2.default[1].id;
      _CarModel2.default.cars = _carsData2.default;
      _UserModel2.default.users = _usersData2.default;

      const user = _usersData2.default[0];
      user.isAdmin = false;
      _carsData2.default[0].status = 'sold';
      const price = parseInt(_carsData2.default[0].price, 10) - 500000;
      const token = (0, _generateToken2.default)(user.id, user.isAdmin);
      const data = {
        buyerId: user.id,
        carId: _carsData2.default[0].id,
        price: _carsData2.default[0].price,
        priceOffered: price,
        sellerId: _usersData2.default[1].id
      };
      _chai2.default.request(_index2.default).post('/api/v1/order').set('x-auth', token).send(data).end((err, res) => {
        expect(res.status).to.eq(404);
        expect(res.body.message).to.eq('This car is not available for purchase');
        done();
      });
    });
    it('should return 404 if seller is not active', done => {
      _carsData2.default[0].owner = _usersData2.default[1].id;
      _CarModel2.default.cars = _carsData2.default;
      _UserModel2.default.users = _usersData2.default;

      const user = _usersData2.default[0];
      user.isAdmin = false;
      _usersData2.default[1].status = 'suspended';
      _carsData2.default[0].status = 'available';
      const token = (0, _generateToken2.default)(user.id, user.isAdmin);
      const price = parseInt(_carsData2.default[0].price, 10) - 500000;
      const data = {
        buyerId: user.id,
        carId: _carsData2.default[0].id,
        price: _carsData2.default[0].price,
        priceOffered: price,
        sellerId: _usersData2.default[1].id
      };
      _chai2.default.request(_index2.default).post('/api/v1/order').set('x-auth', token).send(data).end((err, res) => {
        expect(res.status).to.eq(404);
        expect(res.body.message).to.eq('Unverified seller. Kindly check back');
        done();
      });
    });
    it('should return 401 if user is not logged in', done => {
      _carsData2.default[0].owner = _usersData2.default[1].id;
      _CarModel2.default.cars = _carsData2.default;
      _UserModel2.default.users = _usersData2.default;

      const user = _usersData2.default[0];
      user.isAdmin = false;
      const price = parseInt(_carsData2.default[0].price, 10) - 500000;
      const data = {
        buyerId: user.id,
        carId: _carsData2.default[0].id,
        price: _carsData2.default[0].price,
        priceOffered: price,
        sellerId: _usersData2.default[1].id
      };
      _chai2.default.request(_index2.default).post('/api/v1/order').send(data).end((err, res) => {
        expect(res.status).to.eq(401);
        expect(res.body.message).to.eq('No authorization token provided');
        done();
      });
    });
  });
  describe('Seller update order price while status is still pending', () => {
    it('should update the price ', done => {
      _UserModel2.default.users = _usersData2.default;
      _OrderModel2.default.orders = _ordersData2.default;
      const user = _usersData2.default[0];
      _ordersData2.default[0].sellerId = user.id;
      _ordersData2.default[0].status = 'pending';
      _ordersData2.default[0].buyerId = _usersData2.default[0].id;

      user.isAdmin = false;
      const token = (0, _generateToken2.default)(user.id, user.isAdmin);
      const newPrice = parseInt(_ordersData2.default[0].price, 10) - 100000;
      const data = {
        orderId: _ordersData2.default[0].id,
        newPrice
      };
      _chai2.default.request(_index2.default).patch('/api/v1/order').set('x-auth', token).send(data).end((err, res) => {
        expect(res.status).to.eq(200);
        expect(res.body.data.priceOffered).to.eq(data.newPrice);
        expect(res.body.data.buyerId).to.eq(user.id);
        done();
      });
    });
    it('should return error 400 if newprice is not stated ', done => {
      _carsData2.default[0].owner = _usersData2.default[1].id;
      _CarModel2.default.cars = _carsData2.default;
      _UserModel2.default.users = _usersData2.default;
      _OrderModel2.default.orders = _ordersData2.default;
      const user = _usersData2.default[0];
      _ordersData2.default[0].buyerId = user.id;

      user.isAdmin = false;
      const token = (0, _generateToken2.default)(user.id, user.isAdmin);
      const data = {
        orderId: _ordersData2.default[0].id,
        newPrice: ''
      };
      _chai2.default.request(_index2.default).patch('/api/v1/order').set('x-auth', token).send(data).end((err, res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.eq('Ensure to send the order id and new price');
        done();
      });
    });
    it('should return error 400 if order id is not supplied ', done => {
      _carsData2.default[0].owner = _usersData2.default[1].id;
      _CarModel2.default.cars = _carsData2.default;
      _UserModel2.default.users = _usersData2.default;
      _OrderModel2.default.orders = _ordersData2.default;
      const user = _usersData2.default[0];
      _ordersData2.default[0].buyerId = user.id;

      user.isAdmin = false;
      const newPrice = parseInt(_ordersData2.default[0].price, 10);
      const token = (0, _generateToken2.default)(user.id, user.isAdmin);
      const data = {
        orderId: '',
        newPrice
      };
      _chai2.default.request(_index2.default).patch('/api/v1/order').set('x-auth', token).send(data).end((err, res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.eq('Ensure to send the order id and new price');
        done();
      });
    });
    it('should return error 404 if order is not found', done => {
      _carsData2.default[0].owner = _usersData2.default[1].id;
      _CarModel2.default.cars = _carsData2.default;
      _UserModel2.default.users = _usersData2.default;
      _OrderModel2.default.orders = _ordersData2.default;
      const user = _usersData2.default[0];
      _ordersData2.default[0].buyerId = user.id;

      user.isAdmin = false;
      const newPrice = parseInt(_ordersData2.default[0].price, 10);
      const token = (0, _generateToken2.default)(user.id, user.isAdmin);
      const data = {
        orderId: '6667778889990',
        newPrice
      };
      _chai2.default.request(_index2.default).patch('/api/v1/order').set('x-auth', token).send(data).end((err, res) => {
        // eslint-disable-next-line no-unused-expressions
        expect(err).to.be.null;
        expect(res.status).to.eq(404);
        expect(res.body.message).to.eq('Check that the order is still pending');
        done();
      });
    });
    it('should return error 404 if order is no longer pending', done => {
      _carsData2.default[0].owner = _usersData2.default[1].id;
      _CarModel2.default.cars = _carsData2.default;
      _UserModel2.default.users = _usersData2.default;
      _OrderModel2.default.orders = _ordersData2.default;
      const user = _usersData2.default[0];
      _ordersData2.default[0].buyerId = user.id;

      user.isAdmin = false;
      const newPrice = parseInt(_ordersData2.default[0].price, 10);
      const token = (0, _generateToken2.default)(user.id, user.isAdmin);
      _ordersData2.default[0].status = 'Rejected';
      const data = {
        orderId: _ordersData2.default[0].id,
        newPrice
      };
      _chai2.default.request(_index2.default).patch('/api/v1/order').set('x-auth', token).send(data).end((err, res) => {
        // eslint-disable-next-line no-unused-expressions
        expect(err).to.be.null;
        expect(res.status).to.eq(404);
        expect(res.body.message).to.eq('Check that the order is still pending');
        done();
      });
    });
    it('should return error 400 if old and new prices are the same ', done => {
      _carsData2.default[0].owner = _usersData2.default[1].id;
      _CarModel2.default.cars = _carsData2.default;
      _UserModel2.default.users = _usersData2.default;
      _OrderModel2.default.orders = _ordersData2.default;
      const user = _usersData2.default[0];

      user.isAdmin = false;
      _ordersData2.default[0].status = 'pending';
      const token = (0, _generateToken2.default)(user.id, user.isAdmin);
      const data = {
        orderId: _ordersData2.default[0].id,
        newPrice: _ordersData2.default[0].priceOffered
      };
      _chai2.default.request(_index2.default).patch('/api/v1/order').set('x-auth', token).send(data).end((err, res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.eq('The new offered price and the old are the same');
        done();
      });
    });
  });
  describe('User get his/her sold ads', () => {
    it('should return an array of the users sold ads', done => {
      _ordersData2.default[0].sellerId = _usersData2.default[0].id;
      _ordersData2.default[0].status = 'completed';
      _UserModel2.default.users = _usersData2.default;
      _OrderModel2.default.orders = _ordersData2.default;
      const user = _usersData2.default[0];

      user.isAdmin = false;
      const token = (0, _generateToken2.default)(user.id, user.isAdmin);

      _chai2.default.request(_index2.default).get('/api/v1/transactions/sold').set('x-auth', token).end((err, res) => {
        expect(res.status).to.eq(200);
        expect(res.body.data).to.be.an('Array');
        expect(res.body.data[0]).to.have.property('sellerId').eq(user.id);
        expect(res.body.data[0]).to.have.property('status').eq('completed');
        done();
      });
    });
    it('should return error 404 if user has not sold on the platform', done => {
      _ordersData2.default[0].sellerId = _usersData2.default[1].id;
      _UserModel2.default.users = _usersData2.default;
      const user = _usersData2.default[0];

      user.isAdmin = false;
      const token = (0, _generateToken2.default)(user.id, user.isAdmin);

      _chai2.default.request(_index2.default).get('/api/v1/transactions/sold').set('x-auth', token).end((err, res) => {
        expect(res.status).to.eq(404);
        expect(res.body.message).to.eq('You have not sold on the platform');
        done();
      });
    });
    it('should return error 401 if user is not logged in', done => {
      _UserModel2.default.users = _usersData2.default;
      _OrderModel2.default.orders = _ordersData2.default;

      _chai2.default.request(_index2.default).get('/api/v1/transactions/sold').end((err, res) => {
        expect(res.status).to.eq(401);
        expect(res.body.message).to.eq('No authorization token provided');
        done();
      });
    });
  });
});