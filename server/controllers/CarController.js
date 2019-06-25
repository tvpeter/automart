import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import validatenewCar from '../lib/validateData';
import CarService from '../services/CarService';

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
    const values = [req.body.owner, req.body.state, req.body.manufacturer, req.body.model, req.body.body_type];
    const { rows } = await CarService.getCarsByUser(values);
    if (rows.length > 0) {
      return Car.errorResponse(res, 400, 'You have a similar unsold car');
    }

    const image = await cloudinary.uploader.upload(req.file.path, { folder: 'automart/', format: 'png' });

    const carPpties = [Date.now(), req.body.price, req.body.description, image.url, ...values];
    const newCar = await CarService.createCar(carPpties);

    return Car.successResponse(res, 201, newCar.rows[0]);
  },
  async getAll(req, res) {
    const { rows } = await CarService.getAllCars();

    return (rows.length < 1) ? Car.errorResponse(res, 404, 'There are no cars available now. Check back')
      : Car.successResponse(res, 200, rows);
  },

  async getCarsByProperty(req, res) {
    const reqParam = Object.keys(req.params)[0];
    let ppty;

    switch (reqParam.toLowerCase()) {
      case 'manufacturer':
        ppty = req.params.manufacturer;
        break;
      case 'body_type':
        ppty = req.params.body_type;
        break;
      default:
        ppty = req.params.state;
        break;
    }
    const { rows } = await CarService.getCarsByProperty(reqParam, ppty);
    return (rows.length < 1) ? Car.errorResponse(res, 404, `There are no cars for the selected ${reqParam}`)
      : Car.successResponse(res, 200, rows);
  },

  async getAllUnsoldCars(req, res) {
    const { rows } = await CarService.getAllUnsoldCars();
    return (rows.length < 1) ? Car.errorResponse(res, 404, 'There are no cars available now. Check back')
      : Car.successResponse(res, 200, rows);
  },

  async getSingleAd(req, res) {
    if (req.params.id.trim().length !== 13) {
      return Car.errorResponse(res, 400, 'Invalid ad id');
    }
    const { rows } = await CarService.getSingleCar(req.params.id);
    return (rows.length < 1) ? Car.errorResponse(res, 404, 'The ad you are looking for is no longer available')
      : Car.successResponse(res, 200, rows[0]);
  },

  async updateAdvert(req, res) {
    const reqFields = ['status', 'price', 'description'];
    if (validatenewCar(reqFields, req.body)) {
      Car.errorResponse(res, 400, 'Fill all fields');
    }
    const { rows } = await CarService.getSingleCarAllPpties(req.params.id);
    if (rows.length < 1) {
      return Car.errorResponse(res, 404, 'The advert you want to update is not available');
    }

    const { userId, role } = req;
    if (parseInt(userId, 10) !== parseInt(rows[0].owner, 10) && !role) {
      return Car.errorResponse(res, 401, 'You do not have the permission to update this data');
    }

    const adminQ = [req.body.status, req.params.id];
    const data = [req.body.price, req.body.description, ...adminQ];
    const result = (parseInt(userId, 10) === parseInt(rows[0].owner, 10))
      ? await CarService.updateBySeller(data)
      : await CarService.updateByAdmin(adminQ);

    return Car.successResponse(res, 200, result.rows[0]);
  },

  async getCarsWithinPriceRange(req, res) {
    const min = req.query.min ? req.query.min : 0;
    const max = req.query.max ? req.query.max : 30000000;

    const { rows } = await CarService.getCarsInRange(min, max);
    return (rows.length < 1) ? Car.errorResponse(res, 404, 'There are no cars within the selected range')
      : Car.successResponse(res, 200, rows);
  },

  async deleteAd(req, res) {
    if (req.params.id.trim().length !== 13) {
      return Car.errorResponse(res, 400, 'Select the ad to delete');
    }
    const { rows } = await CarService.deleteCar(req.params.id);
    return (rows.length < 1) ? Car.errorResponse(res, 404, 'Selected ad not available')
      : Car.successResponse(res, 200, rows[0]);
  },

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
