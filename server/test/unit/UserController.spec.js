import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../index';
import UserModel from '../../models/UserModel';

const { expect } = chai;
const signupUrl = '/api/v1/auth/signup';
const loginUrl = '/api/v1/auth/signin';
chai.use(chaiHttp);
describe('User', () => {
  describe('User create', () => {
    it('should return a new user with the supplied properties', (done) => {
      const data = {
        email: 'proff@gmail.com',
        first_name: 'Anthonia',
        last_name: 'Tyonum',
        password: 'password',
        password_confirmation: 'password',
        address: 'my address',
        phone: '09023928389',
        account_number: '2081769837',
        bank: 'UBA',
      };
      chai.request(server).post(signupUrl).send(data).end((err, res) => {
        const keys = Object.keys(data);
        keys.forEach((key) => {
          if (key !== 'password' && key !== 'password_confirmation') {
            expect(res.body).to.have.property(key).equal(data[key]);
          }
        });
        expect(res.status).to.eq(201);
        expect(res).to.have.header('x-auth');
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
        expect(res.body.error).to.have.property('password');
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
        expect(res.body.error).to.have.property('message');
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
        expect(res.body.error).to.have.property('email');
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
        expect(res.body.error).to.have.property('password');
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
        expect(res.body.error).to.have.property('last_name');
        expect(res.body.message).to.eq('Name or email is too long');
        done();
      });
    });
    it('should return error if user email or phone has been used', (done) => {
      UserModel.create(
        {
          email: 'peter@gmail.com',
          first_name: 'Anthonia',
          last_name: 'Tyonum',
          password: 'password',
          address: 'my address',
          phone: '09029382393',
          account_number: '2081769837',
          bank: 'UBA',
          password_confirmation: 'password',
        },
      );
      const data = {
        email: 'peter@gmail.com',
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
        expect(res.body.error).to.have.property('phone');
        expect(res.body.message).to.eq('User with given email or phone already exist');
        done();
      });
    });
  });
  describe('User Signin', () => {
    it('should return error 400 if user did not supply email and/or password', (done) => {
      const data = {
        email: 'johndoe@google.dev',
        password: '',
      };
      chai.request(server).post(loginUrl).send(data).end((req, res) => {
        expect(res.status).to.eq(400);
        expect(res.body.error).to.have.property('email');
        expect(res.body.message).to.eq('Invalid login credentials');
        done();
      });
    });

    it('should return error 404 if user email is not found', (done) => {
      UserModel.create(
        {
          email: 'peter@gmail.com',
          first_name: 'Anthonia',
          last_name: 'Tyonum',
          password: 'password',
          address: 'my address',
          phone: '09029382393',
          account_number: '2081769837',
          bank: 'UBA',
          password_confirmation: 'password',
        },
      );
      const data = {
        email: 'johndoe@gmail.com',
        password: 'password',
      };
      chai.request(server).post(loginUrl).send(data).end((req, res) => {
        expect(res.status).to.eq(404);
        expect(res.body.error).to.have.property('id');
        expect(res.body.message).to.eq('Invalid login credentials');
        done();
      });
    });

    it('should return error 401 if password is incorrect for given email', () => {
      UserModel.create(
        {
          email: 'peter@gmail.com',
          first_name: 'Anthonia',
          last_name: 'Tyonum',
          password: 'password',
          address: 'my address',
          phone: '09029382393',
          account_number: '2081769837',
          bank: 'UBA',
          password_confirmation: 'password',
        },
      );
      const data = {
        email: 'peter@gmail.com',
        password: 'pasword',
      };

      chai.request(server).post(loginUrl).send(data).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.error).to.have.property('password');
        expect(res.body.message).to.eq('Wrong username/password');
      })
        .catch((error) => {
          throw error;
        });
    });

    it('should return a header with token and credentials if password and email are correct', () => {
      const data = {
        email: 'peter@gmail.com',
        password: 'password',
      };
      chai.request(server).post(loginUrl).send(data).then((res) => {
        expect(res.status).to.eq(200);
        expect(res).to.have.header('x-auth');
        expect(res.body).to.have.property('first_name');
        expect(res.body).to.have.property('last_name');
        expect(res.body).to.have.property('email');
      })
        .catch((error) => {
          throw error;
        });
    });
  });
});
