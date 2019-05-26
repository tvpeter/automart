import chai from 'chai';
import chaiHttp from 'chai-http';
import carsData from '../../carsData';
import server from '../../index';
import Cars from '../../models/CarModel';

const { expect } = chai;
chai.use(chaiHttp);
const adUrl = '/api/v1/car';
describe('Cars', () => {
  let token;
  const carsArray = () => {
    Cars.cars = carsData;
  };
  beforeEach(() => {
    token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTU1ODgyMTgwMDI5OCwicm9sZSI6ZmFsc2UsImlhdCI6MTU1ODgyMTcyNCwiZXhwIjoxNTU4ODY0OTI0fQ.SkdISgxuJXDme3k9cOH6gRQMKrykLhDiZy5c-IjoonE';
  });
  afterEach(() => {
    Cars.cars = [];
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
        status: '',
        price: '2.5m',
        state: 'new',
        manufacturer: '',
        model: 'es6 v',
        body_type: 'car',
        description: 'The car is still new',
        img: 'https://mydummyimgurl.com',
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
      carsArray();
      const data = {
        id: 1558731168820,
        owner: 1558730737306,
        created_on: '5/24/2019, 9:51:34 PM',
        state: 'New',
        status: 'available',
        price: '12000000',
        manufacturer: 'AUDI',
        model: 'SPORT UV',
        body_type: 'car',
        description: 'This is the description of the car',
        img: 'http://res.cloudinary.com/tvpeter/image/upload/v1558731093/vkjzwklvedrocyyerzyr.jpg',
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
        img: 'https://mydummyimgurl.com',
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
      carsArray();
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
        expect(res.body.error).to.eq('There are no cars available now. Check back');
        done();
      });
    });
  });
});
