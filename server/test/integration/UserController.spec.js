import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../index';
import UserModel from '../../models/UserModel';
import usersData from '../usersData';

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
      chai.request(server).post(signupUrl).send(userDetails).then((res) => {
        // expect(res.data.email).to.eq(userDetails.email);
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
        expect(res.body.message).to.eq('User with given email or phone already exist');
        done();
      });
    });
    it('should return error if given phone has been used', (done) => {
      UserModel.create(
        {
          email: 'petertt@gmail.com',
          first_name: 'Peter',
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
        email: 'peterst@gmail.com',
        first_name: 'John',
        last_name: 'Tyonum',
        password: 'password',
        address: 'my address',
        phone: '09029382393',
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
    it('should return error 400 if user did not supply email and/or password', (done) => {
      const data = {
        email: 'johndoe@google.dev',
        password: '',
      };
      chai.request(server).post(loginUrl).send(data).then((res) => {
        expect(res.status).to.eq(400);
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
      chai.request(server).post(loginUrl).send(data).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.message).to.eq('Invalid login credentials');
        done();
      });
    });

    it('should return error 401 if password is incorrect for given email', (done) => {
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
        expect(res.body.message).to.eq('Wrong username/password');
        done();
      });
    });

    it('should return a header with token and credentials if password and email are correct', () => {
      UserModel.create(
        {
          email: 'peter@gmail.com',
          first_name: 'Anthonia',
          last_name: 'Tyonum',
          password: 'password',
          password_confirmation: 'password',
          address: 'my address',
          phone: '09023928389',
          account_number: '2081769837',
          bank: 'UBA',
        },
      );
      const data = {
        email: 'peter@gmail.com',
        password: 'password',
      };
      chai.request(server).post(loginUrl).send(data).then((res) => {
        expect(res.status).to.eq(200);
        expect(res).to.have.header('x-auth');
      })
        .catch((err) => {
          throw err;
        });
    });
  });

  // user change password
  describe('User sign in', () => {
    usersArray();
    const data = {
      currentPassword: 'password',
      newPassword: 'newpassword',
    };
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTU1OTEyMDQzMDg2OSwicm9sZSI6ZmFsc2UsImlhdCI6MTU1OTEyMDUzMSwiZXhwIjoxNTU5MTYzNzMxfQ.Nr8KPOJjgs-cPfOzfPYXs7u07eZ51BgkdsKdz9v60Iw';
    it('should return user with updated password', () => {
      chai.request(server).patch('/api/v1/user').set('x-auth', token).send(data)
        .then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.data).to.contain('password');
        })
        .catch((err) => {
          throw err;
        });
    });
    it('should return 404 if current password is not supplied', () => {
      chai.request(server).patch('/api/v1/user').set('x-auth', token).send({ newPassword: 'newpassword' })
        .then((res) => {
          expect(res.status).to.eq(404);
          expect(res.body.message).to.eq('Fill the required fields');
        })
        .catch((err) => {
          throw err;
        });
    });
    it('should return 401 if user is not logged in', () => {
      chai.request(server).patch('/api/v1/user').set('x-auth', token).send(data)
        .then((res) => {
          expect(res.status).to.eq(401);
          expect(res.body.message).to.eq('No authorization token provided');
        })
        .catch((err) => {
          throw err;
        });
    });
    it('should return 400 if current password is wrong', () => {
      chai.request(server).patch('/api/v1/user').set('x-auth', token).send({ currentPassword: 'password1', newPassword: 'anotherpassword' })
        .then((res) => {
          expect(res.status).to.eq(400);
          expect(res.body.message).to.eq('Wrong current password, use password reset link');
        })
        .catch((err) => {
          throw err;
        });
    });
  });
});
