import express from 'express';
import User from '../controllers/UserController';
import Car from '../controllers/CarController';
import auth from '../middleware/auth';
import adminAuth from '../middleware/admin';
import logout from '../middleware/logout';
import Order from '../controllers/OrderController';
import Flag from '../controllers/FlagController';
import upload from '../lib/upload';


const router = express.Router();
// user signup
router.post('/auth/signup', User.create);

// user login
router.post('/auth/signin', User.signIn);

// user log out
router.get('/auth/logout', logout, User.logout);

// get cars within a price range
// router.get('/car/price/', Car.getCarsWithinPriceRange);

// get cars by manufacturer
router.get('/car/manufacturer/:manufacturer', Car.getCarsByProperty);

// get cars by body type
router.get('/car/bodytype/:body_type', Car.getCarsByProperty);

// get cars by state
router.get('/car/state/:state', Car.getCarsByProperty);

// get a single ad
router.get('/car/:id', Car.getSingleAd);

// get all unsold cars
router.get('/cars', Car.getAllUnsoldCars);

/**
 * Protected routes - users
 */
// user make an order
// router.post('/order', auth, Order.create);

// create an advert
router.post('/car', auth, upload.single('img'), Car.create);

// User gets all his/her sold ads
router.get('/orders/me', auth, Order.mySoldAds);

// view an order detail
router.get('/orders/:orderId', auth, Order.getSingleOrder);

// delete order seller and admin can delete
router.delete('/orders/:orderId', auth, Order.deleteAnOrder);


// seller update offer price
router.patch('/order', auth, Order.updatePrice);

// router.patch('/orders/:orderId', auth, Order.updateOrderStatus);
// flag an ad
router.post('/flag', auth, Flag.createFlag);

// update ad. Possible status include [ available, suspended, sold]
router.patch('/car/:id', auth, Car.updateAdvert);

// change password
router.patch('/user', auth, User.changePassword);

/**
 * Protected routes - Admin
 */

// get all cars
router.get('/car', adminAuth, Car.getAll);

// admin delete an ad
// router.delete('/car/:id', adminAuth, Car.deleteAd);

// make user an admin
router.patch('/user/:id', adminAuth, User.makeAdmin);

// view all orders
router.get('/orders', adminAuth, Order.getAllOrders);

// disable a user
router.patch('/users/:userId', adminAuth, User.disableUser);

// update a flag
router.patch('/flag/:flagId', adminAuth, Flag.updateFlag);

// delete a flag
router.delete('/flags/:flagId', adminAuth, Flag.deleteFlag);

// admin get all users
router.get('/users', adminAuth, User.getAll);

router.get('/flags', adminAuth, Flag.getAllFlags);


router.get('/', (req, res) => res.status(200).send('Hello world'));

export default router;
