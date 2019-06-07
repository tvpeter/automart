'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _OrderModel = require('../../models/OrderModel');

var _OrderModel2 = _interopRequireDefault(_OrderModel);

var _usersData = require('../usersData');

var _usersData2 = _interopRequireDefault(_usersData);

var _carsData = require('../carsData');

var _carsData2 = _interopRequireDefault(_carsData);

var _ordersData = require('../ordersData');

var _ordersData2 = _interopRequireDefault(_ordersData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { expect } = _chai2.default;

describe('Order Model', () => {
  describe('Create order', () => {
    it('It should create a new order', () => {
      _carsData2.default[0].owner = _usersData2.default[1].id;
      const price = parseInt(_carsData2.default[0].price, 10) - 500000;
      const data = {
        buyerId: _usersData2.default[0].id,
        carId: _carsData2.default[0].id,
        price: _carsData2.default[0].price,
        priceOffered: price,
        sellerId: _usersData2.default[1].id
      };
      const newOrder = _OrderModel2.default.createOrder(data);
      expect(newOrder).to.have.property('date');
      expect(newOrder).to.have.property('priceOffered').eq(price);
      expect(newOrder.sellerId).to.eq(_usersData2.default[1].id);
    });
  });
  describe('User get his/her sold transactions', () => {
    it('should return an array of his/her sold ads', () => {
      _ordersData2.default[0].sellerId = _usersData2.default[0].id;
      _ordersData2.default[0].status = 'completed';

      const myAds = _OrderModel2.default.getSoldAdsByUser(_usersData2.default[0].id);
      expect(myAds).to.be.an('Array');
      expect(myAds[0].sellerId).to.eq(_usersData2.default[0].id);
      expect(myAds[0].status).to.eq('completed');
    });
  });
});