import chai from 'chai';
import OrderModel from '../../models/OrderModel';
import usersdata from '../usersData';
import carsdata from '../carsData';


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
});
