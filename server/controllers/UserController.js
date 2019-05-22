import UserModel from '../models/UserModel';
import { hashPassword } from '../lib/encrypt';

const User = {
  /*
  * @description - creates a new user
   * @params {object}
   * @returns {object}
   */
  create(req, res) {
    const error = {};
    if (req.body.password.localeCompare(req.body.password_confirmation) !== 0) {
      error.password = 'Password and confirmation does not match';
      return res.status(400).send({
        status: 'error',
        message: error.password,
        error,
      });
    }
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email);
    if (!email) {
      error.email = 'Invalid / empty email supplied';
      return res.status(400).send({
        status: 'error',
        message: error.email,
        error,
      });
    }

    if (
      !req.body.email
      || !req.body.first_name
      || !req.body.last_name
      || !req.body.password
      || !req.body.address
      || !req.body.phone
      || !req.body.account_number
      || !req.body.bank
    ) {
      error.message = 'Fill all required fields';
      return res.status(400).send({
        message: error.message,
        status: 'error',
        error,
      });
    }

    if (req.body.password.length < 6) {
      error.password = 'Password is too short';
      return res.status(400).send({
        message: error.password,
        status: 'error',
        error,
      });
    }
    if (req.body.email.length >= 30 || req.body.first_name.length >= 30
      || req.body.last_name.length >= 30) {
      error.last_name = 'Name or email is too long';
      return res.status(400).send({
        message: error.last_name,
        status: 'error',
        error,
      });
    }
    const checkEmailInDb = UserModel.findByProperty('email', req.body.email);
    const checkPhoneInDb = UserModel.findByProperty('phone', req.body.phone);

    if (checkEmailInDb || checkPhoneInDb) {
      error.phone = 'User with given email or phone already exist';
      return res.status(400).send({
        message: error.phone,
        status: 'error',
        error,
      });
    }

    req.body.password = hashPassword(req.body.password);

    const user = UserModel.create(req.body);
    return res.status(201).send({
      status: 'success',
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      account_number: user.account_number,
      bank: user.bank,
      isAdmin: user.isAdmin,
    });
  },
  getAll(req, res) {
    const users = UserModel.getAllUsers();
    return res.status(200).send(users);
  },
};

export default User;
