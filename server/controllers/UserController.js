import UserModel from '../models/UserModel';
import { comparePassword, hashPassword } from '../lib/handlePassword';
import validEmail from '../lib/validateEmail';
import generateToken from '../lib/generateToken';
import validateData from '../lib/validateData';
import db from '../services/db';

const User = {
  /*
  * @description - creates a new user
   * @params {object}
   * @returns {object}
   */
  async create(req, res) {
    const requiredProperties = ['email', 'first_name', 'last_name', 'password', 'phone', 'account_number', 'bank', 'password_confirmation'];

    if (validateData(requiredProperties, req.body) || !validEmail(req.body.email)) {
      return User.errorResponse(res, 400, 'Fill all required fields with a valid email address');
    }
    if (req.body.password.localeCompare(req.body.password_confirmation) !== 0) {
      return User.errorResponse(res, 400, 'Password and confirmation does not match');
    }

    if (req.body.password.length < 6 || req.body.email.length >= 30
      || req.body.first_name.length >= 30 || req.body.last_name.length >= 30) {
      return User.errorResponse(res, 400, 'Ensure password is atleast 6 characters, name and email not more than 30 characters');
    }

    req.body.password = await hashPassword(req.body.password);

    const query = 'INSERT INTO users (id, email, first_name, last_name, password, address, phone, account_number, bank) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *';
    const values = [
      Date.now(),
      req.body.email,
      req.body.first_name,
      req.body.last_name,
      req.body.password,
      req.body.address,
      req.body.phone,
      req.body.account_number,
      req.body.bank,
      req.body.isAdmin,
    ];

    try {
      const { rows } = await db.query(query, values);

      const data = rows[0];

      const token = generateToken(data.id, data.isAdmin);
      const {
        // eslint-disable-next-line camelcase
        id, email, first_name, last_name, address, isAdmin, phone, status,
      } = data;

      return res.status(201).set('x-auth', token).send({
        status: 201,
        data: {
          token,
          id,
          email,
          first_name,
          last_name,
          address,
          isAdmin,
          phone,
          status,
        },
      });
    } catch (error) {
      if (error.routine === '_bt_check_unique') {
        return User.errorResponse(res, 400, 'User with given email or phone already exist');
      }
      return User.errorResponse(res, 400, error.details);
    }
  },

  async getAll(req, res) {
    // const users = UserModel.getAllUsers();
    const selectAllUsers = 'SELECT (id, email, first_name, last_name, address, isAdmin, phone, status) FROM users LIMIT 50';
    try {
      const { rows } = await db.query(selectAllUsers);
      return User.successResponse(res, 200, rows);
    } catch (error) {
      return User.errorResponse(res, 400, error.details);
    }
  },

  async signIn(req, res) {
    delete req.headers['x-auth'];
    if (validateData(['email', 'password'], req.body)) {
      return User.errorResponse(res, 400, 'Invalid login credentials');
    }

    // const user = UserModel.isUserActive('email', req.body.email);
    const query = 'SELECT * FROM users WHERE email=$1';
    try {
      const { rows } = await db.query(query, [req.body.email]);
      const user = rows[0];
      const validPassword = await comparePassword(req.body.password, user.password);
      if (!validPassword) {
        return User.errorResponse(res, 401, 'Wrong username/password');
      }

      user.token = generateToken(user.id, user.isAdmin);
      return res.status(200).header('x-auth', user.token).send({
        status: 200,
        data: user,
      });
    } catch (error) {
      return User.errorResponse(res, 404, error);
    }
  },

  async changePassword(req, res) {
    const { userId } = req;
    if (!req.body.currentPassword || !req.body.newPassword) {
      return User.errorResponse(res, 400, 'Fill the required fields');
    }
    const user = UserModel.getUser(userId);
    if (!user) {
      return User.errorResponse(res, 404, 'User not found');
    }

    const confirmPassword = await comparePassword(req.body.currentPassword, user.password);
    if (!confirmPassword) {
      return User.errorResponse(res, 400, 'Wrong current password, use password reset link');
    }
    const hashNewPassword = await hashPassword(req.body.newPassword);
    const updatedUserDetails = UserModel.changePassword(userId, hashNewPassword);

    return User.successResponse(res, 200, updatedUserDetails);
  },
  makeAdmin(req, res) {
    const user = UserModel.isUserActive('id', req.params.id);
    if (!user) {
      return User.errorResponse(res, 412, 'User not found or inactive');
    }
    const newAdmin = UserModel.makeUserAdmin(user.id);

    return User.successResponse(res, 200, newAdmin);
  },

  logout(req, res) {
    return res.status(200).send({
      status: 200,
      message: 'You have been logged out successfully',
    });
  },
  disableUser(req, res) {
    // check that the user is active
    const { userId } = req.params;
    const user = UserModel.isUserActive('id', userId);
    if (!user) {
      return User.errorResponse(res, 404, 'User not found or inactive');
    }
    // disable the user
    const disabledUser = UserModel.disableUser(userId);
    // return the result
    return User.successResponse(res, 200, disabledUser);
  },

  errorResponse(res, statuscode, message) {
    return res.status(statuscode).send({
      status: statuscode,
      message,
    });
  },
  successResponse(res, statuscode, data) {
    return res.status(statuscode).send({
      status: statuscode,
      data,
    });
  },
};

export default User;
