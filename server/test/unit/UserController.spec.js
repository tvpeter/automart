import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../index';

const { expect } = chai;
chai.use(chaiHttp);
describe('User create', () => {
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
    chai.request(server).post('/api/v1/users').send(data).end((err, res) => {
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
    chai.request(server).post('/api/v1/users').send(data).end((err, res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('Fill all required fields');
      expect(res.body.error).to.have.property('message');
      done();
    });
  });

  it('should return a new user with the supplied properties', (done) => {
    const data = {
      email: 'peter@gmail.com',
      first_name: 'Anthonia',
      last_name: 'Tyonum',
      password: 'password',
      password_confirmation: 'password',
      address: 'my address',
      phone: '08137277480',
      account_number: '2081769837',
      bank: 'UBA',
    };
    chai.request(server).post('/api/v1/users').send(data).end((err, res) => {
      expect(res.status).to.eq(201);
      const keys = Object.keys(data);
      keys.forEach((key) => {
        if (key !== 'password_confirmation') {
          expect(res.body).to.have.property(key).equal(data[key]);
        }
      });
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
    chai.request(server).post('/api/v1/users').send(data).end((err, res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('Invalid / empty email supplied');
      expect(res.body.error).to.have.property('email');
      done();
    });
  });
});
