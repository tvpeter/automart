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
      return res.status(400).send({
        status: 400,
        message: 'Fill all required fields with a valid email address',
      });
    }
    if (req.body.password.localeCompare(req.body.password_confirmation) !== 0) {
      return res.status(400).send({
        status: 400,
        message: 'Password and confirmation does not match',
      });
    }

    if (req.body.password.length < 6 || req.body.email.length >= 30
      || req.body.first_name.length >= 30 || req.body.last_name.length >= 30) {
      return res.status(400).send({
        status: 400,
        message: 'Ensure password is atleast 6 characters, name and email not more than 30 characters',
      });
    }
    const checkEmailInDb = UserModel.findByProperty('email', req.body.email);
    const checkPhoneInDb = UserModel.findByProperty('phone', req.body.phone);

    if (checkEmailInDb || checkPhoneInDb) {
      return res.status(400).send({
        status: 400,
        message: 'User with given email or phone already exist',
      });
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
    return res.status(200).send({
      status: 200,
      data: users,
    });
  },

  async signIn(req, res) {
    const loginParams = ['email', 'password'];
    if (validateData(loginParams, req.body)) {
      return res.status(400).send({
        status: 400,
        message: 'Invalid login credentials',
      });
    }
    const user = UserModel.isUserActive('email', req.body.email);
    if (!user) {
      return res.status(404).send({
        status: 404,
        message: 'Invalid login credentials',
      });
    }
    delete req.headers['x-auth'];
    try {
      const validPassword = await comparePassword(req.body.password, user.password);
      if (!validPassword) {
        return res.status(401).send({
          status: 401,
          message: 'Wrong username/password',
        });
      }
    } catch (tokenError) {
      return res.status(500).send({
        status: 500,
        message: 'Oh, something went wrong, try again',
      });
    }

    user.token = generateToken(user.id, user.isAdmin);
    return res.status(200).header('x-auth', user.token).send({
      status: 200,
      data: user,
    });
  },

  async changePassword(req, res) {
    const { userId } = req;
    const updatePasswordParams = ['currentPassword', 'newPassword'];
    if (validateData(updatePasswordParams, req.body)) {
      return res.status(400).send({
        status: 400,
        message: 'Fill the required fields',
      });
    }
    const user = UserModel.getUser(userId);
    if (!user) {
      return res.status(404).send({
        message: 'User not found',
        status: 404,
      });
    }
    const confirmPassword = await comparePassword(req.body.currentPassword, user.password);
    if (!confirmPassword) {
      return res.status(400).send({
        status: 400,
        message: 'Wrong current password, use password reset link',
      });
    }
    const hashNewPassword = await hashPassword(req.body.newPassword);
    const updatedUserDetails = UserModel.changePassword(userId, hashNewPassword);

    return res.send({
      status: 200,
      data: updatedUserDetails,
    });
  },

};

export default User;
