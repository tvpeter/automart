import OrderModel from '../models/OrderModel';
import validateData from '../lib/validateData';
import db from '../services/db';


const Order = {
  async create(req, res) {
    req.body.buyerId = req.userId;
    const requiredParams = ['carId', 'priceOffered', 'buyerId'];
    if (validateData(requiredParams, req.body) || req.body.carId.toString().length !== 13) {
      return Order.errorResponse(res, 400, 'Select car and state amount you want to pay');
    }
    const query = `select cars.id, cars.status carstatus, cars.price, cars.owner, users.status sellerstatus from cars inner join users on cars.owner=users.id where cars.id=${req.body.carId}`;
    try {
      const { rows } = await db.query(query);
      if (rows[0].carstatus.toLowerCase() !== 'available' || rows[0].sellerstatus.toLowerCase() !== 'active' || parseInt(rows[0].owner, 10) === parseInt(req.userId, 10)) {
        return Order.errorResponse(res, 400, 'The car is not available or the seller is not active. Check back');
      }

      // check that the buyer doesn't have the order in pending, accepted or completed state
      const checkOrderInDb = `SELECT id FROM orders WHERE carid=${req.body.carId} AND buyerid=${req.body.buyerId} AND status NOT IN ('rejected', 'cancelled')`;

      const noInDb = await db.query(checkOrderInDb);
      if (noInDb.rows.length > 0) {
        return Order.errorResponse(res, 400, 'You have a similar uncompleted/completed order ');
      }

      const text = 'INSERT INTO orders (id, buyerid, carid, sellerid, price, priceoffered) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
      // eslint-disable-next-line max-len
      const values = [Date.now(), req.userId, req.body.carId, rows[0].owner, rows[0].price, req.body.priceOffered];

      const result = await db.query(text, values);
      return Order.successResponse(res, 201, result.rows[0]);
    } catch (err) {
      return Order.errorResponse(res, 500, err);
    }
  },
  updatePrice(req, res) {
    const requiredParams = ['orderId', 'newPrice'];

    if (validateData(requiredParams, req.body)) {
      return Order.errorResponse(res, 400, 'Ensure to send the order id and new price');
    }
    // check that the order exist and status is still pending
    const order = OrderModel.getOrder(req.body.orderId);
    if (!order || order.status.toLowerCase() !== 'pending') {
      return Order.errorResponse(res, 404, 'Check that the order is still pending');
    }
    // check that the request is coming from the buyer
    const buyer = req.userId;

    if (parseInt(buyer, 10) !== parseInt(order.buyerId, 10)) {
      return Order.errorResponse(res, 403, 'You dont have the permission to modify this order');
    }

    // check that the new price is diff from the former
    if (parseFloat(req.body.newPrice) === parseFloat(order.priceOffered)) {
      return Order.errorResponse(res, 400, 'The new offered price and the old are the same');
    }
    // update the price and return the response
    const updatedPriceOrder = OrderModel.updateOrderPrice(req.body.orderId, req.body.newPrice);
    return Order.successResponse(res, 200, updatedPriceOrder);
  },
  mySoldAds(req, res) {
    const { userId } = req;
    const soldAds = OrderModel.getSoldAdsByUser(userId);
    if (soldAds.length === 0) {
      return Order.errorResponse(res, 404, 'You have not sold on the platform');
    }
    return res.status(200).send({
      status: 200,
      data: soldAds,
    });
  },
  getAllOrders(req, res) {
    const orders = OrderModel.getAllOrders();
    if (orders < 1) {
      return Order.errorResponse(res, 404, 'There are no orders now. Check back');
    }
    return Order.successResponse(res, 200, orders);
  },

  /**
 * status could be pending, accepted (by seller), rejected(by seller),
 * completed(buyer), cancelled(buyer)
 */
  // updateOrderStatus(req, res) {
  //   const reqPerson = parseInt(req.userId, 10);
  //   const { status } = req.body;
  //   // get orderid
  //   const { orderId } = req.params;
  //   if (!orderId || !status) {
  //     return Order.errorResponse(res, 400, 'Invalid input');
  //   }
  //   // retrieve the order
  //   const order = OrderModel.getOrder(orderId);
  //   if (!order) {
  //     return Order.errorResponse(res, 404, 'Order details not found');
  //   }
  //   // check if seller and buyer are active
  //   const seller = UserModel.isUserActive('id', order.sellerId);
  //   const buyer = UserModel.isUserActive('id', order.buyerId);
  //   if (!seller || !buyer) {
  //     return Order.errorResponse(res, 406, 'Seller or buyer inactive');
  //   }
  //   // buyer
  //   if (reqPerson !== parseInt(buyer.id, 10) && reqPerson !== parseInt(seller.id, 10)) {
  // eslint-disable-next-line max-len
  //     return Order.errorResponse(res, 403, 'You dont have the permission to modify this resource');
  //   }

  //   const buyerOptions = ['completed', 'cancelled'];
  //   const sellerOptions = ['accepted', 'rejected'];
  //   const buyerPerson = parseInt(buyer.id, 10);
  //   const sellerPerson = parseInt(seller.id, 10);
  //   let updatedOrder;

  //   if (reqPerson === buyerPerson && buyerOptions.includes(status)
  //     && sellerOptions.includes(order.status)) {
  //     updatedOrder = OrderModel.updateOrderStatus(orderId, status);
  //   } else if (reqPerson === sellerPerson && order.status.toLowerCase() === 'pending'
  //     && sellerOptions.includes(status)) {
  //     updatedOrder = OrderModel.updateOrderStatus(orderId, status);
  //   } else {
  // eslint-disable-next-line max-len
  //     return Order.errorResponse(res, 400, 'You cannot update the status of this order at its state');
  //   }

  //   return Order.successResponse(res, 200, updatedOrder);
  // },

  deleteAnOrder(req, res) {
    const order = OrderModel.getOrder(req.params.orderId);
    if (!order) {
      return Order.errorResponse(res, 404, 'The order does not exist');
    }
    const seller = parseInt(order.sellerId, 10);

    // seller can deleted a cancelled order
    const requester = parseInt(req.userId, 10);
    if (requester !== seller && !req.role) {
      return Order.errorResponse(res, 403, 'You dont have permission to delete this resource');
    }

    if (order.status.toLowerCase() !== 'cancelled' && requester === seller) {
      return Order.errorResponse(res, 400, 'You cannot delete an incomplete transaction');
    }

    const deletedOrder = OrderModel.deleteOrder(order);

    return Order.successResponse(res, 200, deletedOrder[0]);
  },
  getSingleOrder(req, res) {
    const order = OrderModel.getOrder(req.params.orderId);
    if (!order) {
      return Order.errorResponse(res, 404, 'Order not found');
    }
    const requester = parseInt(req.userId, 10);
    if ((requester !== parseInt(order.sellerId, 10)) && (requester !== parseInt(order.buyerId, 10))
      && !req.role) {
      return Order.errorResponse(res, 403, 'You dont have the permission to view this resource');
    }

    return Order.successResponse(res, 200, order);
  },

  errorResponse(res, statuscode, msg) {
    return res.status(statuscode).send({
      status: statuscode,
      message: msg,
    });
  },
  successResponse(res, statuscode, data) {
    return res.status(statuscode).send({
      status: statuscode,
      data,
    });
  },
};

export default Order;
