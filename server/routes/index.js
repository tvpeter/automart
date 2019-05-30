import express from 'express';
import multer from 'multer';
import User from '../controllers/UserController';
import Car from '../controllers/CarController';
import auth from '../middleware/auth';
import adminAuth from '../middleware/admin';

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpg'
    || file.mimetype === 'image/png'
    || file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500000 },
});

const router = express.Router();

// user signup
router.post('/auth/signup', User.create);

// users
router.get('/users', adminAuth, User.getAll);

// user login
router.post('/auth/signin', User.signIn);

// change password
router.patch('/user', auth, User.changePassword);

// get cars within a price range
router.get('/car/price/', Car.getCarsWithinPriceRange);

// create an advert
router.post('/car', auth, upload.single('img'), Car.create);

// get cars by manufacturer
router.get('/car/manufacturer/:manufacturer', Car.getCarsByProperty);

// get cars by body type
router.get('/car/bodytype/:body_type', Car.getCarsByProperty);

// get cars by state
router.get('/car/state/:state', Car.getCarsByProperty);

// get a single ad
router.get('/car/:id', Car.getSingleAd);

// update ad
router.patch('/car/:id', auth, Car.updateAdvert);

// get all unsold cars
router.get('/cars/status/available', Car.getAllUnsoldCars);

// get all cars
router.get('/car', adminAuth, Car.getAll);
router.get('/', (req, res) => res.status(200).send('Hello world'));

export default router;
