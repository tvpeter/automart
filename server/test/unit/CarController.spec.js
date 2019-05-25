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
    token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTU1ODc2OTc3NDQ5NCwicm9sZSI6ZmFsc2UsImlhdCI6MTU1ODc2OTcxMiwiZXhwIjoxNTU4ODEyOTEyfQ.GcU_qJiP9A8Y65c8C4LBYzlDgQeh8P7vAe7p2JyMSHg';
  });
  afterEach(() => {
    token = '';
  });
  describe('Create Ad', () => {
    it('should create an advert if all required fields are supplied', () => {
      const data = {
        status: 'avaialable',
        price: '2.5m',
        state: 'new',
        model: 'es6 v',
        manufacturer: 'BMW',
        body_type: 'car',
        description: 'The car is still new',
        img: 'https://mydummyimgurl.com',
      };
      chai.request(server).post(adUrl)
        .set('x-auth', token)
        .then((res) => {
          expect(res.status).to.eq(201);
          expect(res.body.newCar).to.have.property('status').eq(data.status);
          expect(res.body.newCar).to.have.property('state').eq(data.state);
          expect(res.body.newCar).to.have.property('model').eq(data.model);
          expect(res.body.newCar).to.have.property('body_type').eq(data.body_type);
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
        img: 'imgurl',
      };
      chai.request(server).post(adUrl).set('x-auth', token).send(data)
        .end((err, res) => {
          expect(res.status).to.eq(400);
          expect(res.body.error).to.have.property('fields');
          expect(res.body.message).to.eq('Fill all required fields');
          done();
        });
    });
    it('should return error 409 if user has the same car that is available', () => {
      Cars.createCar({
        owner: '1558605162264',
        status: 'avaialable',
        price: '2.5m',
        state: 'new',
        model: 'es6 v',
        manufacturer: 'BMW',
        body_type: 'car',
        description: 'The car is still new',
        img: 'imgurl',
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
        img: 'imgurl',
      };
      chai.request(server).post(adUrl).set('x-auth', token)
        .send(data)
        .then((res) => {
          expect(res.status).to.eq(409);
          expect(res.body.error).to.have.property('owner');
          expect(res.body.message).to.eq('You have a similar unsold car');
        })
        .catch((err) => {
          throw err;
        });
    });
    it('should return error 400 if there is no image', (done) => {
      const data = {
        owner: '1558605162264',
        status: 'avaialable',
        price: '2.5m',
        state: 'new',
        model: 'es6 v',
        manufacturer: 'BMW',
        body_type: 'car',
        description: 'The car is still new',
      };
      chai.request(server).post(adUrl).set('x-auth', token).send(data)
        .end((err, res) => {
          expect(res.status).to.eq(400);
          expect(res.body.error).to.have.property('file');
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
        img: 'imgurl',
      };
      chai.request(server).post(adUrl).send(data).end((err, res) => {
        expect(res.body.error).to.have.property('token');
        expect(res.status).to.eq(401);
        expect(res.body.message).to.eq('No authorization token provided');
        done();
      });
    });
  });

  // unsold cars according to manufacturer

  describe('view unsold cars by manufacturer', () => {
    it('should return all unsold cars by a manufacturer', (done) => {
      const manufacturers = [
        'BMW', 'TOYOTA', 'NISSAN',
      ];
      chai.request(server).get(`/api/v1/cars/${manufacturers[0]}`)
        .end((err, res) => {
          expect(res.status).to.eq(200);
          expect(res.body).to.have.property('cars').to.be.an('ARRAY');
          done();
        });
    });
  });
});
