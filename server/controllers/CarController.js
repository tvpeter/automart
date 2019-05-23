// import fs from 'fs';
// import multer from 'multer';
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import CarModel from '../models/CarModel';

cloudinary = cloudinary.v2;
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, './public/images/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + file.originalname);
//   },
// });
// const fileFilter = (req, file, cb) => {
//   if (
//     file.mimetype === 'image/jpg'
//     || file.mimetype === 'image/png'
//     || file.mimetype === 'image/jpeg'
//   ) {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 500000 },
// });

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
    // const image = await cloudinary.uploader.upload(req.file.path, {
    //   folder: "fmg/",
    //   width: 270,
    //   height: 238,
    //   crop: "limit",
    //   quality: "auto",
    //   format: "png"
    // });

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
