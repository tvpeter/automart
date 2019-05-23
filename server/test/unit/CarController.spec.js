import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../index';
import Cars from '../../models/CarModel';

const { expect } = chai;
chai.use(chaiHttp);
const adUrl = '/api/v1/car';
describe('Cars', () => {
  let token;
  beforeEach(() => {
    token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTU1ODYwNTE2MjI2NCwicm9sZSI6ZmFsc2UsImlhdCI6MTU1ODYwNTExMCwiZXhwIjoxNTU4NjQ4MzEwfQ.aXgKnszap4nJibgte2_s2Cm6Ds3pUf83kU9RZOwKrT4';
  });
  afterEach(() => {
    token = '';
  });
  describe('Create Ad', () => {
    it('should create an advert if all required fields are supplied', (done) => {
      const data = {
        owner: 'owener',
        status: 'avaialable',
        price: '2.5m',
        state: 'new',
        manufacturer: 'BMW',
        model: 'es6 v',
        body_type: 'car',
        description: 'The car is still new',
        img: ['img', 'img2'],
      };
      chai.request(server).post(adUrl).set('x-auth', token).send(data)
        .end((err, res) => {
          expect(res.status).to.eq(201);
          const keys = Object.keys(data);
          keys.forEach((key) => {
            if (key !== 'owner' && key !== 'created_on' && key !== 'img') {
              expect(res.body.newCar).to.have.property(key).eq(data[key]);
            }
          });
          done();
        });
    });
    it('should return error 400 if request does not contain all required fields', (done) => {
      const data = {
        owner: 'owener',
        status: 'avaialable',
        price: '2.5m',
        state: 'new',
        manufacturer: '',
        model: 'es6 v',
        body_type: 'car',
        description: 'The car is still new',
        img: ['img', 'img2'],
      };
      chai.request(server).post(adUrl).set('x-auth', token).send(data)
        .end((err, res) => {
          expect(res.status).to.eq(400);
          expect(res.body.error).to.have.property('fields');
          expect(res.body.message).to.eq('Fill all required fields');
          done();
        });
    });

    it('should return error 401 if token is not provided', (done) => {
      const data = {
        owner: 'owner',
        status: 'avaialable',
        price: '2.5m',
        state: 'new',
        manufacturer: 'BMW',
        body_type: 'car',
        description: 'The car is still new',
        img: ['img', 'img2'],
      };
      chai.request(server).post(adUrl).send(data).end((err, res) => {
        expect(res.body.error).to.have.property('token');
        expect(res.status).to.eq(401);
        expect(res.body.message).to.eq('No authorization token provided');
        done();
      });
    });
    it('should return error 409 if user has the same car that is available', (done) => {
      Cars.createCar({
        owner: '1558605162264',
        status: 'avaialable',
        price: '2.5m',
        state: 'new',
        model: 'es6 v',
        manufacturer: 'BMW',
        body_type: 'car',
        description: 'The car is still new',
        img: ['img', 'img2'],
      });

      const data = {
        owner: '1558605162264',
        status: 'avaialable',
        price: '2.5m',
        state: 'new',
        model: 'es6 v',
        manufacturer: 'BMW',
        body_type: 'car',
        description: 'The car is still new',
        img: ['img', 'img2'],
      };
      chai.request(server).post(adUrl).set('x-auth', token).send(data)
        .end((err, res) => {
          expect(res.body.error).to.have.property('owner');
          expect(res.body.message).to.eq('You have a similar unsold car');
          expect(res.status).to.eq(409);
          done();
        });
    });
  });
});
