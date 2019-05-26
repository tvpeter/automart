import chai from 'chai';
import chaiHttp from 'chai-http';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import carsData from './carsData';
import server from '../index';
import Cars from '../models/CarModel';

const { expect } = chai;
chai.use(chaiHttp);
const adUrl = '/api/v1/car';
describe('Cars', () => {
  let token;
  const carsArray = () => {
    Cars.cars = carsData;
  };
  beforeEach(() => {
    token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTU1ODg2MjgyNDQ4NCwicm9sZSI6ZmFsc2UsImlhdCI6MTU1ODg2MjgzNywiZXhwIjoxNTU4OTA2MDM3fQ.4BwI9ZINfoSBpV7aDGMoKAyIMhDdGtfdlMlIcamEE4k';
  });
  afterEach(() => {
    Cars.cars = [];
    token = '';
  });
  describe('Create Ad', () => {
    it('should create an advert if all required fields are supplied', () => {
      request(server)
        .post(adUrl)
        .type('form')
        .set('x-auth', token)
        .attach('img', fs.readFileSync(path.resolve('/Users/tvpeter/Projects/automart/server/test/', './bmwx6d.jpg')))
        .field('status', 'available')
        .field('price', '25000000')
        .field('state', 'new')
        .field('model', 'E350')
        .field('manufacturer', 'BMW')
        .field('body_type', 'car')
        .field('description', 'This is additional description')
        .then((res) => {
          expect(res.status).to.eq(201);
          expect(res.body.data).to.have.property('status').eq('available');
          expect(res.body.data).to.have.property('state').eq('new');
          expect(res.body.data).to.have.property('model').eq('E350');
          expect(res.body.data).to.have.property('body_type').eq('car');
        })
        .catch((err) => {
          throw err;
        });
    });
    it('should return error 400 if request does not contain all required fields', () => {
      request(server)
        .post(adUrl)
        .type('form')
        .set('x-auth', token)
        .attach('img', fs.readFileSync(path.resolve('/Users/tvpeter/Projects/automart/server/test/', './bmwx6d.jpg')))
        .field('status', 'available')
        .field('price', '')
        .field('state', 'new')
        .field('model', 'E350')
        .field('manufacturer', 'BMW')
        .field('body_type', 'car')
        .field('description', 'This is additional description')
        .then((res) => {
          expect(res.status).to.eq(400);
          expect(res.body.message).to.eq('Fill all required fields');
        })
        .catch((err) => {
          throw err;
        });
    });
    it('should return error 400 if user has the same car that is available', () => {
      carsArray();
      request(server)
        .post(adUrl)
        .type('form')
        .set('x-auth', token)
        .attach('img', fs.readFileSync(path.resolve('/Users/tvpeter/Projects/automart/server/test/', './bmwx6d.jpg')))
        .field('owner', '1558730737306')
        .field('price', '12000000')
        .field('state', 'New')
        .field('status', 'available')
        .field('model', 'SPORT UV')
        .field('manufacturer', 'AUDI')
        .field('body_type', 'car')
        .field('description', 'This is additional description')
        .then((res) => {
          expect(res.status).to.eq(400);
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
          expect(res.body.message).to.eq('Upload images for your product');
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
        img: 'https://mydummyimgurl.com',
      };
      chai.request(server).post(adUrl).send(data).end((err, res) => {
        expect(res.status).to.eq(401);
        expect(res.body.message).to.eq('No authorization token provided');
        done();
      });
    });
  });

  // unsold cars according to manufacturer

  describe('view unsold cars by manufacturer', () => {
    it('should return all unsold cars by a manufacturer', (done) => {
      carsArray();
      const manufacturers = [
        'BMW', 'TOYOTA', 'NISSAN',
      ];
      chai.request(server).get(`/api/v1/cars/${manufacturers[0]}`)
        .end((err, res) => {
          expect(res.status).to.eq(200);
          expect(res.body).to.have.property('data').to.be.an('ARRAY');
          done();
        });
    });

    it('should return a custom error if no vehicle is found for the manufacturer', (done) => {
      carsArray();
      const manufacturers = [
        'BMW', 'TOYOTA', 'NISSAN',
      ];
      chai.request(server).get(`/api/v1/cars/${manufacturers[2]}`).end((err, res) => {
        expect(res.status).to.eq(404);
        expect(res.body.message).to.eq('There are no vehicles for the selected manufacturer');
        done();
      });
    });
  });

  // view all unsold cars
  describe('view all unsold cars', () => {
    it('should return all unsold cars', (done) => {
      carsArray();
      chai.request(server).get('/api/v1/cars/status/available').end((err, res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property('data').to.be.an('ARRAY');
        done();
      });
    });
    it('should return 404 when there are no unsold cars', (done) => {
      before(() => {
        Cars.cars = [];
      });
      chai.request(server).get('/api/v1/cars/status/available').end((err, res) => {
        expect(res.status).to.eq(404);
        expect(res.body.message).to.eq('There are no cars available now. Check back');
        done();
      });
    });
  });
});
