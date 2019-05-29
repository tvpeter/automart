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
    if (cars.length < 1) {
      return res.send({
        status: 404,
        message: 'There are no cars available now. Check back',
      });
    }
    return res.send({
      status: 200,
      data: cars,
    });
  },
  getCarsByProperty(req, res) {
    const reqParam = Object.keys(req.params)[0];
    let cars;

    if (reqParam.toLowerCase() === 'manufacturer') {
      cars = CarModel.getUnsoldCarsByProperty(reqParam, req.params.manufacturer);
    } else if (reqParam.toLowerCase() === 'body_type') {
      cars = CarModel.getUnsoldCarsByProperty(reqParam, req.params.body_type);
    } else {
      cars = CarModel.getUnsoldCarsByProperty(reqParam, req.params.state);
    }


    if (cars.length < 1) {
      return res.status(404).send({
        status: 404,
        message: `There are no cars for the selected ${reqParam}`,
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
  getSingleAd(req, res) {
    if (req.params.id.trim().length !== 13) {
      return res.status(400).send({
        status: 400,
        message: 'Invalid ad id',
      });
    }
    const car = CarModel.findSingle(req.params.id);
    if (!car) {
      return res.status(404).send({
        status: 404,
        message: 'The ad you are looking for is no longer available',
      });
    }
    return res.status(200).send({
      status: 200,
      data: car,
    });
  },

  updateAdvert(req, res) {
    const car = CarModel.findSingle(req.body.id);
    if (!car) {
      res.status(404).send({
        status: 404,
        message: 'The advert you want to update is not available',
      });
    }

    const { userId, role } = req;
    if (parseInt(userId, 10) !== parseInt(car.owner, 10) && !role) {
      return res.status(401).send({
        status: 401,
        message: 'You do not have the permission to update this data',
      });
    }
    let updatedCar;
    if (parseInt(userId, 10) === parseInt(car.owner, 10)) {
      updatedCar = CarModel.completeUpdate(req.body.id, req.body);
    } else {
      updatedCar = CarModel.updateAdStatus(req.body.id, req.body);
    }
    return res.status(200).send({
      status: 200,
      data: updatedCar,
    });
  },

  getCarsWithinPriceRange(req, res) {
    const min = req.query.min ? req.query.min : 0;
    const max = req.query.max ? req.query.max : 3000000;

    const cars = CarModel.getCarsWithinPriceRange(min, max);

    if (cars.length < 1) {
      return res.status(404).send({
        status: 404,
        message: 'There are no cars within the selected range',
      });
    }

    return res.status(200).send({
      status: 200,
      data: cars,
    });
  },

};

export default Car;
