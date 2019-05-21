import UserModel from '../models/UserModel';

const User = {
  /*
   * returns user object
   */
  create(req, res) {
    const error = {};
    if (req.body.password !== req.body.password_confirmation) {
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
        status: error,
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
    const user = UserModel.create(req.body);
    return res.status(201).send(user);
  },
};

export default User;
