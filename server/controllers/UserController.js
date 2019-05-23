import UserModel from '../models/UserModel';
import { comparePassword, hashPassword } from '../lib/handlePassword';
import validEmail from '../lib/validateEmail';
import generateToken from '../lib/generateToken';

const User = {
  /*
  * @description - creates a new user
   * @params {object}
   * @returns {object}
   */
  async create(req, res) {
    const error = {};
    if (req.body.password.localeCompare(req.body.password_confirmation) !== 0) {
      error.password = 'Password and confirmation does not match';
      return res.status(400).send({
        status: 'error',
        message: error.password,
        error,
      });
    }

    if (!validEmail(req.body.email)) {
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

    req.body.password = await hashPassword(req.body.password);

    const user = UserModel.create(req.body);
    const token = generateToken(user.id, user.isAdmin);

    return res.status(201).header('x-auth', token).send({
      status: 'success',
      token,
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
  async signIn(req, res) {
    const error = {};

    if (!req.body.email || !req.body.password) {
      error.email = 'Invalid login credentials';
      return res.status(400).send({
        message: error.email,
        status: 'error',
        error,
      });
    }
    const user = UserModel.findByProperty('email', req.body.email);
    if (!user) {
      error.id = 'Invalid login credentials';
      return res.status(404).send({
        message: error.id,
        status: 'error',
        error,
      });
    }

    const validPassword = await comparePassword(req.body.password, user.password);
    if (!validPassword) {
      error.password = 'Wrong username/password';
      return res.status(401).send({
        message: error.password,
        status: 'error',
        error,
      });
    }
    const token = generateToken(user.id, user.isAdmin);

    return res.status(200).header('x-auth', token).send({
      status: 'success',
      token,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    });
  },

};

export default User;
