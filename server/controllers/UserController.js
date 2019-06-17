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

    const query = 'INSERT INTO users (id, email, first_name, last_name, password, address, phone, account_number, bank) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, email, first_name, last_name, address, isadmin, phone, status';
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

    try {
      const { rows } = await db.query(query, values);

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
    } catch (error) {
      if (error.routine === '_bt_check_unique') {
        return User.errorResponse(res, 400, 'User with given email or phone already exist');
      }
      return User.errorResponse(res, 400, error);
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
    if (validateData(['email', 'password'], req.body) || !validEmail(req.body.email)) {
      return User.errorResponse(res, 400, 'Invalid login credentials');
    }

    // const user = UserModel.isUserActive('email', req.body.email);
    const query = `SELECT * FROM users WHERE email='${req.body.email}'`;
    try {
      const { rows } = await db.query(query);
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
    } catch (error) {
      return User.errorResponse(res, 404, error);
    }
  },

  async changePassword(req, res) {
    const { userId } = req;
    if (!req.body.currentPassword || !req.body.newPassword) {
      return User.errorResponse(res, 400, 'Fill the required fields');
    }

    const query = `SELECT password FROM users WHERE id=${userId}`;
    try {
      const { rows } = await db.query(query);
      const confirmPassword = await comparePassword(req.body.currentPassword, rows[0].password);
      if (!confirmPassword) {
        return User.errorResponse(res, 400, 'Wrong current password, use password reset link');
      }

      const hashNewPassword = await hashPassword(req.body.newPassword);

      const updateQuery = 'UPDATE users SET password=$1 WHERE id=$2 RETURNING id, email, first_name, last_name, phone, status';
      const result = await db.query(updateQuery, [hashNewPassword, userId]);
      return User.successResponse(res, 200, result.rows[0]);
    } catch (error) {
      return User.errorResponse(res, 404, error);
    }
  },
  async makeAdmin(req, res) {
    if (!req.params.id) {
      return User.errorResponse(res, 400, 'Request does not contain required fields');
    }

    const makeAdminQuery = 'UPDATE users SET isadmin=$1 WHERE id=$2 AND status=$3 RETURNING id, email, first_name, last_name, isadmin, phone, status';
    try {
      const { rows } = await db.query(makeAdminQuery, [true, req.params.id, 'active']);
      return User.successResponse(res, 200, rows[0]);
    } catch (error) {
      return User.errorResponse(res, 412, 'User not found or inactive');
    }
  },

  logout(req, res) {
    delete req.headers['x-auth'];
    return res.status(200).send({
      status: 200,
      message: 'You have been logged out successfully',
    });
  },
  async disableUser(req, res) {
    const { userId } = req.params;
    const disableQuery = 'UPDATE users SET status=$1 WHERE id=$2 AND status=$3 RETURNING id, email, first_name, last_name, isadmin, phone, status';
    try {
      const { rows } = await db.query(disableQuery, ['disabled', userId, 'active']);
      return User.successResponse(res, 200, rows[0]);
    } catch (error) {
      return User.errorResponse(res, 404, 'User not found or inactive');
    }
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
