import fs from 'fs';
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
      error.owner = 'You have a similar unsold car';
      return res.status(409).send({
        message: error.owner,
        status: 'error',
        error,
      });
    }
    if (!req.file) {
      error.file = 'Upload images for your product';
      return res.status(400).send({
        status: 'error',
        message: error.file,
        error,
      });
    }
    try {
      const image = await cloudinary.uploader.upload(req.file.path, {
        folder: 'automart/',
        format: 'png',
      });
      newCarData.img = image.url;
    } catch (err) {
      error.img = err;
      return res.status(400).send({
        status: 'error',
        message: error.img,
        error,
      });
    }


    const newCar = CarModel.createCar(newCarData);
    fs.unlinkSync(req.file.path);
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
