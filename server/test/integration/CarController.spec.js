import chai from 'chai';
import chaiHttp from 'chai-http';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import carsData from '../carsData';
import server from '../../index';
import Cars from '../../models/CarModel';
import UserModel from '../../models/UserModel';

const loc = path.resolve('./');

const { expect } = chai;
chai.use(chaiHttp);
const adUrl = '/api/v1/car';
describe('Cars', () => {
  let token;
  const carsArray = () => {
    Cars.cars = carsData;
  };
  beforeEach(() => {
    token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTU1ODg2MTY4ODUwMywicm9sZSI6ZmFsc2UsImlhdCI6MTU1OTEzMTIxOSwiZXhwIjoxNTU5MTc0NDE5fQ.GXBS-jKCrdmVBenUyE-CsQPL9MlywiF9GT0Aiz6CotY';
  });
  afterEach(() => {
    Cars.cars = [];
    token = '';
    UserModel.users = [];
  });
  describe('Create Ad', () => {
    it('should create an advert if all required fields are supplied', () => {
      request(server)
        .post(adUrl)
        .type('form')
        .set('x-auth', token)
        .attach('img', fs.readFileSync(path.join(loc, '/server/test/bmwx6d.jpg')))
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
        .attach('img', fs.readFileSync(path.join(loc, '/server/test/bmwx6d.jpg')))
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
        .attach('img', fs.readFileSync(path.join(loc, '/server/test/bmwx6d.jpg')))
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

  describe('view available cars by manufacturer', () => {
    const manufacturers = [
      'BMW', 'TOYOTA', 'FIAT',
    ];
    it('should return all unsold cars by a manufacturer', (done) => {
      carsArray();
      chai.request(server).get(`/api/v1/car/manufacturer/${manufacturers[0]}`)
        .end((err, res) => {
          expect(res.status).to.eq(200);
          expect(res.body).to.have.property('data').to.be.an('ARRAY');
          done();
        });
    });

    it('should return a custom error if no vehicle is found for the manufacturer', (done) => {
      carsArray();
      chai.request(server).get(`/api/v1/car/manufacturer/${manufacturers[2]}`).end((err, res) => {
        expect(res.status).to.eq(404);
        expect(res.body.message).to.eq('There are no cars for the selected manufacturer');
        done();
      });
    });
  });

  // unsold cars by body type

  describe('view available cars by body type', () => {
    const bodyType = [
      'SUV', 'SEDAN', 'JEEP', 'PICKUP', 'VAN', 'WAGON', 'CONVERTIBLE', 'HATCHBACK',
    ];
    it('should return all unsold cars by body type', (done) => {
      carsArray();

      chai.request(server).get(`/api/v1/car/bodytype/${bodyType[1]}`)
        .end((err, res) => {
          expect(res.status).to.eq(200);
          expect(res.body).to.have.property('data').to.be.an('ARRAY');
          done();
        });
    });
    it('should return error 404 if cars of given body type are not found', (done) => {
      carsArray();
      chai.request(server).get(`/api/v1/car/bodytype/${bodyType[2]}`)
        .end((err, res) => {
          expect(res.status).to.eq(404);
          expect(res.body.message).to.eq('There are no cars for the selected body_type');
          done();
        });
    });
  });

  // view available cars by state (used, new)
  describe('view available cars by state', () => {
    const state = [
      'Used', 'New',
    ];
    it('should return all available cars by state -used', (done) => {
      carsArray();
      chai.request(server).get(`/api/v1/car/state/${state[0]}`)
        .end((err, res) => {
          expect(res.status).to.eq(200);
          expect(res.body).to.have.property('data').to.be.an('ARRAY');
          expect(res.body.data[0]).to.have.property('state').eq(state[0]);
          done();
        });
    });
    it('should return all available cars by state -new', (done) => {
      carsArray();
      chai.request(server).get(`/api/v1/car/state/${state[1]}`)
        .end((err, res) => {
          expect(res.status).to.eq(200);
          expect(res.body).to.have.property('data').to.be.an('ARRAY');
          expect(res.body.data[0]).to.have.property('state').eq(state[1]);
          done();
        });
    });
    it('should return error 404 if cars are not found for selected state -old', (done) => {
      carsArray();
      chai.request(server).get('/api/v1/car/state/old')
        .end((err, res) => {
          expect(res.status).to.eq(404);
          expect(res.body.message).to.eq('There are no cars for the selected state');
          done();
        });
    });
  });

  // view all unsold cars
  describe('view all available cars', () => {
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
  // get ad by id
  describe('Get ad by id', () => {
    it('should return a single ad details', (done) => {
      carsArray();
      const id = 1558731356445;
      chai.request(server).get(`/api/v1/car/${id}`).end((err, res) => {
        expect(res.status).to.eq(200);
        expect(res.body.data.id).to.eq(id);
        done();
      });
    });

    it('should return error 400 with custom message if supplied id is not valid', (done) => {
      carsArray();
      const id = 12345678901;
      chai.request(server).get(`/api/v1/car/${id}`).end((err, res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.eq('Invalid ad id');
        done();
      });
    });

    it('should return error 404 with custom message if ad is not found', (done) => {
      carsArray();
      const id = 9293837414384;
      chai.request(server).get(`/api/v1/car/${id}`).end((err, res) => {
        expect(res.status).to.eq(404);
        expect(res.body.message).to.eq('The ad you are looking for is no longer available');
        done();
      });
    });
  });
  // seller update ad price
  describe('Seller update ad price', () => {
    it('should return the ad with updated price', async () => {
      carsArray();
      const reqData = {
        id: 1558943760215,
        price: 2400000,
        description: 'This is to add further description',
      };
      const res = await chai.request(server).patch(`/api/v1/car/${reqData.adId}`).set('x-auth', token).send(reqData);
      expect(res.body.data.price).to.eq(reqData.price);
      expect(res.status).to.eq(200);
      expect(res.body.data.description).to.eq(reqData.description);
    });
    it('should return error 404 if ad is not found', () => {
      carsArray();
      const reqData = {
        id: 9558943760204,
        price: 2400000,
        description: 'This is to add further description',
      };
      chai.request(server).patch(`/api/v1/car/${reqData.adId}`).set('x-auth', token).send(reqData)
        .then((res) => {
          expect(res.status).to.eq(404);
          expect(res.body.message).to.eq('The advert you want to update is not available');
        });
    });
    it('should return error 401 if another user attempts update an ad', () => {
      carsArray();
      const reqData = {
        id: 1558943760215,
        price: 2400000,
        description: 'This is to add further description',
      };
      const tkk = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTU1ODg2MjgyNDQ4NCwicm9sZSI6ZmFsc2UsImlhdCI6MTU1OTAxMTY5NywiZXhwIjoxNTU5MDU0ODk3fQ.lF07r6InQ7Lqb0YPO6udIlIyBRio3bMGIcbBEjzXR3U';
      chai.request(server).patch(`/api/v1/car/${reqData.adId}`).set('x-auth', tkk).send(reqData)
        .then((res) => {
          expect(res.status).to.eq(404);
          expect(res.body.message).to.eq('The advert you want to update is not available');
        });
    });
    it('should return error 401 if user is not logged in', () => {
      carsArray();
      const reqData = {
        id: 1558943760215,
        price: 2400000,
        description: 'This is to add further description',
      };
      chai.request(server).patch(`/api/v1/car/${reqData.adId}`).send(reqData)
        .then((res) => {
          expect(res.status).to.eq(401);
          expect(res.body.message).to.eq('No authorization token provided');
        });
    });
  });
  // get single ad
  describe('User can view single ad', () => {
    it('should return full details of an ad', (done) => {
      carsArray();
      const id = 1558731356445;
      chai.request(server).get(`/api/v1/car/${id}`).end((err, res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.id).to.eq(id);
        done();
      });
    });
    it('should return error 404 if ad is not found', (done) => {
      carsArray();
      const id = 1558731656445;
      chai.request(server).get(`/api/v1/car/${id}`).end((err, res) => {
        expect(res.status).to.eq(404);
        expect(res.body.message).to.eq('The ad you are looking for is no longer available');
        done();
      });
    });
    it('should return error 400 if invalid ad id is supplied', (done) => {
      carsArray();
      const id = 155873165645;
      chai.request(server).get(`/api/v1/car/${id}`).end((err, res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.eq('Invalid ad id');
        done();
      });
    });
  });
  // get ads within a price range
  describe('Get ads within a price range', () => {
    it('should return an array of ads within a price range', (done) => {
      carsArray();
      chai.request(server).get('/api/v1/car/price/?min=5000000&max=8000000').end((err, res) => {
        expect(res.status).to.eq(200);
        expect(res.body.data).to.be.an('ARRAY');
        done();
      });
    });

    it('Minimum should default to 0 if not supplied', (done) => {
      carsArray();
      chai.request(server).get('/api/v1/car/price/?max=8000000').end((err, res) => {
        expect(res.status).to.eq(200);
        expect(res.body.data).to.be.an('ARRAY');
        done();
      });
    });

    it('Maximum should default to 24000000 if not supplied', (done) => {
      carsArray();
      chai.request(server).get('/api/v1/car/price/?min=2000000').end((err, res) => {
        expect(res.status).to.eq(200);
        expect(res.body.data).to.be.an('ARRAY');
        done();
      });
    });
    it('Should return error 404 if no ads are found in the given range', (done) => {
      carsArray();
      chai.request(server).get('/api/v1/car/price/?min=12000000&max=24000000').end((err, res) => {
        expect(res.status).to.eq(404);
        expect(res.body.message).to.eq('There are no cars within the selected range');
        done();
      });
    });
  });
});
