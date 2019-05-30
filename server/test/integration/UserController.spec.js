import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../index';
import UserModel from '../../models/UserModel';
import usersData from '../usersData';
import generateToken from '../../lib/generateToken';


const { expect } = chai;
const signupUrl = '/api/v1/auth/signup';
const loginUrl = '/api/v1/auth/signin';
chai.use(chaiHttp);
describe('User', () => {
  const usersArray = () => {
    UserModel.users = usersData;
  };
  describe('User create', () => {
    it('should return a new user with the supplied properties', (done) => {
      const userDetails = {
        email: 'kkkkkkjj@gmail.com',
        first_name: 'Karmanis',
        last_name: 'Valec',
        password: 'password',
        password_confirmation: 'password',
        address: 'my address',
        phone: '087687765435',
        account_number: '2081769837',
        bank: 'UBA',
      };
      chai.request(server).post(signupUrl).send(userDetails).end((err, res) => {
        expect(res.status).to.eq(201);
        expect(res.body.data).to.have.property('email').eq(userDetails.email);
        expect(res.body.data).to.have.property('phone').eq(userDetails.phone);
        done();
      });
    });

    it('should return error if password and its confirmation does not match', (done) => {
      const data = {
        email: 'peter@gmail.com',
        first_name: 'Anthonia',
        last_name: 'Tyonum',
        password: 'power',
        address: 'my address',
        phone: '08137277480',
        account_number: '2081769837',
        bank: 'UBA',
        password_confirmation: 'password',
      };
      chai.request(server).post(signupUrl).send(data).end((err, res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.eq('Password and confirmation does not match');
        done();
      });
    });

    it('should return error if all required fields are not supplied', (done) => {
      const data = {
        email: 'peter@gmail.com',
        first_name: 'Anthonia',
        password: 'password',
        address: 'my address',
        phone: '08137277480',
        account_number: '2081769837',
        bank: 'UBA',
        password_confirmation: 'password',
      };
      chai.request(server).post(signupUrl).send(data).end((err, res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.eq('Fill all required fields');
        done();
      });
    });

    it('should return error if invalid email address is supplied', (done) => {
      const data = {
        email: 'peter.gmail.com',
        first_name: 'Anthonia',
        password: 'password',
        address: 'my address',
        phone: '08137277480',
        account_number: '2081769837',
        bank: 'UBA',
        password_confirmation: 'password',
      };
      chai.request(server).post(signupUrl).send(data).end((err, res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.eq('Invalid / empty email supplied');
        done();
      });
    });

    it('should return error if length of password is less than 6 characters', (done) => {
      const data = {
        email: 'peter@gmail.com',
        first_name: 'Anthonia',
        last_name: 'Tyonum',
        password: 'pass',
        address: 'my address',
        phone: '08137277480',
        account_number: '2081769837',
        bank: 'UBA',
        password_confirmation: 'pass',
      };
      chai.request(server).post(signupUrl).send(data).end((err, res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.eq('Password is too short');
        done();
      });
    });

    it('should return error if last name or first name or email is more than 30 characters', (done) => {
      const data = {
        email: 'justhnodhmdjdjhdkeh@akehdgdhekdhdimdhkshs.com',
        first_name: 'Anthonia',
        last_name: 'Tyonum',
        password: 'password',
        address: 'my address',
        phone: '08137277480',
        account_number: '2081769837',
        bank: 'UBA',
        password_confirmation: 'password',
      };
      chai.request(server).post(signupUrl).send(data).end((err, res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.eq('Name or email is too long');
        done();
      });
    });
    it('should return error if user email has been used', (done) => {
      usersArray();
      const data = {
        email: usersData[0].email,
        first_name: 'Anthonia',
        last_name: 'Tyonum',
        password: 'password',
        address: 'my address',
        phone: '08137277480',
        account_number: '2081769837',
        bank: 'UBA',
        password_confirmation: 'password',
      };
      chai.request(server).post(signupUrl).send(data).end((err, res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.eq('User with given email or phone already exist');
        done();
      });
    });
    it('should return error if given phone has been used', (done) => {
      usersArray();
      const data = {
        email: 'peterst@gmail.com',
        first_name: 'John',
        last_name: 'Tyonum',
        password: 'password',
        address: 'my address',
        phone: usersData[0].phone,
        account_number: '2081769837',
        bank: 'UBA',
        password_confirmation: 'password',
      };
      chai.request(server).post(signupUrl).send(data).end((err, res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.eq('User with given email or phone already exist');
        done();
      });
    });
  });

  // user sign in
  describe('User Signin', () => {
    it('should return error 400 if user did not supply password', (done) => {
      usersArray();
      chai.request(server).post(loginUrl).send({ email: 'johndoe@google.dev' }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.eq('Invalid login credentials');
        done();
      });
    });

    it('should return error 404 if user email is not found', (done) => {
      const data = {
        email: 'jjjohng@gmail.com',
        password: 'password',
      };
      chai.request(server).post(loginUrl).send(data).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.message).to.eq('Invalid login credentials');
        done();
      });
    });

    it('should return error 401 if password is incorrect for given email', (done) => {
      usersArray();
      const data = {
        email: usersData[0].email,
        password: 'pasword',
      };

      chai.request(server).post(loginUrl).send(data).end((err, res) => {
        expect(res.status).to.eq(401);
        expect(res.body.message).to.eq('Wrong username/password');
        done();
      });
    });

    it('should return a header with token and credentials if password and email are correct', () => {
      usersArray();
      const data = {
        email: usersData[0].email,
        password: 'password',
      };
      chai.request(server).post(loginUrl).send(data).end((err, res) => {
        expect(res.status).to.eq(200);
        expect(res).to.have.header('x-auth');
        expect(res.body.data).to.have.property('email').eq(data.email);
      });
    });
  });

  // user change password
  describe('User change password', () => {
    it('should return user with updated password', (done) => {
      usersArray();
      const user = usersData[0];
      user.isAdmin = false;
      const token = generateToken(user.id, user.isAdmin);
      chai.request(server).patch('/api/v1/user').set('x-auth', token)
        .send({ currentPassword: 'password', newPassword: 'newpassword' })
        .end((err, res) => {
          expect(res.status).to.eq(200);
          expect(res.body.data).to.be.an('Object');
          expect(res.body.data.email).to.eq(user.email);
          done();
        });
    });

    it('should return 400 if current password is wrong', (done) => {
      usersArray();
      const user = usersData[0];
      user.isAdmin = false;
      const token = generateToken(user.id, user.isAdmin);
      chai.request(server).patch('/api/v1/user').set('x-auth', token)
        .send({ currentPassword: 'password1', newPassword: 'anotherpassword' })
        .end((err, res) => {
          expect(res.body.status).to.eq(400);
          expect(res.body.message).to.eq('Wrong current password, use password reset link');
          done();
        });
    });

    it('should return 400 if current password is not supplied', async () => {
      usersArray();
      const user = usersData[0];
      user.isAdmin = false;
      const token = await generateToken(user.id, user.isAdmin);
      chai.request(server).patch('/api/v1/user').set('x-auth', token)
        .send({ newPassword: 'newpassword' })
        .then((res) => {
          expect(res.status).to.eq(400);
          expect(res.body.message).to.eq('Fill the required fields');
        });
    });
    it('should return 401 if user is not logged in', (done) => {
      usersArray();
      chai.request(server).patch('/api/v1/user').send({ currentPassword: 'password', newPassword: 'newpassword' })
        .end((err, res) => {
          expect(res.status).to.eq(401);
          expect(res.body.message).to.eq('No authorization token provided');
          done();
        });
    });
  });
});
