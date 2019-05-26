import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import CarModel from '../models/CarModel';

dotenv.config();
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const Car = {
  async  create(req, res) {
    if (!req.body.manufacturer || !req.body.state || !req.body.status || !req.body.price
      || !req.body.model || !req.body.body_type) {
      return res.status(400).send({
        status: 400,
        message: 'Fill all required fields',
      });
    }

    const owner = req.userId;
    const newCarData = {
      owner,
      state: req.body.state,
      status: req.body.status,
      price: req.body.price,
      manufacturer: req.body.manufacturer,
      model: req.body.model,
      body_type: req.body.body_type,
      description: req.body.description,
    };

    const checkInDb = CarModel.similarUserCar(owner, newCarData);
    if (checkInDb) {
      return res.status(400).send({
        status: 400,
        message: 'You have a similar unsold car',
      });
    }
    if (!req.file) {
      return res.status(400).send({
        status: 400,
        message: 'Upload images for your product',
      });
    }
    try {
      const image = await cloudinary.uploader.upload(req.file.path, {
        folder: 'automart/',
        format: 'png',
      });
      newCarData.img = image.url;

      const newCar = CarModel.createCar(newCarData);
      return res.status(201).send({
        status: 201,
        data: newCar,
      });
    } catch (err) {
      return res.status(400).send({
        status: 400,
        message: 'There\'s problem uploading your image, try again',
      });
    }
  },
  getAll(req, res) {
    const cars = CarModel.getAllCars();
    return res.send(cars);
  },
  getCarsByManufacturer(req, res) {
    const cars = CarModel.getUnsoldCarsByManufactuer(req.params.manufacturer);

    if (cars.length < 1) {
      return res.status(404).send({
        status: 404,
        message: 'There are no vehicles for the selected manufacturer',
      });
    }
    return res.status(200).send({
      status: 'success',
      data: cars,
    });
  },

  getAllUnsoldCars(req, res) {
    const cars = CarModel.getAllUnsoldCars();
    if (cars.length < 1) {
      return res.status(404).send({
        status: 404,
        message: 'There are no cars available now. Check back',
      });
    }
    return res.status(200).send({
      status: 200,
      data: cars,
    });
  },
};

export default Car;
