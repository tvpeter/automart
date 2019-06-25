import { comparePassword, hashPassword } from '../lib/handlePassword';
import validEmail from '../lib/validateEmail';
import generateToken from '../lib/generateToken';
import validateData from '../lib/validateData';
import UserService from '../services/UserService';

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
    ];

    const { rows } = await UserService.createUser(values);

    const {
      // eslint-disable-next-line camelcase
      id, email, first_name, last_name, address, isadmin, phone, status,
    } = rows[0];

    const token = generateToken(id, isadmin);

    return res.status(201).set('x-auth', token).send({
      status: 201,
      data: {
        token,
        id,
        email,
        first_name,
        last_name,
        address,
        isadmin,
        phone,
        status,
      },
    });
  },

  async getAll(req, res) {
    const { rows } = await UserService.getAllUsers();
    return User.successResponse(res, 200, rows);
  },

  async signIn(req, res) {
    delete req.headers['x-auth'];
    if (validateData(['email', 'password'], req.body) || !validEmail(req.body.email)) {
      return User.errorResponse(res, 400, 'Invalid login credentials');
    }

    const { rows } = await UserService.getUserByEmail(req.body.email);
    if (rows.length < 1) {
      return User.errorResponse(res, 404, 'Wrong username/password');
    }
    const user = rows[0];
    const validPassword = await comparePassword(req.body.password, user.password);
    if (!validPassword) {
      return User.errorResponse(res, 401, 'Wrong username/password');
    }
    user.token = generateToken(user.id, user.isadmin);
    return res.status(200).header('x-auth', user.token).send({
      status: 200,
      data: user,
    });
  },

  async changePassword(req, res) {
    const { userId } = req;
    if (!req.body.currentPassword || !req.body.newPassword) {
      return User.errorResponse(res, 400, 'Fill the required fields');
    }

    const { rows } = await UserService.selectPassword(userId);
    const confirmPassword = await comparePassword(req.body.currentPassword, rows[0].password);
    if (!confirmPassword) {
      return User.errorResponse(res, 400, 'Wrong current password, use password reset link');
    }

    const hashNewPassword = await hashPassword(req.body.newPassword);

    const result = await UserService.updateUserPassword([hashNewPassword, userId]);
    return User.successResponse(res, 200, result.rows[0]);
  },
  async makeAdmin(req, res) {
    if (!req.params.id) {
      return User.errorResponse(res, 400, 'Request does not contain required fields');
    }
    const { rows } = await UserService.makeUserAdmin([true, req.params.id, 'active']);
    return (rows.length < 1) ? User.errorResponse(res, 404, 'User not found or inactive')
      : User.successResponse(res, 200, rows[0]);
  },

  logout(req, res) {
    return User.errorResponse(res, 200, 'You have been logged out successfully');
  },
  async disableUser(req, res) {
    const { userId } = req.params;
    const { rows } = await UserService.disableUser(['disabled', userId, 'active']);
    return (rows.length < 1) ? User.errorResponse(res, 404, 'User not found or inactive')
      : User.successResponse(res, 200, rows[0]);
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
