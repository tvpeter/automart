import chai from 'chai';
import chaiHttp from 'chai-http';
// import request from 'supertest';
// import fs from 'fs';
import path from 'path';
import carsData from '../carsData';
import server from '../../index';
import Cars from '../../models/CarModel';
import UserModel from '../../models/UserModel';
import generateToken from '../../lib/generateToken';
import usersData from '../usersData';

const loc = path.resolve('./');

const { expect } = chai;
chai.use(chaiHttp);
const adUrl = '/api/v1/car';
describe('Cars', () => {
  const carsArray = () => {
    Cars.cars = carsData;
  };
  const usersArray = () => {
    UserModel.users = usersData;
  };
  describe('Create Ad', () => {
    it('should return error 400 if request does not contain all required fields', (done) => {
      usersArray();
      const user = usersData[0];
      user.isAdmin = false;
      const token = generateToken(user.id, user.isAdmin);
      chai.request(server)
        .post(adUrl)
        .type('form')
        .set('x-auth', token)
        .attach('img', path.join(loc, '/server/test/bmwx6d.jpg'))
        .field('status', 'available')
        .field('price', '')
        .field('state', 'new')
        .field('model', 'E350')
        .field('manufacturer', 'BMW')
        .field('body_type', 'car')
        .field('description', 'This is additional description')
        .end((err, res) => {
          expect(res.body.status).to.eq(400);
          expect(res.body.message).to.eq('Fill all required fields');
          done();
        });
    });

    it('should return error 400 if user has the same car that is available', (done) => {
      usersArray();
      const user = usersData[0];
      user.isAdmin = false;
      const token = generateToken(user.id, user.isAdmin);
      carsData[0].owner = user.id;
      const data = carsData[0];
      carsArray();
      chai.request(server)
        .post(adUrl)
        .type('form')
        .set('x-auth', token)
        .attach('img', path.join(loc, '/server/test/bmwx6d.jpg'))
        .field('owner', data.owner)
        .field('price', data.price)
        .field('state', data.state)
        .field('status', data.status)
        .field('model', data.model)
        .field('manufacturer', data.manufacturer)
        .field('body_type', data.body_type)
        .field('description', 'This is additional description')
        .end((err, res) => {
          expect(res.status).to.eq(400);
          expect(res.body.message).to.eq('You have a similar unsold car');
          done();
        });
    });
    it('should return error 400 if there is no image', (done) => {
      usersArray();
      const user = usersData[0];
      user.isAdmin = false;
      const token = generateToken(user.id, user.isAdmin);
      const data = {
        owner: usersData[1].id,
        status: 'avaialable',
        price: 2500000,
        state: 'new',
        model: 'es6 v',
        manufacturer: 'BMW',
        body_type: 'Sedan',
        description: 'The car is still new',
      };
      chai.request(server).post(adUrl).set('x-auth', token).send(data)
        .end((err, res) => {
          expect(res.body.message).to.eq('Upload images for your product');
          expect(res.status).to.eq(400);
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
          expect(res.body).to.have.property('data').to.be.an('Array');
          done();
        });
    });

    it('should return a custom error if no vehicle is found for the manufacturer', (done) => {
      carsArray();
      chai.request(server).get('/api/v1/car/manufacturer/tyonum').end((err, res) => {
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
          expect(res.body).to.have.property('data').to.be.an('Array');
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
      'USED', 'New',
    ];
    it('should return all available cars by state -used', (done) => {
      carsArray();
      chai.request(server).get(`/api/v1/car/state/${state[0]}`)
        .end((err, res) => {
          expect(res.status).to.eq(200);
          expect(res.body).to.have.property('data').to.be.an('ARRAY');
          expect(res.body.data[0]).to.have.property('state').eq('Used');
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
      Cars.cars = [];
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
      const { id } = carsData[0];
      chai.request(server).get(`/api/v1/car/${id}`).end((err, res) => {
        expect(res.status).to.eq(200);
        expect(res.body.data.id).to.eq(id);
        done();
      });
    });

    it('should return error 400 with custom message if supplied id is not valid', (done) => {
      carsArray();
      chai.request(server).get('/api/v1/car/12345678901').end((err, res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.eq('Invalid ad id');
        done();
      });
    });

    it('should return error 404 with custom message if ad is not found', (done) => {
      carsArray();
      chai.request(server).get('/api/v1/car/9293837414384').end((err, res) => {
        expect(res.status).to.eq(404);
        expect(res.body.message).to.eq('The ad you are looking for is no longer available');
        done();
      });
    });
  });
  // seller update ad price
  describe('Seller update ad price', () => {
    it('should return the ad with updated price', async () => {
      const user = usersData[0];
      user.isAdmin = false;
      const token = await generateToken(user.id, user.isAdmin);
      carsData[0].owner = user.id;
      const reqData = {
        id: carsData[0].id,
        price: 2400000,
        description: 'This is to add further description',
      };
      const res = await chai.request(server).patch(`/api/v1/car/${reqData.adId}`).set('x-auth', token).send(reqData);
      expect(res.body.data.price).to.eq(reqData.price);
      expect(res.status).to.eq(200);
      expect(res.body.data.description).to.eq(reqData.description);
    });

    it('should return error 404 if ad is not found', () => {
      const user = usersData[0];
      user.isAdmin = false;
      const token = generateToken(user.id, user.isAdmin);
      Cars.cars = [];
      const reqData = {
        id: 8118278392839,
        price: 2400000,
        description: 'This is to add further description',
      };
      chai.request(server).patch(`/api/v1/car/${reqData.adId}`)
        .set('x-auth', token).send(reqData)
        .end((err, res) => {
          expect(res.status).to.eq(404);
          expect(res.body.message).to.eq('The advert you want to update is not available');
        });
    });
    it('should return error 401 if another user attempts update an ad', () => {
      carsArray();
      usersArray();
      const user = usersData[0];
      user.isAdmin = false;
      const token = generateToken(user.id, user.isAdmin);
      const price = carsData[0].price - 1000000;
      carsData[0].owner = usersData[1].id;
      const reqData = {
        id: carsData[0].id,
        price,
        description: 'This is to add further description',
      };

      chai.request(server).patch(`/api/v1/car/${reqData.adId}`).set('x-auth', token)
        .send(reqData)
        .end((err, res) => {
          expect(res.status).to.eq(401);
          expect(res.body.message).to.eq('You do not have the permission to update this data');
        });
    });
    it('should return error 401 if user is not logged in', () => {
      carsArray();
      const reqData = {
        id: carsData[0].id,
        price: carsData[0].price - 100,
        description: 'This is to add further description',
      };
      chai.request(server).patch(`/api/v1/car/${reqData.adId}`).send(reqData)
        .end((err, res) => {
          expect(res.status).to.eq(401);
          expect(res.body.message).to.eq('No authorization token provided');
        });
    });
  });
  // get single ad
  describe('User can view single ad', () => {
    it('should return full details of an ad', (done) => {
      carsArray();
      const { id } = carsData[0];
      chai.request(server).get(`/api/v1/car/${id}`).end((err, res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property('data');
        expect(res.body.data.id).to.eq(id);
        done();
      });
    });
    it('should return error 404 if ad is not found', (done) => {
      carsArray();
      const id = carsData[0].id + 1;
      chai.request(server).get(`/api/v1/car/${id}`).end((err, res) => {
        expect(res.status).to.eq(404);
        expect(res.body.message).to.eq('The ad you are looking for is no longer available');
        done();
      });
    });
    it('should return error 400 if invalid ad id is supplied', (done) => {
      carsArray();
      chai.request(server).get('/api/v1/car/155873165645').end((err, res) => {
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

  // admin can view all ads whether sold or available
  describe('admin view all ads', () => {
    it('should return all ads', (done) => {
      const user = usersData[0];
      user.isAdmin = true;
      carsArray();
      const token = generateToken(user.id, user.isAdmin);
      chai.request(server).get('/api/v1/car').set('x-auth', token).end((err, res) => {
        expect(res.status).to.eq(200);
        expect(res.body.data).to.be.an('Array');
        expect(res.body.data[0]).to.be.an('Object');
        done();
      });
    });
    it('should return error 404 if there are no ads available', (done) => {
      const user = usersData[0];
      user.isAdmin = true;
      Cars.cars = [];
      const token = generateToken(user.id, user.isAdmin);
      chai.request(server).get('/api/v1/car').set('x-auth', token).end((err, res) => {
        expect(res.body.status).to.eq(404);
        expect(res.body.message).to.eq('There are no cars available now. Check back');
        done();
      });
    });
    it('should return error 401 if user is not logged in', (done) => {
      carsArray();
      chai.request(server).get('/api/v1/car').end((err, res) => {
        expect(res.body.status).to.eq(401);
        expect(res.body.message).to.eq('No authorization token provided');
        done();
      });
    });
  });

  // admin can delete any posted ad
  describe('Admin can delete a posted ad', () => {
    it('should delete a posted ad', (done) => {
      const user = usersData[0];
      user.isAdmin = true;
      carsArray();
      const token = generateToken(user.id, user.isAdmin);
      chai.request(server).delete(`/api/v1/car/${carsData[0].id}`).set('x-auth', token)
        .end((err, res) => {
          expect(res.status).to.eq(200);
          expect(res.body.message).to.eq('Ad successfully deleted');
          done();
        });
    });
    it('should return error 401 if user is not admin or not logged in', (done) => {
      carsArray();
      chai.request(server).delete(`/api/v1/car/${carsData[0].id}`)
        .end((err, res) => {
          expect(res.status).to.eq(401);
          expect(res.body.message).to.eq('No authorization token provided');
          done();
        });
    });
    it('should return error 404 if wrong ad id is given', (done) => {
      const user = usersData[0];
      user.isAdmin = true;
      carsArray();
      const token = generateToken(user.id, user.isAdmin);
      const id = carsData[0].id + 1;
      chai.request(server).delete(`/api/v1/car/${id}`).set('x-auth', token)
        .end((err, res) => {
          expect(res.status).to.eq(404);
          expect(res.body.message).to.eq('The ad is no longer available');
          done();
        });
    });
    it('should return error 404 if ad is not available', (done) => {
      const user = usersData[0];
      user.isAdmin = true;
      const token = generateToken(user.id, user.isAdmin);
      const { id } = carsData[0];
      Cars.cars = [];
      chai.request(server).delete(`/api/v1/car/${id}`).set('x-auth', token)
        .end((err, res) => {
          expect(res.status).to.eq(404);
          expect(res.body.message).to.eq('The ad is no longer available');
          done();
        });
    });
  });
});
