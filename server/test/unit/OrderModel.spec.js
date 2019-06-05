import chai from 'chai';
import OrderModel from '../../models/OrderModel';
import usersdata from '../usersData';
import carsdata from '../carsData';
import ordersdata from '../ordersData';


const { expect } = chai;

describe('Order Model', () => {
  describe('Create order', () => {
    it('It should create a new order', () => {
      carsdata[0].owner = usersdata[1].id;
      const price = parseInt(carsdata[0].price, 10) - 500000;
      const data = {
        buyerId: usersdata[0].id,
        carId: carsdata[0].id,
        price: carsdata[0].price,
        priceOffered: price,
        sellerId: usersdata[1].id,
      };
      const newOrder = OrderModel.createOrder(data);
      expect(newOrder).to.have.property('date');
      expect(newOrder).to.have.property('priceOffered').eq(price);
      expect(newOrder.sellerId).to.eq(usersdata[1].id);
    });
  });
  describe('User get his/her sold transactions', () => {
    it('should return an array of his/her sold ads', () => {
      ordersdata[0].sellerId = usersdata[0].id;
      ordersdata[0].status = 'completed';

      const myAds = OrderModel.getSoldAdsByUser(usersdata[0].id);
      expect(myAds).to.be.an('Array');
      expect(myAds[0].sellerId).to.eq(usersdata[0].id);
      expect(myAds[0].status).to.eq('completed');
    });
  });
});
