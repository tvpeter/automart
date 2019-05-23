import express from 'express';
import User from '../controllers/UserController';
import Car from '../controllers/CarController';

const router = express.Router();

router.post('/auth/signup', User.create);
router.get('/users', User.getAll);
router.post('/auth/signin', User.signIn);
router.post('/car', Car.create);
router.get('/car', Car.getAll);
router.get('/', (req, res) => res.status(200).send('Hello world'));

export default router;
