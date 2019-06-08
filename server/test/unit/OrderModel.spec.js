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
      OrderModel.orders = ordersdata;
      ordersdata[0].sellerId = usersdata[0].id;
      ordersdata[0].status = 'completed';

      const mySoldAds = OrderModel.getSoldAdsByUser(usersdata[0].id);
      expect(mySoldAds).to.be.an('Array');
      expect(mySoldAds[0].sellerId).to.eq(usersdata[0].id);
      expect(mySoldAds[0].status).to.eq('completed');
    });
  });
  describe('All orders', () => {
    it('should return all orders placed', () => {
      OrderModel.orders = ordersdata;
      const transactions = OrderModel.getAllOrders();
      expect(transactions).to.be.an('Array');
      expect(transactions[0].id).to.eq(ordersdata[0].id);
    });
  });
  describe('Update Order status', () => {
    it('should update status for a given order', () => {
      ordersdata[0].status = 'pending';
      OrderModel.orders = ordersdata;
      const updatedOrder = OrderModel.updateOrderStatus(ordersdata[0].id, 'accepted');
      expect(updatedOrder.status).to.eq('accepted');
      expect(updatedOrder.id).to.eq(ordersdata[0].id);
    });
  });
  describe('Delete Order', () => {
    it('should delete a given flag', () => {
      OrderModel.orders = ordersdata;
      const { length } = ordersdata;
      const order = ordersdata[0];

      OrderModel.deleteOrder(order);
      const res = OrderModel.getOrder(order.id);
      expect(res).to.eq(undefined);
      expect(ordersdata.length).to.eq(length - 1);
    });
  });
});
