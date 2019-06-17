// import chai from 'chai';
// import UserModel from '../../models/UserModel';
// import usersdata from '../usersData';

// const { expect } = chai;

// describe('User Model', () => {
//   describe('create User', () => {
//     it('should create a new user', () => {
//       const data = {
//         email: 'amaka@gmail.com',
//         first_name: 'Amaka',
//         last_name: 'Terfa',
//         password: 'password',
//         address: 'my address',
//         isAdmin: false,
//         phone: '09023928389',
//         account_number: '9302938494',
//         bank: 'UBA',
//       };
//       const newUser = UserModel.create(data);
//       expect(newUser).to.have.property('id');
//       expect(newUser).to.have.property('email').eq(data.email);
//       expect(newUser.last_name).to.eq(data.last_name);
//     });
//   });
//   describe('Find user by given property', () => {
//     it('should return a user with given property', () => {
//       UserModel.users = usersdata;

//       const user = UserModel.findByProperty('email', 'johndoe@gmail.com');
//       expect(user).to.have.property('email').eq('johndoe@gmail.com');
//       expect(user).to.have.property('first_name').to.eq('John');
//     });
//   });
//   describe('Get all users', () => {
//     it('should return an array of all users', () => {
//       UserModel.users = usersdata;
//       const users = UserModel.getAllUsers();
//       expect(users).to.be.an('Array');
//       expect(users.length).to.eq(usersdata.length);
//     });
//   });
//   describe('Change password', () => {
//     it('should modify users password', () => {
//       UserModel.users = usersdata;
//       const userId = usersdata[0].id;

//       const userWithUpdatedPassword = UserModel.changePassword(userId, 'newpassword');
//       expect(userWithUpdatedPassword).to.have.property('password').eq('newpassword');
//     });
//   });
//   describe('Get User', () => {
//     it('should return a user with given id', () => {
//       UserModel.users = usersdata;

//       const userId = usersdata[0].id;
//       const user = UserModel.getUser(userId);
//       expect(user).to.be.an('Object');
//       expect(user).to.have.property('first_name').eq(usersdata[0].first_name);
//     });
//   });
//   describe('Make User Admin', () => {
//     it('should make a user an admin', () => {
//       UserModel.users = usersdata;
//       usersdata[0].isAdmin = false;

//       const userId = usersdata[0].id;
//       const newAdmin = UserModel.makeUserAdmin(userId);
//       expect(newAdmin).to.be.an('Object');
//       // eslint-disable-next-line no-unused-expressions
//       expect(newAdmin.isAdmin).to.be.true;
//     });
//   });
//   describe('Check if user is active', () => {
//     it('should return user if user is active', () => {
//       usersdata[0].status = 'active';
//       UserModel.users = usersdata;

//       const user = UserModel.isUserActive('id', usersdata[0].id);
//       expect(user.id).to.eq(usersdata[0].id);
//       expect(user).to.be.an('Object');
//     });
//   });
//   describe('Disable User', () => {
//     it('should disable an active user', () => {
//       usersdata[0].status = 'active';
//       UserModel.users = usersdata;

//       const disabledUser = UserModel.disableUser(usersdata[0].id);
//       expect(disabledUser.id).to.eq(usersdata[0].id);
//       expect(disabledUser.status).to.eq('disabled');
//     });
//   });
// });
