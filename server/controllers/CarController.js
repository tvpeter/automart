import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
// import CarModel from '../models/CarModel';
import validatenewCar from '../lib/validateData';
import db from '../services/db';

dotenv.config();
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const Car = {
  async  create(req, res) {
    // eslint-disable-next-line max-len
    const requiredFields = ['owner', 'state', 'price', 'manufacturer', 'model', 'body_type', 'description'];
    req.body.owner = req.userId;
    if (validatenewCar(requiredFields, req.body) || !req.file) {
      return Car.errorResponse(res, 400, 'Fill all required fields');
    }


    // eslint-disable-next-line max-len
    const carsByUser = 'SELECT id FROM cars WHERE owner=$1 AND state=$2 AND status=\'available\' AND manufacturer=$3 AND model=$4 AND body_type=$5';
    // eslint-disable-next-line no-multi-str
    const createQuery = 'INSERT INTO cars (id, price, description, img, owner, state, manufacturer, model, body_type) VALUES  ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *';
    try {
      // eslint-disable-next-line max-len
      const values = [req.body.owner, req.body.state, req.body.manufacturer, req.body.model, req.body.body_type];
      const { rows } = await db.query(carsByUser, values);
      if (rows.length > 0) {
        return Car.errorResponse(res, 400, 'You have a similar unsold car');
      }

      const image = await cloudinary.uploader.upload(req.file.path, { folder: 'automart/', format: 'png' });

      const carPpties = [Date.now(), req.body.price, req.body.description, image.url, ...values];
      const newCar = await db.query(createQuery, carPpties);

      return Car.successResponse(res, 201, newCar.rows[0]);
    } catch (error) {
      return Car.errorResponse(res, 500, error);
    }
  },
  async getAll(req, res) {
    // const cars = CarModel.getAllCars();
    const query = 'SELECT * FROM cars LIMIT 100';
    try {
      const { rows } = await db.query(query);
      if (rows.length < 1) {
        return Car.errorResponse(res, 200, 'There are no cars available now. Check back');
      }
      return Car.successResponse(res, 200, rows);
    } catch (err) {
      return Car.errorResponse(res, 500, err);
    }
  },

  // getCarsByProperty(req, res) {
  //   const reqParam = Object.keys(req.params)[0];
  //   let cars;

  //   switch (reqParam.toLowerCase()) {
  //     case 'manufacturer':
  //       cars = CarModel.getUnsoldCarsByProperty(reqParam, req.params.manufacturer);
  //       break;
  //     case 'body_type':
  //       cars = CarModel.getUnsoldCarsByProperty(reqParam, req.params.body_type);
  //       break;
  //     default:
  //       cars = CarModel.getUnsoldCarsByProperty(reqParam, req.params.state);
  //       break;
  //   }
  //   if (cars.length < 1) {
  //     return Car.errorResponse(res, 404, `There are no cars for the selected ${reqParam}`);
  //   }
  //   return Car.successResponse(res, 200, cars);
  // },
  // getAllUnsoldCars(req, res) {
  //   const cars = CarModel.getAllUnsoldCars();

  // eslint-disable-next-line max-len
  //   return (cars.length < 1) ? Car.errorResponse(res, 404, 'There are no cars available now. Check back')
  //     : Car.successResponse(res, 200, cars);
  // },
  // getSingleAd(req, res) {
  //   if (req.params.id.trim().length !== 13) {
  //     return Car.errorResponse(res, 400, 'Invalid ad id');
  //   }
  //   const car = CarModel.findSingle(req.params.id);
  //   if (!car) {
  //     return Car.errorResponse(res, 404, 'The ad you are looking for is no longer available');
  //   }
  //   return Car.successResponse(res, 200, car);
  // },

  // updateAdvert(req, res) {
  //   const car = CarModel.findSingle(req.body.id);
  //   if (!car) {
  //     return Car.errorResponse(res, 404, 'The advert you want to update is not available');
  //   }

  //   const { userId, role } = req;
  //   if (parseInt(userId, 10) !== parseInt(car.owner, 10) && !role) {
  //     return Car.errorResponse(res, 401, 'You do not have the permission to update this data');
  //   }
  //   const updatedCar = (parseInt(userId, 10) === parseInt(car.owner, 10))
  //     ? CarModel.completeUpdate(req.body.id, req.body)
  //     : CarModel.updateAdStatus(req.body.id, req.body);

  //   return Car.successResponse(res, 200, updatedCar);
  // },

  // getCarsWithinPriceRange(req, res) {
  //   const min = req.query.min ? req.query.min : 0;
  //   const max = req.query.max ? req.query.max : 3000000;

  //   const cars = CarModel.getCarsWithinPriceRange(min, max);

  // eslint-disable-next-line max-len
  //   return (cars.length < 1) ? Car.errorResponse(res, 404, 'There are no cars within the selected range')
  //     : Car.successResponse(res, 200, cars);
  // },

  // deleteAd(req, res) {
  //   const car = CarModel.findSingle(req.params.id);
  //   if (!car) {
  //     return Car.errorResponse(res, 404, 'The ad is no longer available');
  //   }
  //   const deleteACarAd = CarModel.deleteCar(car);
  //   if (deleteACarAd.length < 1) {
  //     return Car.errorResponse(res, 500, 'Ad not deleted, please retry');
  //   }

  //   return Car.errorResponse(res, 200, 'Ad successfully deleted');
  // },
  errorResponse(res, code, message) {
    return res.status(code).send({
      status: code,
      message,
    });
  },
  successResponse(res, code, data) {
    return res.status(code).send({
      status: code,
      data,
    });
  },
};

export default Car;
