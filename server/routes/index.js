import express from 'express';
import multer from 'multer';
import User from '../controllers/UserController';
import Car from '../controllers/CarController';
import auth from '../middleware/auth';
import adminAuth from '../middleware/admin';
import logout from '../middleware/logout';
import Order from '../controllers/OrderController';
import Flag from '../controllers/FlagController';

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

// user login
router.post('/auth/signin', User.signIn);

// user log out
router.get('/auth/logout', logout, User.logout);

// get cars within a price range
router.get('/car/price/', Car.getCarsWithinPriceRange);

// get cars by manufacturer
router.get('/car/manufacturer/:manufacturer', Car.getCarsByProperty);

// get cars by body type
router.get('/car/bodytype/:body_type', Car.getCarsByProperty);

// get cars by state
router.get('/car/state/:state', Car.getCarsByProperty);

// get a single ad
router.get('/car/:id', Car.getSingleAd);

// get all unsold cars
router.get('/cars/status/available', Car.getAllUnsoldCars);

/**
 * Protected routes - users
 */
// user make an order
router.post('/order', auth, Order.create);

// create an advert
router.post('/car', auth, upload.single('img'), Car.create);

// User gets all his/her sold ads
router.get('/transactions/sold', auth, Order.mySoldAds);

// seller update offer price
router.patch('/order', auth, Order.updatePrice);

// flag an ad
router.post('/flag', auth, Flag.createFlag);
// update ad. Possible status include [ available, pending, suspended, accepted, sold]
router.patch('/car/:id', auth, Car.updateAdvert);

// change password
router.patch('/user', auth, User.changePassword);

/**
 * Protected routes - Admin
 */

// get all cars
router.get('/car', adminAuth, Car.getAll);

// admin delete an ad
router.delete('/car/:id', adminAuth, Car.deleteAd);

// make user an admin
router.patch('/user/:id', adminAuth, User.makeAdmin);

// admin get all users
router.get('/users', adminAuth, User.getAll);


router.get('/', (req, res) => res.status(200).send('Hello world'));

export default router;
