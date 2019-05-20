import UserModel from '../models/UserModel';

const User = {
  /*
   * returns user object
   */
  create(req, res) {
    if (req.body.password !== req.body.password_confirmation) {
      return res.status(400).send({ message: 'Password does not match' });
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
      return res.status(400).send({ message: 'Fill all required fields' });
    }
    const user = UserModel.create(req.body);
    return res.status(201).send(user);
  },
};

export default User;
