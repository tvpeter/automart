import CarModel from '../models/CarModel';
import UserModel from '../models/UserModel';
import OrderModel from '../models/OrderModel';
import validatenewCar from '../lib/validateData';


const Order = {
  create(req, res) {
    req.body.buyerId = req.userId;
    const requiredParams = ['carId', 'priceOffered', 'buyerId'];
    if (validatenewCar(requiredParams, req.body) || req.body.carId.toString().length !== 13) {
      return res.status(400).send({
        status: 400,
        message: 'Select car and state amount you want to pay',
      });
    }
    // verify the car and its status
    const car = CarModel.carIsEligible(req.body.carId);
    if (!car) {
      return res.status(404).send({
        status: 404,
        message: 'This car is not available for purchase',
      });
    }

    const seller = UserModel.isUserActive('id', car.owner);
    if (!seller) {
      return res.status(404).send({
        status: 404,
        message: 'Unverified seller. Kindly check back',
      });
    }
    const order = OrderModel.createOrder({
      buyerId: req.body.buyerId,
      sellerId: car.owner,
      carId: req.body.carId,
      price: car.price,
      priceOffered: req.body.priceOffered,
    });
    return res.status(200).send({
      status: 200,
      data: {
        id: order.id,
        carId: req.body.carId,
        date: order.date,
        status: order.status,
        price: order.price,
        priceOffered: order.priceOffered,
        sellerId: seller.id,
        buyerId: order.buyerId,
      },
    });
  },
  updatePrice(req, res) {
    // check that req contains the new price and orderid
    if (!req.body.orderId || !req.body.newPrice) {
      return res.status(400).send({
        status: 400,
        message: 'Ensure to send the order id and new price',
      });
    }
    // check that the order exist and status is still pending
    const order = OrderModel.getSingleOrder(req.body.orderId);
    if (!order || order.status.toLowerCase() !== 'pending') {
      return res.status(404).send({
        status: 404,
        message: 'Check that the order is still pending',
      });
    }

    // check that the request is coming from the buyer
    const buyer = req.userId;

    if (parseInt(buyer, 10) !== parseInt(order.buyerId, 10)) {
      return res.status(403).send({
        status: 403,
        message: 'You dont have the permission to modify this order',
      });
    }

    // check that the new price is diff from the former
    if (parseFloat(req.body.newPrice) === parseFloat(order.priceOffered)) {
      return res.status(400).send({
        status: 400,
        message: 'The new offered price and the old are the same',
      });
    }
    // update the price and return the response
    const updatedPriceOrder = OrderModel.updateOrderPrice(req.body.orderId, req.body.newPrice);
    return res.status(200).send({
      status: 200,
      data: updatedPriceOrder,
    });
  },
  mySoldAds(req, res) {
    const { userId } = req;
    const soldAds = OrderModel.getSoldAdsByUser(userId);
    if (soldAds.length === 0) {
      return res.status(404).sepnd({
        status: 404,
        message: 'You have not sold on the platform',
      });
    }
    return res.status(200).send({
      status: 200,
      data: soldAds,
    });
  },
  getAllOrders(req, res) {
    const orders = OrderModel.getAllOrders();
    if (orders < 1) {
      return res.send({
        status: 404,
        message: 'There are no orders now. Check back',
      });
    }
    return res.send({
      status: 200,
      data: orders,
    });
  },
};

export default Order;
