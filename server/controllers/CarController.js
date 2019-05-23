import CarModel from '../models/CarModel';

const Car = {

  create(req, res) {
    const error = {};
    if (!req.body.manufacturer || !req.body.state || !req.body.status || !req.body.price
      || !req.body.model || !req.body.body_type) {
      error.fields = 'Fill all required fields';
      return res.status(400).send({
        status: 'error',
        message: error.fields,
        error,
      });
    }

    const owner = req.userId;
    // check if owner has the same car in db
    const newCarData = {
      owner,
      state: req.body.state,
      status: req.body.status,
      price: req.body.price,
      manufacturer: req.body.manufacturer,
      model: req.body.model,
      body_type: req.body.body_type,
      description: req.body.description,
      img: [...req.body.img],
    };

    const checkInDb = CarModel.similarUserCar(owner, newCarData);
    if (checkInDb) {
      error.owner = 'You have a similar unsold car';
      return res.status(409).send({
        message: error.owner,
        status: 'error',
        error,
      });
    }

    const newCar = CarModel.createCar(newCarData);
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
