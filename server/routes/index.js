import express from 'express';
import multer from 'multer';
import User from '../controllers/UserController';
import Car from '../controllers/CarController';
import auth from '../middleware/auth';

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

router.post('/auth/signup', User.create);
router.get('/users', User.getAll);
router.post('/auth/signin', User.signIn);
// create an advert
router.post('/car', auth, upload.single('img'), Car.create);

// get cars by manufacturer
router.get('/cars/:manufacturer', Car.getCarsByManufacturer);

// get all cars
router.get('/car', Car.getAll);
router.get('/', (req, res) => res.status(200).send('Hello world'));

export default router;
