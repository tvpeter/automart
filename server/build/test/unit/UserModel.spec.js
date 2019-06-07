'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _UserModel = require('../../models/UserModel');

var _UserModel2 = _interopRequireDefault(_UserModel);

var _usersData = require('../usersData');

var _usersData2 = _interopRequireDefault(_usersData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { expect } = _chai2.default;

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
        bank: 'UBA'
      };
      const newUser = _UserModel2.default.create(data);
      expect(newUser).to.have.property('id');
      expect(newUser).to.have.property('email').eq(data.email);
      expect(newUser.last_name).to.eq(data.last_name);
    });
  });
  describe('Find user by given property', () => {
    it('should return a user with given property', () => {
      _UserModel2.default.users = _usersData2.default;

      const user = _UserModel2.default.findByProperty('email', 'johndoe@gmail.com');
      expect(user).to.have.property('email').eq('johndoe@gmail.com');
      expect(user).to.have.property('first_name').to.eq('John');
    });
  });
  describe('Get all users', () => {
    it('should return an array of all users', () => {
      _UserModel2.default.users = _usersData2.default;
      const users = _UserModel2.default.getAllUsers();
      expect(users).to.be.an('Array');
      expect(users.length).to.eq(_usersData2.default.length);
    });
  });
  describe('Change password', () => {
    it('should modify users password', () => {
      _UserModel2.default.users = _usersData2.default;
      const userId = _usersData2.default[0].id;

      const userWithUpdatedPassword = _UserModel2.default.changePassword(userId, 'newpassword');
      expect(userWithUpdatedPassword).to.have.property('password').eq('newpassword');
    });
  });
  describe('Get User', () => {
    it('should return a user with given id', () => {
      _UserModel2.default.users = _usersData2.default;

      const userId = _usersData2.default[0].id;
      const user = _UserModel2.default.getUser(userId);
      expect(user).to.be.an('Object');
      expect(user).to.have.property('first_name').eq(_usersData2.default[0].first_name);
    });
  });
  describe('Make User Admin', () => {
    it('should make a user an admin', () => {
      _UserModel2.default.users = _usersData2.default;
      _usersData2.default[0].isAdmin = false;

      const userId = _usersData2.default[0].id;
      const newAdmin = _UserModel2.default.makeUserAdmin(userId);
      expect(newAdmin).to.be.an('Object');
      // eslint-disable-next-line no-unused-expressions
      expect(newAdmin.isAdmin).to.be.true;
    });
  });
});