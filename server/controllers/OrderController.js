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

  /**
 * status could be pending, accepted (by seller), rejected(by seller),
 * completed(buyer), cancelled(buyer)
 */
  updateOrderStatus(req, res) {
    // get orderid
    let updatedOrder;
    const { orderId, status } = req.params;
    if (!orderId || !status) {
      return res.status(400).send({
        status: 400,
        message: 'Invalid input',
      });
    }
    // retrieve the order
    const order = OrderModel.getSingleOrder(orderId);
    if (!order) {
      return res.status(404).send({
        status: 404,
        message: 'Order details not found',
      });
    }
    // check if seller and buyer are active
    const seller = UserModel.isUserActive('id', order.sellerId);
    const buyer = UserModel.isUserActive('id', order.buyerId);
    if (!seller || !buyer) {
      return res.status(406).send({
        status: 406,
        message: 'Seller or buyer inactive',
      });
    }
    if (!parseInt(req.userId, 10) === parseInt(buyer.id, 10)
      || !parseInt(req.userId, 10) === parseInt(seller.id, 10)) {
      return res.status(403).send({
        status: 403,
        message: 'You dont have the permission to modify this resource',
      });
    }
    if ((order.status === 'pending' && parseInt(req.userId, 10) === parseInt(buyer.id, 10))
      || (order.status.toLowerCase() === 'accepted' && parseInt(req.userId, 10) === parseInt(buyer.id, 10))) {
      if (status === 'cancelled' || status === 'completed') {
        updatedOrder = OrderModel.updateOrderStatus(orderId, status);
      }
    }
    // if its buyer, buyer can cancel or complete order
    if (parseInt(req.userId, 10) === (seller.id) && order.status.toLowerCase() === 'pending') {
      if (req.body.status === 'accepted' || req.body.status === 'rejected') {
        updatedOrder = OrderModel.updateOrderStatus(orderId, status);
      }
    }
    return res.status(200).send({
      status: 200,
      data: updatedOrder,
    });
  },

  deleteOrder(req, res) {
    if (!req.params.orderId || !req.userId) {
      return res.status(400).send({
        status: 400,
        message: 'Invalid request',
      });
    }

    const order = OrderModel.getSingleOrder(req.params.orderId);
    if (!order || order.status.toLowerCase() !== 'cancelled') {
      return res.status(404).send({
        status: 404,
        message: 'Order not found or uncompleted',
      });
    }

    const deletedOrder = OrderModel.deleteOrder(order);
    return res.status(200).send({
      status: 200,
      data: deletedOrder,
    });
  },
  getSingleOrder(req, res) {
    const requester = parseInt(req.userId, 10);

    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).send({
        status: 400,
        message: 'Invalid request',
      });
    }
    const order = OrderModel.getSingleOrder(orderId);
    if (!order) {
      return res.status(404).send({
        status: 404,
        message: 'Order not found',
      });
    }

    if (requester !== parseInt(order.sellerId, 10) || requester !== parseInt(order.buyerId, 10)
      || !req.role) {
      return res.status(403).send({
        status: 403,
        message: 'You dont have the permission to view this resource',
      });
    }
    return res.status(200).send({
      status: 200,
      data: order,
    });
  },
};

export default Order;
