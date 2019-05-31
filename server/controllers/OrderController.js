import CarModel from '../models/CarModel';
import UserModel from '../models/UserModel';
import OrderModel from '../models/OrderModel';

const Order = {
  create(req, res) {
    if (!req.body.carId || !req.body.priceOffered) {
      return res.status(412).send({
        status: 412,
        message: 'Select car and state amount you want to pay',
      });
    }
    // check whether the car id is valid
    if (req.body.carId.toString().length !== 13) {
      return res.status(400).send({
        status: 400,
        message: 'Invalid ad id',
      });
    }

    // verify the car and its status
    const car = CarModel.findSingle(req.body.carId);
    if (!car) {
      return res.status(404).send({
        status: 404,
        message: 'This car is no longer available',
      });
    }

    if (car.status.toLowerCase() !== 'available') {
      return res.status(403).send({
        status: 403,
        message: 'The car is not available for purchase now',
      });
    }
    const buyerId = req.userId;


    // checks if the user is active
    const seller = UserModel.getUser(car.owner);
    if (!seller) {
      return res.status(404).send({
        status: 404,
        message: 'Unverified seller. Kindly check back',
      });
    }
    if (seller.status !== 'active') {
      return res.status(412).send({
        status: 412,
        message: 'The seller is not permitted transactions',
      });
    }
    const order = OrderModel.createOrder({
      buyerId,
      carId: req.body.carId,
      price: car.price,
      priceOffered: req.body.priceOffered,
    });
    return res.status(200).send({
      status: 200,
      data: {
        id: order.id,
        car_id: req.body.carId,
        created_on: order.date,
        status: order.status,
        price: order.price,
        priceOffered: order.priceOffered,
        owner: seller.id,
        buyer: buyerId,
      },
    });
  },
};

export default Order;
