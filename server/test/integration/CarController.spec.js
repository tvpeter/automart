/* eslint-disable max-len */
import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../index';
import db from '../../services/db';
import generateToken from '../../lib/generateToken';

const { expect } = chai;
chai.use(chaiHttp);
const adUrl = '/api/v1/car';
const signupUrl = '/api/v1/auth/signup';
describe('Cars', () => {
  const userId = async () => {
    const { rows } = await db.query('SELECT id FROM users LIMIT 1');
    return rows[0];
  };

  const genToken = async () => {
    const userdata = await userId();
    return generateToken(userdata.id, false);
  };

  const dataValues = () => ({
    email: `${Math.random().toString(36).substring(2, 15)}@gmail.com`,
    first_name: `Fi${Math.random().toString(36).substring(2, 15)}`,
    last_name: `La${Math.random().toString(36).substring(2, 15)}`,
    password: 'password',
    password_confirmation: 'password',
    address: 'my address',
    phone: `${Math.floor(Math.random() * 10000000000)}`,
  });

  const carManufacturers = ['BMW', 'Audi', 'Mercedes', 'Toyota', 'Nissan'];
  const models = ['M5', 'Audi i8', 'E360', '4 Runner', 'Avalon', 'Altima', 'Maxima'];
  const bodyt = ['Sedan', 'Station Wagon', 'SUV', 'TRUCK', 'BUS'];

  const newAdValues = () => ({
    img: 'img_url',
    state: 'new',
    price: `${Math.random() * 1000000000}`,
    manufacturer: carManufacturers[`${Math.floor(Math.random() * Math.floor(5))}`],
    model: models[`${Math.floor(Math.random() * Math.floor(6))}`],
    body_type: bodyt[`${Math.floor(Math.random() * Math.floor(5))}`],
    description: `${Math.random().toString(36).substr(2, 9)}`,
  });

  before(async () => {
    const data = await dataValues();
    await chai.request(server).post(signupUrl).send(data);
  });

  after(async () => {
    await db.query('DELETE FROM flags');
    await db.query('DELETE FROM orders');
    await db.query('DELETE FROM cars');
    await db.query('DELETE FROM users');
  });

  describe('Create Ad', () => {
    it('should create a new ad', async () => {
      const data = await userId();
      const newAd = await newAdValues();
      const token = await generateToken(data.id, false);

      chai.request(server)
        .post(adUrl)
        .set('x-auth', token)
        .field('image_url', 'bmwx6d.jpg')
        .set('Content-Type', 'Multipart/form-data')
        .field('id', Date.now())
        .field('price', 8000000)
        .field('owner', data.id)
        .field('state', newAd.state)
        .field('model', newAd.model)
        .field('manufacturer', newAd.manufacturer)
        .field('body_type', newAd.body_type)
        .field('description', newAd.description)
        .then((res) => {
          expect(res.status).to.eq(201);
          expect(res.body.data).to.have.property('id');
          expect(res.body.data.state).to.eq(newAd.state);
        });
    });
    it('should return error 400 if request does not contain all required fields', async () => {
      const token = await genToken();
      chai.request(server)
        .post(adUrl)
        .set('x-auth', token)
        .field('image_url', 'bmwx6d.jpg')
        .set('Content-Type', 'Multipart/form-data')
        .field('status', 'available')
        .field('price', '')
        .field('state', 'new')
        .field('model', 'E350')
        .field('manufacturer', 'BMW')
        .field('body_type', 'car')
        .field('description', 'This is additional description')
        .then((res) => {
          expect(res.body.status).to.eq(400);
          expect(res.body.error).to.eq('Fill all required fields');
        });
    });

    it('should return error 400 if user has the same car that is available', async () => {
      const token = await genToken();
      const data = await userId();
      const newAd = await newAdValues();
      await db.query(`INSERT INTO cars (id, price, description, image_url, owner, state, manufacturer, model, body_type) VALUES  ('${Date.now()}', 8000000, '${newAd.description}',
    'img.png', ${data.id}, '${newAd.state}', '${newAd.manufacturer}', '${newAd.model}', '${newAd.body_type}')`);

      chai.request(server)
        .post(adUrl)
        .set('x-auth', token)
        .field('image_url', 'bmwx6d.jpg')
        .set('Content-Type', 'Multipart/form-data')
        .field('id', Date.now())
        .field('price', 8000000)
        .field('owner', data.id)
        .field('state', newAd.state)
        .field('model', newAd.model)
        .field('manufacturer', newAd.manufacturer)
        .field('body_type', newAd.body_type)
        .field('description', newAd.description)
        .then((res) => {
          expect(res.status).to.eq(400);
          expect(res.body.error).to.eq('You have a similar unsold car');
        });
    });

    it('should return error 401 if user is not logged in', async () => {
      const data = newAdValues();
      const res = await chai.request(server).post(adUrl).send(data);
      expect(res.status).to.eq(401);
      expect(res.body.error).to.eq('No authorization token provided');
    });
  });

  // unsold cars according to manufacturer
  describe('view available cars by manufacturer', () => {
    it('should return array of available cars', async () => {
      const token = await genToken();
      const { rows } = await db.query('SELECT manufacturer FROM cars LIMIT 1');
      const res = await chai.request(server).get(`/api/v1/car/manufacturer/${rows[0].manufacturer}`).set('x-auth', token);
      expect(res.status).to.eq(200);
      expect(res.body.data).to.be.an('Array');
    });

    it('should return error  404 if there are no unsold cars for a selected manufacturer', async () => {
      const token = await genToken();
      const res = await chai.request(server).get('/api/v1/car/manufacturer/FIAT').set('x-auth', token);
      expect(res.status).to.eq(404);
      expect(res.body.error).to.eq('There are no cars for the selected manufacturer');
    });

    it('should return error 401 if user is not logged in', async () => {
      const { rows } = await db.query('SELECT manufacturer FROM cars LIMIT 1');
      const res = await chai.request(server).get(`/api/v1/car/manufacturer/${rows[0].manufacturer}`);
      expect(res.status).to.eq(401);
      expect(res.body.error).to.eq('No authorization token provided');
    });
  });

  // unsold cars by body type

  describe('view available cars by body type', () => {
    it('should return all unsold cars by body type', async () => {
      const { rows } = await db.query('SELECT body_type FROM cars LIMIT 1');
      const token = await genToken();
      const res = await chai.request(server).get(`/api/v1/car/body_type/${rows[0].body_type}`).set('x-auth', token);
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('data').to.be.an('Array');
    });

    it('should return error 404 if cars of given body type are not found', async () => {
      const token = await genToken();
      const res = await chai.request(server).get('/api/v1/car/body_type/SEMI').set('x-auth', token);
      expect(res.status).to.eq(404);
      expect(res.body.error).to.eq('There are no cars for the selected body_type');
    });
    it('should return error 401 if user is not logged in', async () => {
      const res = await chai.request(server).get('/api/v1/car/body_type/SEMI');
      expect(res.status).to.eq(401);
      expect(res.body.error).to.eq('No authorization token provided');
    });
  });

  // view available cars by state (used, new)
  describe('view available cars by state', () => {
    it('should return all available cars by state', async () => {
      const { rows } = await db.query('SELECT state FROM cars LIMIT 1');
      const token = await genToken();
      const res = await chai.request(server).get(`/api/v1/car/state/${rows[0].state}`).set('x-auth', token);
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('data').to.be.an('ARRAY');
    });

    it('should return error 404 if cars are not found for selected state', async () => {
      const token = await genToken();

      const res = await chai.request(server).get('/api/v1/car/state/not').set('x-auth', token);
      expect(res.status).to.eq(404);
      expect(res.body.error).to.eq('There are no cars for the selected state');
    });
  });

  // view all unsold cars
  describe('view all available cars', () => {
    it('should return all unsold cars', async () => {
      const token = await genToken();

      const res = await chai.request(server).get('/api/v1/car?status=available').set('x-auth', token);
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('data').to.be.an('ARRAY');
    });

    it('should return 404 when there are no unsold cars', async () => {
      await db.query('UPDATE cars SET status=\'sold\'');
      const token = await genToken();
      const res = await chai.request(server).get('/api/v1/car?status=available').set('x-auth', token);
      expect(res.status).to.eq(404);
      expect(res.body.error).to.eq('There are no cars available now. Check back');
    });
  });

  // get ad by id
  describe('Get ad by id', () => {
    it('should return a single ad details', async () => {
      const { rows } = await db.query('SELECT id FROM cars limit 1');
      const token = await genToken();
      const res = await chai.request(server).get(`/api/v1/car/${rows[0].id}`).set('x-auth', token);
      expect(res.status).to.eq(200);
      expect(res.body.data.id).to.eq(rows[0].id);
    });

    it('should return error 400 if supplied id is not valid', async () => {
      const token = await genToken();
      const res = await chai.request(server).get('/api/v1/car/12345678901').set('x-auth', token);
      expect(res.status).to.eq(400);
      expect(res.body.error).to.eq('Invalid ad id');
    });

    it('should return error 404 if ad is not found', async () => {
      const token = await genToken();
      const res = await chai.request(server).get('/api/v1/car/9293837414384').set('x-auth', token);
      expect(res.status).to.eq(404);
      expect(res.body.error).to.eq('The ad you are looking for is no longer available');
    });
  });

  // seller update ad price
  describe('Seller update ad price', () => {
    it('should return the ad with updated price', async () => {
      const { rows } = await db.query('SELECT id, owner FROM cars limit 1');
      const { id } = rows[0];
      const token = generateToken(rows[0].owner, false);
      const res = await chai.request(server).patch(`/api/v1/car/${id}/price`).set('x-auth', token).send({ price: 600000 });
      expect(res.status).to.eq(200);
    });

    it('should return error 404 if user is not the owner', async () => {
      const token = await genToken();

      const res = await chai.request(server).patch(`/api/v1/car/${Date.now()}/price`).set('x-auth', token).send({ price: 6400000 });
      expect(res.status).to.eq(400);
      expect(res.body.error).to.eq('Only sellers can update cars that are availabe');
    });

    it('should return error 401 if user is not logged in', async () => {
      const { rows } = await db.query('SELECT id FROM cars limit 1');
      const res = await chai.request(server).patch(`/api/v1/car/${rows[0].id}/price`).send({ price: 6000000 });
      expect(res.status).to.eq(401);
      expect(res.body.error).to.eq('No authorization token provided');
    });
  });

  // get single adc
  describe('User can view single ad', () => {
    it('should return full details of an ad', async () => {
      const token = await genToken();
      const { rows } = await db.query('SELECT id FROM cars limit 1');

      const res = await chai.request(server).get(`/api/v1/car/${rows[0].id}`).set('x-auth', token);
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property('data');
      expect(res.body.data.id).to.eq(rows[0].id);
    });
    it('should return error 404 if ad is not found', async () => {
      const token = await genToken();
      const res = await chai.request(server).get('/api/v1/car/1212121212223').set('x-auth', token);
      expect(res.status).to.eq(404);
      expect(res.body.error).to.eq('The ad you are looking for is no longer available');
    });

    it('should return error 400 if invalid ad id is supplied', async () => {
      const token = await genToken();
      const res = await chai.request(server).get('/api/v1/car/155873165645').set('x-auth', token);
      expect(res.status).to.eq(400);
      expect(res.body.error).to.eq('Invalid ad id');
    });
  });
  // get ads within a price range
  describe('Get ads within a price range', () => {
    // it('should return an array of ads within a price range', async () => {
    //   const token = await genToken();
    //   const res = await chai.request(server).get('/api/v1/car?status=available&min_price=1000000&max_price=12000000').set('x-auth', token);
    //   expect(res.status).to.eq(200);
    //   expect(res.body.data).to.be.an('ARRAY');
    // });


    it('Should return error 404 if no ads are found in the given range', async () => {
      const token = await genToken();
      const res = await chai.request(server).get('/api/v1/car?status=available&min_price=18000000&max_price=24000000').set('x-auth', token);
      expect(res.status).to.eq(404);
      expect(res.body.error).to.eq('There are no cars within the selected range');
    });
  });

  // admin can view all ads whether sold or available
  describe('User view all ads', () => {
    it('should return all cars', async () => {
      const token = await genToken();
      const res = await chai.request(server).get('/api/v1/car').set('x-auth', token);
      expect(res.status).to.eq(200);
      expect(res.body.data).to.be.an('Array');
      expect(res.body.data[0]).to.be.an('Object');
    });
    it('should return error 404 if there are no ads available', async () => {
      await db.query('DELETE FROM cars');
      const token = await genToken();
      const res = await chai.request(server).get('/api/v1/car').set('x-auth', token);
      expect(res.body.status).to.eq(404);
      expect(res.body.error).to.eq('There are no cars available now. Check back');
    });
    it('should return error 401 if user is not logged in', async () => {
      const res = await chai.request(server).get('/api/v1/car');
      expect(res.body.status).to.eq(401);
      expect(res.body.error).to.eq('No authorization token provided');
    });
  });

  // admin can delete any posted ad
  describe('Owner can delete his/her posted ad', () => {
    it('should delete a posted ad', async () => {
      const user = await userId();
      const newAd = await newAdValues();
      await db.query(`INSERT INTO cars (id, price, description, image_url, owner, state, manufacturer, model, body_type) VALUES  ('${Date.now()}', 8000000, '${newAd.description}',
      '${newAd.img}', ${user.id}, '${newAd.state}', '${newAd.manufacturer}', '${newAd.model}', '${newAd.body_type}')`);
      const { rows } = await db.query('SELECT id FROM cars LIMIT 1');
      const token = generateToken(user.id, true);
      const res = await chai.request(server).delete(`/api/v1/car/${rows[0].id}`).set('x-auth', token);
      expect(res.status).to.eq(200);
      expect(res.body.data.id).to.eq(rows[0].id);
    });
    it('should return error 401 if user is not logged in', async () => {
      const data = await userId();
      const newAd = await newAdValues();
      await db.query(`INSERT INTO cars (id, price, description, image_url, owner, state, manufacturer, model, body_type) VALUES  ('${Date.now()}', 8000000, '${newAd.description}',
    '${newAd.img}', ${data.id}, '${newAd.state}', '${newAd.manufacturer}', '${newAd.model}', '${newAd.body_type}')`);

      const { rows } = await db.query('SELECT id FROM cars LIMIT 1');
      const res = await chai.request(server).delete(`/api/v1/car/${rows[0].id}`);
      expect(res.status).to.eq(401);
      expect(res.body.error).to.eq('No authorization token provided');
    });
    it('should return error 400 if wrong ad id is given', async () => {
      const token = await genToken();
      const res = await chai.request(server).delete('/api/v1/car/123456789012').set('x-auth', token);
      expect(res.status).to.eq(400);
      expect(res.body.error).to.eq('Select the ad to delete');
    });
    it('should return error 404 if ad is not available', async () => {
      const token = await genToken();
      const res = await chai.request(server).delete('/api/v1/car/1783782738238').set('x-auth', token);
      expect(res.status).to.eq(404);
      expect(res.body.error).to.eq('Selected ad not available');
    });
  });

  describe('User retrieves all his/her posted ads', () => {
    it('should return error 404 if user has no ads', async () => {
      const user = await userId();
      const newUserId = Date.now();
      const values = await dataValues();
      await db.query(`INSERT INTO users (id, email, first_name, last_name, password, address, phone) VALUES('${newUserId}', '${values.email}', '${values.first_name}', '${values.last_name}', '${values.password}', '${values.address}', '${values.phone}')`);
      await db.query(`UPDATE cars SET owner=${newUserId} WHERE owner=${user.id}`);
      const token = generateToken(user.id, false);

      const res = await chai.request(server).get('/api/v1/ads/me').set('x-auth', token);
      expect(res.status).to.eq(404);
      expect(res.body.error).to.eq('You do not have ads yet');
    });
    it('should return array of a users ads', async () => {
      const user = await userId();
      await db.query(`UPDATE cars SET owner=${user.id}`);

      const token = generateToken(user.id, false);
      const res = await chai.request(server).get('/api/v1/ads/me').set('x-auth', token);
      expect(res.status).to.eq(200);
      expect(res.body.data).to.be.an('Array');
    });
  });
});
