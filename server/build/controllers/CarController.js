'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cloudinary = require('cloudinary');

var _cloudinary2 = _interopRequireDefault(_cloudinary);

var _dotenv = require('dotenv');

var _dotenv2 = _interopRequireDefault(_dotenv);

var _CarModel = require('../models/CarModel');

var _CarModel2 = _interopRequireDefault(_CarModel);

var _validateData = require('../lib/validateData');

var _validateData2 = _interopRequireDefault(_validateData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.config();
_cloudinary2.default.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_SECRET
});

const Car = {
  async create(req, res) {
    const requiredFields = ['owner', 'state', 'status', 'price', 'manufacturer', 'model', 'body_type', 'description'];
    req.body.owner = req.userId;
    if ((0, _validateData2.default)(requiredFields, req.body) || !req.file) {
      return res.status(400).send({
        status: 400,
        message: 'Fill all required fields'
      });
    }

    const checkInDb = _CarModel2.default.similarUserCar(req.body.owner, req.body);
    if (checkInDb) {
      return res.status(400).send({
        status: 400,
        message: 'You have a similar unsold car'
      });
    }
    try {
      const image = await _cloudinary2.default.uploader.upload(req.file.path, {
        folder: 'automart/',
        format: 'png'
      });
      req.body.img = image.url;
      const newCar = _CarModel2.default.createCar(req.body);
      return res.status(201).send({
        status: 201,
        data: newCar
      });
    } catch (err) {
      return res.status(500).send({
        status: 500,
        message: 'There\'s problem uploading your image, try again'
      });
    }
  },
  getAll(req, res) {
    const cars = _CarModel2.default.getAllCars();
    if (cars.length < 1) {
      return res.send({
        status: 404,
        message: 'There are no cars available now. Check back'
      });
    }
    return res.send({
      status: 200,
      data: cars
    });
  },
  getCarsByProperty(req, res) {
    const reqParam = Object.keys(req.params)[0];
    let cars;

    if (reqParam.toLowerCase() === 'manufacturer') {
      cars = _CarModel2.default.getUnsoldCarsByProperty(reqParam, req.params.manufacturer);
    } else if (reqParam.toLowerCase() === 'body_type') {
      cars = _CarModel2.default.getUnsoldCarsByProperty(reqParam, req.params.body_type);
    } else {
      cars = _CarModel2.default.getUnsoldCarsByProperty(reqParam, req.params.state);
    }

    if (cars.length < 1) {
      return res.status(404).send({
        status: 404,
        message: `There are no cars for the selected ${reqParam}`
      });
    }
    return res.status(200).send({
      status: 'success',
      data: cars
    });
  },
  getAllUnsoldCars(req, res) {
    const cars = _CarModel2.default.getAllUnsoldCars();
    if (cars.length < 1) {
      return res.status(404).send({
        status: 404,
        message: 'There are no cars available now. Check back'
      });
    }
    return res.status(200).send({
      status: 200,
      data: cars
    });
  },
  getSingleAd(req, res) {
    if (req.params.id.trim().length !== 13) {
      return res.status(400).send({
        status: 400,
        message: 'Invalid ad id'
      });
    }
    const car = _CarModel2.default.findSingle(req.params.id);
    if (!car) {
      return res.status(404).send({
        status: 404,
        message: 'The ad you are looking for is no longer available'
      });
    }
    return res.status(200).send({
      status: 200,
      data: car
    });
  },

  updateAdvert(req, res) {
    const car = _CarModel2.default.findSingle(req.body.id);
    if (!car) {
      return res.status(404).send({
        status: 404,
        message: 'The advert you want to update is not available'
      });
    }

    const { userId, role } = req;
    if (parseInt(userId, 10) !== parseInt(car.owner, 10) && !role) {
      return res.status(401).send({
        status: 401,
        message: 'You do not have the permission to update this data'
      });
    }
    const updatedCar = parseInt(userId, 10) === parseInt(car.owner, 10) ? _CarModel2.default.completeUpdate(req.body.id, req.body) : _CarModel2.default.updateAdStatus(req.body.id, req.body);

    return res.status(200).send({
      status: 200,
      data: updatedCar
    });
  },

  getCarsWithinPriceRange(req, res) {
    const min = req.query.min ? req.query.min : 0;
    const max = req.query.max ? req.query.max : 3000000;

    const cars = _CarModel2.default.getCarsWithinPriceRange(min, max);

    if (cars.length < 1) {
      return res.status(404).send({
        status: 404,
        message: 'There are no cars within the selected range'
      });
    }

    return res.status(200).send({
      status: 200,
      data: cars
    });
  },

  deleteAd(req, res) {
    const car = _CarModel2.default.findSingle(req.params.id);
    if (!car) {
      return res.status(404).send({
        status: 404,
        message: 'The ad is no longer available'
      });
    }
    const deleteACarAd = _CarModel2.default.deleteCar(car);
    if (deleteACarAd.length < 1) {
      return res.status(500).send({
        status: 500,
        message: 'Ad not deleted, please retry'
      });
    }

    return res.status(200).send({
      status: 200,
      message: 'Ad successfully deleted'
    });
  }
};

exports.default = Car;