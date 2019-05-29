import chai from 'chai';
import UserModel from '../../models/UserModel';
import usersdata from '../usersData';

const { expect } = chai;

describe('User Model', () => {
  describe('create User', () => {
    it('should create a new user', () => {
      const data = {
        email: 'amaka@gmail.com',
        first_name: 'Amaka',
        last_name: 'Terfa',
        password: 'password',
        address: 'my address',
        isAdmin: false,
        phone: '09023928389',
        account_number: '9302938494',
        bank: 'UBA',
      };
      const newUser = UserModel.create(data);
      expect(newUser).to.have.property('id');
      expect(newUser).to.have.property('email').eq(data.email);
      expect(newUser.last_name).to.eq(data.last_name);
    });
  });
  describe('Find user by given property', () => {
    it('should return a user with given property', () => {
      UserModel.users = usersdata;

      const user = UserModel.findByProperty('email', 'johndoe@gmail.com');
      expect(user).to.have.property('email').eq('johndoe@gmail.com');
      expect(user).to.have.property('first_name').to.eq('John');
    });
  });
  describe('Get all users', () => {
    it('should return an array of all users', () => {
      UserModel.users = usersdata;
      const users = UserModel.getAllUsers();
      expect(users).to.be.an('Array');
      expect(users.length).to.eq(usersdata.length);
    });
  });
  describe('Change password', () => {
    it('should modify users password', () => {
      UserModel.users = usersdata;
      const userId = usersdata[0].id;

      const userWithUpdatedPassword = UserModel.changePassword(userId, 'newpassword');
      expect(userWithUpdatedPassword).to.have.property('password').eq('newpassword');
    });
  });
  describe('Get User', () => {
    it('should return a user with given id', () => {
      UserModel.users = usersdata;

      const userId = usersdata[0].id;
      const user = UserModel.getUser(userId);
      expect(user).to.be.an('Object');
      expect(user).to.have.property('first_name').eq(usersdata[0].first_name);
    });
  });
});
