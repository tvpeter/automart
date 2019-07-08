import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../index';
import db from '../../services/db';
import generateToken from '../../lib/generateToken';

const { expect } = chai;
const signupUrl = '/api/v1/auth/signup';
const loginUrl = '/api/v1/auth/signin';
const changePasswordUrl = '/api/v1/user';
const allUsersUrl = '/api/v1/users';
chai.use(chaiHttp);

describe('User', () => {
  const dataValues = () => ({
    email: `${Math.random().toString(36).substring(2, 15)}@gmail.com`,
    first_name: `Fi${Math.random().toString(36).substring(2, 15)}`,
    last_name: `La${Math.random().toString(36).substring(2, 15)}`,
    password: 'password',
    password_confirmation: 'password',
    address: 'my address',
    phone: `${Math.floor(Math.random() * 10000000000)}`,
    account_number: 20903928394,
    bank: 'UBA',
  });

  const userEmail = async () => {
    const email = await db.query('SELECT email FROM users limit 1');
    return email.rows[0].email;
  };

  const genToken = async () => {
    const { rows } = await db.query('SELECT id FROM users limit 1');
    const { id } = rows[0];
    return generateToken(id, false);
  };
  const adminToken = async () => {
    const { rows } = await db.query('SELECT id FROM users limit 1');
    const { id } = rows[0];
    return generateToken(id, true);
  };

  // before(async () => {
  // eslint-disable-next-line max-len
  //   await db.query('CREATE TABLE IF NOT EXISTS users ( id BIGINT PRIMARY KEY, email VARCHAR(30) NOT NULL UNIQUE, first_name VARCHAR(30) NOT NULL, last_name VARCHAR(30) NOT NULL, password VARCHAR(140) NOT NULL, address VARCHAR(400) NOT NULL, isAdmin BOOLEAN NOT NULL DEFAULT FALSE, phone VARCHAR(16) NOT NULL UNIQUE, account_number BIGINT NOT NULL, bank VARCHAR(20) NOT NULL, status VARCHAR(10) NOT NULL DEFAULT \'active\', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
  // eslint-disable-next-line max-len
  //   await db.query('CREATE TABLE IF NOT EXISTS cars (id BIGINT PRIMARY KEY,  owner BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, created_on TIMESTAMPTZ NOT NULL DEFAULT NOW(), state VARCHAR(8) NOT NULL, status VARCHAR(15) NOT NULL DEFAULT \'available\', price NUMERIC(10, 2) NOT NULL CHECK(price > 0), manufacturer VARCHAR(30) NOT NULL, model VARCHAR(30) NOT NULL, body_type VARCHAR(30) NOT NULL, description TEXT NOT NULL, img VARCHAR(150) NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW() )');
  // eslint-disable-next-line max-len
  //   await db.query('CREATE TABLE IF NOT EXISTS orders (id BIGINT PRIMARY KEY, buyerId BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,  carId BIGINT NOT NULL REFERENCES cars(id) ON DELETE RESTRICT, sellerId BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT, price NUMERIC NOT NULL CHECK(price > 0), status VARCHAR(20) NOT NULL DEFAULT \'pending\', date TIMESTAMPTZ NOT NULL DEFAULT NOW(), priceOffered NUMERIC NOT NULL CHECK(priceOffered > 0), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
  // eslint-disable-next-line max-len
  //   await db.query('CREATE TABLE IF NOT EXISTS flags (id BIGINT PRIMARY KEY, carId BIGINT REFERENCES cars(id) ON DELETE RESTRICT, created_on TIMESTAMPTZ NOT NULL DEFAULT NOW(), reason VARCHAR(20) NOT NULL, description TEXT, reportedBy BIGINT NOT NULL REFERENCES users(id), status VARCHAR(20) NOT NULL DEFAULT \'pending\', severity VARCHAR(20) NOT NULL DEFAULT \'minor\') ');
  //   const data = await dataValues();
  //   await chai.request(server).post(signupUrl).send(data);
  //   await chai.request(server).post(signupUrl).send(data);
  // });

  after(async () => {
    await db.query('DELETE FROM flags');
    await db.query('DELETE FROM orders');
    await db.query('DELETE FROM cars');
    await db.query('DELETE FROM users');
  });

  describe('User create', () => {
    it('should return a new user with the supplied properties', async () => {
      const userDetails = dataValues();
      const res = await chai.request(server).post(signupUrl).send(userDetails);
      expect(res.status).to.eq(201);
      expect(res.body.data).to.have.property('token');
      expect(res.body.data).to.have.property('id');
      expect(res.body.data.email).to.eq(userDetails.email);
      expect(res.body.data.phone).to.eq(userDetails.phone);
      expect(res.body.data.status).to.eq('active');
    });

    it('should return error if password and its confirmation does not match', async () => {
      const data = dataValues();
      data.password_confirmation = 'password1';
      const res = await chai.request(server).post(signupUrl).send(data);
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('Password and confirmation does not match');
    });

    it('should return error if all required fields are not supplied', async () => {
      const data = dataValues();
      data.first_name = '';
      const res = await chai.request(server).post(signupUrl).send(data);
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('Fill all required fields with a valid email address');
    });

    it('should return error if invalid email address is supplied', async () => {
      const data = dataValues();
      data.email = `${Math.random().toString(36).substring(2, 15)}gmail.com`;
      const res = await chai.request(server).post(signupUrl).send(data);
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('Fill all required fields with a valid email address');
    });

    it('should return error if length of password is less than 6 characters', async () => {
      const data = dataValues();
      data.password = 'passw';
      data.password_confirmation = 'passw';
      const res = await chai.request(server).post(signupUrl).send(data);
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('Ensure password is atleast 6 characters, name and email not more than 30 characters');
    });

    it('should return error if last name or first name or email is more than 30 characters', (done) => {
      const data = dataValues();
      data.last_name = 'Lastnameofsomeonewithalonganmethatis';
      chai.request(server).post(signupUrl).send(data).end((err, res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.eq('Ensure password is atleast 6 characters, name and email not more than 30 characters');
        done();
      });
    });

    it('should return error if user email has been used', async () => {
      const { rows } = await db.query('SELECT email from users limit 1');
      const data = dataValues();
      data.email = `${rows[0].email}`;
      chai.request(server).post(signupUrl).send(data).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.eq('User with given email or phone already exist');
      });
    });

    it('should return error if given phone has been used', async () => {
      const { rows } = await db.query('SELECT phone from users limit 1');
      const data = dataValues();
      data.phone = `${rows[0].phone}`;

      const res = await chai.request(server).post(signupUrl).send(data);
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('User with given email or phone already exist');
    });
  });

  // user sign in
  describe('User Signin', () => {
    it('should login a user and set token in the header', async () => {
      const email = await userEmail();
      const data = {
        email: `${email}`,
        password: 'password',
      };
      const res = await chai.request(server).post(loginUrl).send(data);
      expect(res.status).to.eq(200);
      expect(res).to.have.header('x-auth');
      expect(res.body.data).to.have.property('email').eq(data.email);
    });

    it('should return error 400 if user did not supply password', async () => {
      const email = await userEmail();

      const res = await chai.request(server).post(loginUrl).send({ email });
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('Invalid login credentials');
    });

    it('should return error 404 if user email is not found', async () => {
      const data = {
        email: 'ooooookoook@email.com',
        password: 'password',
      };
      const res = await chai.request(server).post(loginUrl).send(data);
      expect(res.status).to.eq(404);
      expect(res.body.message).to.eq('Wrong username/password');
    });

    it('should return error 401 if password is incorrect for given username', async () => {
      const email = await userEmail();
      const data = {
        email: `${email}`,
        password: 'pasword',
      };

      const res = await chai.request(server).post(loginUrl).send(data);
      expect(res.status).to.eq(401);
      expect(res.body.message).to.eq('Wrong username/password');
    });
  });

  // user change password
  describe('User change password', () => {
    it('should return user with updated password', async () => {
      const token = await genToken();

      const res = await chai.request(server).patch(changePasswordUrl).set('x-auth', token)
        .send({ currentPassword: 'password', newPassword: 'newpassword' });
      expect(res.status).to.eq(200);
      expect(res.body.data).to.be.an('Object');
    });

    it('should return 400 if current password is wrong', async () => {
      const token = await genToken();

      const res = await chai.request(server).patch('/api/v1/user').set('x-auth', token)
        .send({ currentPassword: 'password1', newPassword: 'anotherpassword' });
      expect(res.body.status).to.eq(400);
      expect(res.body.message).to.eq('Wrong current password, use password reset link');
    });

    it('should return 400 if current password is not supplied', async () => {
      const token = await genToken();

      const res = await chai.request(server).patch('/api/v1/user').set('x-auth', token)
        .send({ newPassword: 'newpassword' });
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('Fill the required fields');
    });
    it('should return error 401 if user is not logged in', async () => {
      const res = await chai.request(server).patch('/api/v1/user').send({ currentPassword: 'password', newPassword: 'newpassword' });
      expect(res.status).to.eq(401);
      expect(res.body.message).to.eq('No authorization token provided');
    });
  });

  // admin get all users
  describe('get all users', () => {
    it('should return all registered users', async () => {
      const userDetails = dataValues();
      await chai.request(server).post(signupUrl).send(userDetails);
      const token = await adminToken();
      const res = await chai.request(server).get(allUsersUrl).set('x-auth', token);
      expect(res.status).to.eq(200);
      expect(res.body.data).to.be.an('Array');
    });

    it('should return error 401 if user is not admin', async () => {
      const token = await genToken();

      const res = await chai.request(server).get(allUsersUrl).set('x-auth', token);
      expect(res.status).to.eq(401);
      expect(res.body.message).to.eq('You dont have the permission to access this resource');
    });
    it('should return error 401 if user is not logged in', async () => {
      const res = await chai.request(server).get('/api/v1/users');
      expect(res.status).to.eq(401);
      expect(res.body.message).to.eq('No authorization token provided');
    });
  });

  // make user admin
  describe('Admin make user admin', () => {
    it('Should make a user an admin', async () => {
      const token = await adminToken();

      const { rows } = await db.query('SELECT id FROM users limit 2');
      const { id } = rows[1];
      const res = await chai.request(server).patch(`/api/v1/user/${id}`).set('x-auth', token);
      expect(res.status).to.eq(200);
      expect(res.body.data).to.have.property('id').eq(id);
      // eslint-disable-next-line no-unused-expressions
      expect(res.body.data).to.have.property('isadmin').to.be.true;
    });

    it('Should return error 401 if admin is not logged in', async () => {
      const { rows } = await db.query('SELECT id FROM users limit 2');
      const { id } = rows[1];

      const res = await chai.request(server).patch(`/api/v1/user/${id}`);
      expect(res.status).to.eq(401);
      expect(res.body.message).to.eq('No authorization token provided');
    });

    it('Should return error 404 if user is not found', async () => {
      const token = await adminToken();
      const res = await chai.request(server).patch('/api/v1/user/1212121212121').set('x-auth', token);
      expect(res.status).to.eq(404);
      expect(res.body.message).to.eq('User not found or inactive');
    });
  });

  // // user logout
  // describe('User logout', () => {
  //   it('should log a user out of the app', async () => {
  //     const token = await genToken();
  //     const res = chai.request(server).get('/api/v1/auth/logout').set('x-auth', token);
  //     expect(res.status).to.eq(200);
  //     // eslint-disable-next-line no-unused-expressions
  //     expect(res).not.to.have.header('x-auth');
  //   });
  // });

  describe('Admin disable a user', () => {
    it('should disable a user', async () => {
      const token = await adminToken();
      const { rows } = await db.query('SELECT id FROM users limit 2');
      const { id } = rows[1];
      const res = await chai.request(server).patch(`/api/v1/users/${id}`).set('x-auth', token);
      expect(res.status).to.eq(200);
      expect(res.body.data.id).to.eq(id);
      expect(res.body.data.status).to.eq('disabled');
    });

    it('should return error 404 if user is not found', async () => {
      const token = await adminToken();
      const res = await chai.request(server).patch('/api/v1/users/1212121212121').set('x-auth', token);
      expect(res.status).to.eq(404);
      expect(res.body.message).to.eq('User not found or inactive');
    });
  });
});
