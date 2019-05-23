import CarModel from '../models/CarModel';

const Car = {

  create(req, res) {
    const owner = req.userId;
    const newCar = CarModel.createCar({
      owner,
      state: req.body.state,
      status: req.body.status,
      price: req.body.price,
      manufacturer: req.body.manufacturer,
      model: req.body.model,
      body_type: req.body.body_type,
      description: req.body.description,
      img: [...req.body.img],
    });
    return res.status(201).send({
      status: 'success',
      newCar,
    });
  },
  getAll(req, res) {
    const cars = CarModel.getAllCars();
    return res.send(cars);
  },

};

export default Car;
