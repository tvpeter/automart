'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _UserController = require('../controllers/UserController');

var _UserController2 = _interopRequireDefault(_UserController);

var _CarController = require('../controllers/CarController');

var _CarController2 = _interopRequireDefault(_CarController);

var _auth = require('../middleware/auth');

var _auth2 = _interopRequireDefault(_auth);

var _admin = require('../middleware/admin');

var _admin2 = _interopRequireDefault(_admin);

var _logout = require('../middleware/logout');

var _logout2 = _interopRequireDefault(_logout);

var _OrderController = require('../controllers/OrderController');

var _OrderController2 = _interopRequireDefault(_OrderController);

var _FlagController = require('../controllers/FlagController');

var _FlagController2 = _interopRequireDefault(_FlagController);

var _upload = require('../lib/upload');

var _upload2 = _interopRequireDefault(_upload);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express2.default.Router();

// user signup
router.post('/auth/signup', _UserController2.default.create);

// user login
router.post('/auth/signin', _UserController2.default.signIn);

// user log out
router.get('/auth/logout', _logout2.default, _UserController2.default.logout);

// get cars within a price range
router.get('/car/price/', _CarController2.default.getCarsWithinPriceRange);

// get cars by manufacturer
router.get('/car/manufacturer/:manufacturer', _CarController2.default.getCarsByProperty);

// get cars by body type
router.get('/car/bodytype/:body_type', _CarController2.default.getCarsByProperty);

// get cars by state
router.get('/car/state/:state', _CarController2.default.getCarsByProperty);

// get a single ad
router.get('/car/:id', _CarController2.default.getSingleAd);

// get all unsold cars
router.get('/cars/status/available', _CarController2.default.getAllUnsoldCars);

/**
 * Protected routes - users
 */
// user make an order
router.post('/order', _auth2.default, _OrderController2.default.create);

// create an advert
router.post('/car', _auth2.default, _upload2.default.single('img'), _CarController2.default.create);

// User gets all his/her sold ads
router.get('/order/me', _auth2.default, _OrderController2.default.mySoldAds);

// view an order detail
router.get('orders/:orderId', _auth2.default, _OrderController2.default.getSingleOrder);

// seller update offer price
router.patch('/order', _auth2.default, _OrderController2.default.updatePrice);

router.patch('/orders/:orderId', _auth2.default, _OrderController2.default.updateOrderStatus);
// flag an ad
router.post('/flag', _auth2.default, _FlagController2.default.createFlag);
// update ad. Possible status include [ available, pending, suspended, accepted, sold]
router.patch('/car/:id', _auth2.default, _CarController2.default.updateAdvert);

// change password
router.patch('/user', _auth2.default, _UserController2.default.changePassword);

/**
 * Protected routes - Admin
 */

// get all cars
router.get('/car', _admin2.default, _CarController2.default.getAll);

// admin delete an ad
router.delete('/car/:id', _admin2.default, _CarController2.default.deleteAd);

// make user an admin
router.patch('/user/:id', _admin2.default, _UserController2.default.makeAdmin);

// view all orders
router.get('/orders', _admin2.default, _OrderController2.default.getAllOrders);

router.delete('/orders/:orderId', _admin2.default, _OrderController2.default.deleteOrder);

// disable a user
router.patch('/users/:userId', _admin2.default, _UserController2.default.disableUser);

// update a flag
router.patch('/flag/:flagId', _admin2.default, _FlagController2.default.updateFlag);

// delete a flag
router.delete('/flags/:flagId', _admin2.default, _FlagController2.default.deleteFlag);

// admin get all users
router.get('/users', _admin2.default, _UserController2.default.getAll);

router.get('/', (req, res) => res.status(200).send('Hello world'));

exports.default = router;