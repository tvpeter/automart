import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../index';
// import User from '../../controllers/UserController';

const { expect } = chai;
chai.use(chaiHttp);
const adUrl = '/api/v1/car';
describe('Cars', () => {
  describe('Create Ad', () => {
    it('should create an advert if all required fields are supplied', (done) => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTU1ODYwNTE2MjI2NCwicm9sZSI6ZmFsc2UsImlhdCI6MTU1ODYwNTExMCwiZXhwIjoxNTU4NjQ4MzEwfQ.aXgKnszap4nJibgte2_s2Cm6Ds3pUf83kU9RZOwKrT4';
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
  });
});
