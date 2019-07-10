import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import validatenewCar from '../lib/validateData';
import CarService from '../services/CarService';
import util from '../lib/Util';

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
      return util.sendError(res, 400, 'Fill all required fields');
    }

    // eslint-disable-next-line max-len
    const values = [req.body.owner, req.body.state, req.body.manufacturer, req.body.model, req.body.body_type];
    try {
      const { rows } = await CarService.getCarsByUser(values);
      if (rows.length > 0) {
        return util.sendError(res, 400, 'You have a similar unsold car');
      }

      const image = await cloudinary.uploader.upload(req.file.path, { folder: 'automart/', format: 'png' });

      const carPpties = [Date.now(), req.body.price, req.body.description, image.url, ...values];
      const newCar = await CarService.createCar(carPpties);

      return util.sendSuccess(res, 201, newCar.rows[0]);
    } catch (error) {
      return util.sendError(res, 500, error.message);
    }
  },
  async getAll(req, res) {
    try {
      const { rows } = await CarService.getAllCars();

      return (rows.length < 1) ? util.sendError(res, 404, 'There are no cars available now. Check back')
        : util.sendSuccess(res, 200, rows);
    } catch (error) {
      return util.sendError(res, 500, error.message);
    }
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
    try {
      const { rows } = await CarService.getCarsByProperty(reqParam, ppty);
      return (rows.length < 1) ? util.sendError(res, 404, `There are no cars for the selected ${reqParam}`)
        : util.sendSuccess(res, 200, rows);
    } catch (error) {
      return util.sendError(res, 500, error.message);
    }
  },

  async getAllUnsoldCars(req, res) {
    try {
      const { rows } = await CarService.getAllUnsoldCars();
      return (rows.length < 1) ? util.sendError(res, 404, 'There are no cars available now. Check back')
        : util.sendSuccess(res, 200, rows);
    } catch (error) {
      return util.sendError(res, 500, error.message);
    }
  },

  async getSingleAd(req, res) {
    if (req.params.id.trim().length !== 13) {
      return util.sendError(res, 400, 'Invalid ad id');
    }
    try {
      const { rows } = await CarService.getSingleCar(req.params.id);
      return (rows.length < 1) ? util.sendError(res, 404, 'The ad you are looking for is no longer available')
        : util.sendSuccess(res, 200, rows[0]);
    } catch (error) {
      return util.sendError(res, 500, error.message);
    }
  },

  async updateAdvert(req, res) {
    const reqFields = ['status', 'price', 'description'];
    if (validatenewCar(reqFields, req.body)) {
      util.sendError(res, 400, 'Fill all fields');
    }
    try {
      const { rows } = await CarService.getSingleCarAllPpties(req.params.id);
      if (rows.length < 1) {
        return util.sendError(res, 404, 'The advert you want to update is not available');
      }

      const { userId, role } = req;
      if (parseInt(userId, 10) !== parseInt(rows[0].owner, 10) && !role) {
        return util.sendError(res, 401, 'You do not have the permission to update this data');
      }

      const adminQ = [req.body.status, req.params.id];
      const data = [req.body.price, req.body.description, ...adminQ];
      const result = (parseInt(userId, 10) === parseInt(rows[0].owner, 10))
        ? await CarService.updateBySeller(data)
        : await CarService.updateByAdmin(adminQ);

      return util.sendSuccess(res, 200, result.rows[0]);
    } catch (error) {
      return util.sendError(res, 500, error.message);
    }
  },

  async getCarsWithinPriceRange(req, res) {
    const min = req.query.min ? req.query.min : 0;
    const max = req.query.max ? req.query.max : 30000000;
    try {
      const { rows } = await CarService.getCarsInRange(min, max);
      return (rows.length < 1) ? util.sendError(res, 404, 'There are no cars within the selected range')
        : util.sendSuccess(res, 200, rows);
    } catch (error) {
      return util.sendError(res, 500, error.message);
    }
  },

  async deleteAd(req, res) {
    if (req.params.id.trim().length !== 13) {
      return util.sendError(res, 400, 'Select the ad to delete');
    }
    try {
      const { rows } = await CarService.deleteCar(req.params.id);
      return (rows.length < 1) ? util.sendError(res, 404, 'Selected ad not available')
        : util.sendSuccess(res, 200, rows[0]);
    } catch (error) {
      return util.sendError(res, 500, error.message);
    }
  },

  async getMyAds(req, res) {
    const { userId } = req;
    try {
      const { rows } = await CarService.gerUserAds(userId);
      return (rows.length < 1) ? util.sendError(res, 404, 'You do not have ads yet')
        : util.sendSuccess(res, 200, rows);
    } catch (error) {
      return util.sendError(res, 500, error.message);
    }
  },
};

export default Car;
