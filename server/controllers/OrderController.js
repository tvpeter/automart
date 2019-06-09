import CarModel from '../models/CarModel';
import UserModel from '../models/UserModel';
import OrderModel from '../models/OrderModel';
import validateData from '../lib/validateData';


const Order = {
  create(req, res) {
    req.body.buyerId = req.userId;
    const requiredParams = ['carId', 'priceOffered', 'buyerId'];
    if (validateData(requiredParams, req.body) || req.body.carId.toString().length !== 13) {
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
    const requiredParams = ['orderId', 'newPrice'];

    if (validateData(requiredParams, req.body)) {
      return res.status(400).send({
        status: 400,
        message: 'Ensure to send the order id and new price',
      });
    }
    // check that the order exist and status is still pending
    const order = OrderModel.getOrder(req.body.orderId);
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
      return res.status(404).send({
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
    const reqPerson = parseInt(req.userId, 10);
    const { status } = req.body;
    // get orderid
    const { orderId } = req.params;
    if (!orderId || !status) {
      return res.status(400).send({
        status: 400,
        message: 'Invalid input',
      });
    }
    // retrieve the order
    const order = OrderModel.getOrder(orderId);
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
    // buyer
    if (reqPerson !== parseInt(buyer.id, 10) && reqPerson !== parseInt(seller.id, 10)) {
      return res.status(403).send({
        status: 403,
        message: 'You dont have the permission to modify this resource',
      });
    }

    const buyerOptions = ['completed', 'cancelled'];
    const sellerOptions = ['accepted', 'rejected'];
    const buyerPerson = parseInt(buyer.id, 10);
    const sellerPerson = parseInt(seller.id, 10);
    let updatedOrder;

    if (reqPerson === buyerPerson && buyerOptions.includes(status)
      && sellerOptions.includes(order.status)) {
      updatedOrder = OrderModel.updateOrderStatus(orderId, status);
    } else if (reqPerson === sellerPerson && order.status.toLowerCase() === 'pending'
      && sellerOptions.includes(status)) {
      updatedOrder = OrderModel.updateOrderStatus(orderId, status);
    } else {
      return res.status(400).send({
        status: 400,
        message: 'You cannot update the status of this order at its state',
      });
    }
    return res.status(200).send({
      status: 200,
      data: updatedOrder,
    });
  },

  deleteAnOrder(req, res) {
    const order = OrderModel.getOrder(req.params.orderId);
    if (!order) {
      return res.status(404).send({
        status: 404,
        message: 'The order does not exist',
      });
    }
    const seller = parseInt(order.sellerId, 10);

    // seller can deleted a cancelled order
    const requester = parseInt(req.userId, 10);
    if (requester !== seller && !req.role) {
      return res.status(403).send({
        status: 403,
        message: 'You dont have permission to delete this resource',
      });
    }

    if (order.status.toLowerCase() !== 'cancelled' && requester === seller) {
      return res.status(400).send({
        status: 400,
        message: 'You cannot delete an incomplete transaction',
      });
    }

    const deletedOrder = OrderModel.deleteOrder(order);
    return res.status(200).send({
      status: 200,
      data: deletedOrder[0],
    });
  },
  getSingleOrder(req, res) {
    const order = OrderModel.getOrder(req.params.orderId);
    if (!order) {
      return res.status(404).send({
        status: 404,
        message: 'Order not found',
      });
    }
    const requester = parseInt(req.userId, 10);
    if ((requester !== parseInt(order.sellerId, 10)) && (requester !== parseInt(order.buyerId, 10))
      && !req.role) {
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
