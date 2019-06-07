'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _UserModel = require('../models/UserModel');

var _UserModel2 = _interopRequireDefault(_UserModel);

var _handlePassword = require('../lib/handlePassword');

var _validateEmail = require('../lib/validateEmail');

var _validateEmail2 = _interopRequireDefault(_validateEmail);

var _generateToken = require('../lib/generateToken');

var _generateToken2 = _interopRequireDefault(_generateToken);

var _validateData = require('../lib/validateData');

var _validateData2 = _interopRequireDefault(_validateData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const User = {
  /*
  * @description - creates a new user
   * @params {object}
   * @returns {object}
   */
  async create(req, res) {
    const requiredProperties = ['email', 'first_name', 'last_name', 'password', 'phone', 'account_number', 'bank', 'password_confirmation'];

    if ((0, _validateData2.default)(requiredProperties, req.body) || !(0, _validateEmail2.default)(req.body.email)) {
      return res.status(400).send({
        status: 400,
        message: 'Fill all required fields with a valid email address'
      });
    }
    if (req.body.password.localeCompare(req.body.password_confirmation) !== 0) {
      return res.status(400).send({
        status: 400,
        message: 'Password and confirmation does not match'
      });
    }

    if (req.body.password.length < 6 || req.body.email.length >= 30 || req.body.first_name.length >= 30 || req.body.last_name.length >= 30) {
      return res.status(400).send({
        status: 400,
        message: 'Ensure password is atleast 6 characters, name and email not more than 30 characters'
      });
    }
    const checkEmailInDb = _UserModel2.default.findByProperty('email', req.body.email);
    const checkPhoneInDb = _UserModel2.default.findByProperty('phone', req.body.phone);

    if (checkEmailInDb || checkPhoneInDb) {
      return res.status(400).send({
        status: 400,
        message: 'User with given email or phone already exist'
      });
    }

    req.body.password = await (0, _handlePassword.hashPassword)(req.body.password);

    const user = _UserModel2.default.create(req.body);
    const token = (0, _generateToken2.default)(user.id, user.isAdmin);

    return res.status(201).header('x-auth', token).send({
      status: 201,
      data: {
        token,
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        account_number: user.account_number,
        bank: user.bank,
        isAdmin: user.isAdmin
      }
    });
  },

  getAll(req, res) {
    const users = _UserModel2.default.getAllUsers();
    return res.status(200).send({
      status: 200,
      data: users
    });
  },

  async signIn(req, res) {
    delete req.headers['x-auth'];
    if ((0, _validateData2.default)(['email', 'password'], req.body)) {
      return res.status(400).send({
        status: 400,
        message: 'Invalid login credentials'
      });
    }
    const user = _UserModel2.default.isUserActive('email', req.body.email);
    if (!user) {
      return res.status(404).send({
        status: 404,
        message: 'Invalid login credentials'
      });
    }
    const validPassword = await (0, _handlePassword.comparePassword)(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).send({
        status: 401,
        message: 'Wrong username/password'
      });
    }

    user.token = (0, _generateToken2.default)(user.id, user.isAdmin);
    return res.status(200).header('x-auth', user.token).send({
      status: 200,
      data: user
    });
  },

  async changePassword(req, res) {
    const { userId } = req;
    if (!req.body.currentPassword || !req.body.newPassword) {
      return res.status(400).send({
        status: 400,
        message: 'Fill the required fields'
      });
    }
    const user = _UserModel2.default.getUser(userId);
    if (!user) {
      return res.status(404).send({
        message: 'User not found',
        status: 404
      });
    }
    const confirmPassword = await (0, _handlePassword.comparePassword)(req.body.currentPassword, user.password);
    if (!confirmPassword) {
      return res.status(400).send({
        status: 400,
        message: 'Wrong current password, use password reset link'
      });
    }
    const hashNewPassword = await (0, _handlePassword.hashPassword)(req.body.newPassword);
    const updatedUserDetails = _UserModel2.default.changePassword(userId, hashNewPassword);

    return res.send({
      status: 200,
      data: updatedUserDetails
    });
  },
  makeAdmin(req, res) {
    const user = _UserModel2.default.isUserActive('id', req.params.id);
    if (!user) {
      return res.status(412).send({
        status: 412,
        message: 'User not found or inactive'
      });
    }
    const newAdmin = _UserModel2.default.makeUserAdmin(user.id);
    return res.status(200).send({
      status: 200,
      data: newAdmin
    });
  },
  logout(req, res) {
    return res.status(200).send({
      status: 200,
      message: 'You have been logged out successfully'
    });
  },
  disableUser(req, res) {
    // the userid is in the params
    const userId = req.params.userid;
    if (!userId) {
      return res.status(400).send({
        status: 400,
        message: 'Invalid request'
      });
    }

    // check that the user is active
    const user = _UserModel2.default.isUserActive('id', userId);
    if (!user) {
      return res.status(404).send({
        status: 404,
        message: 'User not found or inactive'
      });
    }
    // disable the user
    const disabledUser = _UserModel2.default.disableUser(userId);
    // return the result
    return res.status(200).send({
      status: 200,
      data: disabledUser
    });
  }
};

exports.default = User;