import UserModel from '../models/UserModel';
import { comparePassword, hashPassword } from '../lib/handlePassword';
import validEmail from '../lib/validateEmail';
import generateToken from '../lib/generateToken';
import validateData from '../lib/validateData';

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
    const checkEmailInDb = UserModel.findByProperty('email', req.body.email);
    const checkPhoneInDb = UserModel.findByProperty('phone', req.body.phone);

    if (checkEmailInDb || checkPhoneInDb) {
      return User.errorResponse(res, 400, 'User with given email or phone already exist');
    }

    req.body.password = await hashPassword(req.body.password);

    const user = UserModel.create(req.body);
    const token = generateToken(user.id, user.isAdmin);

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
        isAdmin: user.isAdmin,
      },
    });
  },

  getAll(req, res) {
    const users = UserModel.getAllUsers();
    return User.successResponse(res, 200, users);
  },

  async signIn(req, res) {
    delete req.headers['x-auth'];
    if (validateData(['email', 'password'], req.body)) {
      return User.errorResponse(res, 400, 'Invalid login credentials');
    }
    const user = UserModel.isUserActive('email', req.body.email);
    if (!user) {
      return User.errorResponse(res, 404, 'Invalid login credentials');
    }
    const validPassword = await comparePassword(req.body.password, user.password);
    if (!validPassword) {
      return User.errorResponse(res, 401, 'Wrong username/password');
    }

    user.token = generateToken(user.id, user.isAdmin);
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
