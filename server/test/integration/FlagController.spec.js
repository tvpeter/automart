import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../index';
import db from '../../services/db';
import generateToken from '../../lib/generateToken';


const { expect } = chai;
chai.use(chaiHttp);

describe('Flags controller', () => {
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
    account_number: 20903928394,
    bank: 'UBA',
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
    await db.query('CREATE TABLE IF NOT EXISTS users ( id BIGINT PRIMARY KEY, email VARCHAR(30) NOT NULL UNIQUE, first_name VARCHAR(30) NOT NULL, last_name VARCHAR(30) NOT NULL, password VARCHAR(140) NOT NULL, address VARCHAR(400) NOT NULL, isAdmin BOOLEAN NOT NULL DEFAULT FALSE, phone VARCHAR(16) NOT NULL UNIQUE, account_number BIGINT NOT NULL, bank VARCHAR(20) NOT NULL, status VARCHAR(10) NOT NULL DEFAULT \'active\', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()) ');
    await db.query('CREATE TABLE IF NOT EXISTS cars (id BIGINT PRIMARY KEY,  owner BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, created_on TIMESTAMPTZ NOT NULL DEFAULT NOW(), state VARCHAR(8) NOT NULL, status VARCHAR(15) NOT NULL DEFAULT \'available\', price NUMERIC(10, 2) NOT NULL CHECK(price > 0), manufacturer VARCHAR(30) NOT NULL, model VARCHAR(30) NOT NULL, body_type VARCHAR(30) NOT NULL, description TEXT NOT NULL, img VARCHAR(150) NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW() ) ');
    await db.query('CREATE TABLE IF NOT EXISTS orders (id BIGINT PRIMARY KEY, buyerId BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,  carId BIGINT NOT NULL REFERENCES cars(id) ON DELETE RESTRICT, sellerId BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT, price NUMERIC NOT NULL CHECK(price > 0), status VARCHAR(20) NOT NULL DEFAULT \'pending\', date TIMESTAMPTZ NOT NULL DEFAULT NOW(), priceOffered NUMERIC NOT NULL CHECK(priceOffered > 0), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
    await db.query('CREATE TABLE IF NOT EXISTS flags (id BIGINT PRIMARY KEY, carId BIGINT REFERENCES cars(id) ON DELETE RESTRICT, created_on TIMESTAMPTZ NOT NULL DEFAULT NOW(), reason VARCHAR(20) NOT NULL, description TEXT, reportedBy BIGINT NOT NULL REFERENCES users(id), status VARCHAR(20) NOT NULL DEFAULT \'pending\', severity VARCHAR(20) NOT NULL DEFAULT \'minor\') ');
    const data = await dataValues();
    await chai.request(server).post('/api/v1/auth/signup').send(data);
  });

  after(async () => {
    await db.query('DELETE FROM flags');
    await db.query('DELETE FROM orders');
    await db.query('DELETE FROM cars');
    await db.query('DELETE FROM users');
  });


  describe('Create a flag', () => {
    it('should create a flag on an ad', async () => {
      const data = await userId();
      const newAd = await newAdValues();
      await db.query(`INSERT INTO cars (id, price, description, img, owner, state, manufacturer, model, body_type) VALUES  ('${Date.now()}', 8000000, '${newAd.description}',
      '${newAd.img}', ${data.id}, '${newAd.state}', '${newAd.manufacturer}', '${newAd.model}', '${newAd.body_type}')`);

      const { rows } = await db.query('SELECT id FROM cars');
      const carId = rows[rows.length - 1].id;
      const token = await genToken();
      const newFlag = {
        carId,
        reason: 'suspicious',
        description: 'This is the description of the suspicious report',
      };

      const res = await chai.request(server).post('/api/v1/flag').set('x-auth', token).send(newFlag);
      expect(res.status).to.eq(201);
      expect(res.body.data).to.have.property('id');
      expect(res.body.data).to.have.property('carid').eq(newFlag.carId);
      expect(res.body.data.reason).to.eq(newFlag.reason);
    });
    it('should return error 400 if reason is not stated', async () => {
      const data = await userId();
      const newAd = await newAdValues();
      await db.query(`INSERT INTO cars (id, price, description, img, owner, state, manufacturer, model, body_type) VALUES  ('${Date.now()}', 8000000, '${newAd.description}',
      '${newAd.img}', ${data.id}, '${newAd.state}', '${newAd.manufacturer}', '${newAd.model}', '${newAd.body_type}')`);

      const { rows } = await db.query('SELECT id FROM cars');
      const carId = rows[rows.length - 1].id;
      const token = await genToken();
      const newFlag = {
        carId,
        reason: '',
        description: 'This is the description of the suspicious report',
      };
      const res = await chai.request(server).post('/api/v1/flag').set('x-auth', token).send(newFlag);
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('Ensure to indicate the ad id and reason for the report');
    });

    it('should return error 400 if ad id is not stateds', async () => {
      const token = await genToken();
      const newFlag = {
        carId: '',
        reason: 'suspicious',
        description: 'This is the description of the suspicious report',
      };
      const res = await chai.request(server).post('/api/v1/flag').set('x-auth', token).send(newFlag);
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('Ensure to indicate the ad id and reason for the report');
    });
    it('should return error 406 if users report has already been received', async () => {
      const data = await userId();
      const newAd = await newAdValues();
      await db.query(`INSERT INTO cars (id, price, description, img, owner, state, manufacturer, model, body_type) VALUES  ('${Date.now()}', 8000000, '${newAd.description}',
      '${newAd.img}', ${data.id}, '${newAd.state}', '${newAd.manufacturer}', '${newAd.model}', '${newAd.body_type}')`);

      const { rows } = await db.query('SELECT id FROM cars');
      const carId = rows[rows.length - 1].id;
      const token = await genToken();
      const newFlag = {
        carId,
        reason: 'fake',
        description: 'This is the description of the suspicious report',
      };
      await chai.request(server).post('/api/v1/flag').set('x-auth', token).send(newFlag);
      const res = await chai.request(server).post('/api/v1/flag').set('x-auth', token).send(newFlag);
      expect(res.status).to.eq(406);
      expect(res.body.message).to.eq('Your report on this ad is already recorded');
    });

    it('should create an extreme flag if car is flag as stolen or fake or suspicious', async () => {
      const data = await userId();
      const newAd = await newAdValues();
      await db.query(`INSERT INTO cars (id, price, description, img, owner, state, manufacturer, model, body_type) VALUES  ('${Date.now()}', 8000000, '${newAd.description}',
      '${newAd.img}', ${data.id}, '${newAd.state}', '${newAd.manufacturer}', '${newAd.model}', '${newAd.body_type}')`);

      const { rows } = await db.query('SELECT id FROM cars');
      const carId = rows[rows.length - 1].id;
      const token = await genToken();
      const newFlag = {
        carId,
        reason: 'fake',
        description: 'This is the description of the suspicious report',
      };
      const res = await chai.request(server).post('/api/v1/flag').set('x-auth', token).send(newFlag);
      expect(res.status).to.eq(201);
      expect(res.body.data.severity).to.eq('extreme');
    });
  });
  describe('Update a flag', () => {
    it('should update a flag status to resolved', async () => {
      const { rows } = await db.query('SELECT id FROM flags WHERE status=\'pending\'');
      const flagid = rows[rows.length - 1].id;

      const user = await userId();
      const token = await generateToken(user.id, true);
      const res = await chai.request(server).patch(`/api/v1/flag/${flagid}`).set('x-auth', token);
      expect(res.status).to.eq(200);
      expect(res.body.data.id).to.eq(flagid);
      expect(res.body.data.status).to.eq('resolved');
    });
    it('should return error 401 if admin is not logged in', async () => {
      const { rows } = await db.query('SELECT id FROM flags WHERE status=\'pending\'');
      const flagid = rows[rows.length - 1].id;

      const res = await chai.request(server).patch(`/api/v1/flag/${flagid}`);
      expect(res.status).to.eq(401);
      expect(res.body.message).to.eq('No authorization token provided');
    });
    it('should return error 401 if logged in user is not admin', async () => {
      const { rows } = await db.query('SELECT id FROM flags WHERE status=\'pending\'');
      const { id } = rows[rows.length - 1];
      const user = await userId();
      const token = generateToken(user.id, false);

      const res = await chai.request(server).patch(`/api/v1/flag/${id}`).set('x-auth', token);
      expect(res.status).to.eq(401);
      expect(res.body.message).to.eq('You dont have the permission to access this resource');
    });
    it('should return error 404 if flag id is wrong', async () => {
      const user = await userId();
      const token = generateToken(user.id, true);
      const res = await chai.request(server).patch('/api/v1/flag/1261727827383').set('x-auth', token);
      expect(res.status).to.eq(404);
      expect(res.body.message).to.eq('Flag already updated or not available');
    });
    it('should return error 400 if flag id is wrong', async () => {
      const user = await userId();
      const token = generateToken(user.id, true);
      const res = await chai.request(server).patch('/api/v1/flag/126172782738').set('x-auth', token);
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('Invalid flag id');
    });
  });
  describe('Get all flags', () => {
    it('should return all flags', async () => {
      const user = await userId();
      const token = generateToken(user.id, true);
      const res = await chai.request(server).get('/api/v1/flags').set('x-auth', token);
      expect(res.status).to.eq(200);
      expect(res.body.data).to.be.an('Array');
      expect(res.body.data[0]).to.be.an('Object');
    });

    it('should return error 401 if user is not logged in', async () => {
      const res = await chai.request(server).get('/api/v1/flags');
      expect(res.status).to.eq(401);
      expect(res.body.message).to.eq('No authorization token provided');
    });
    it('should return error 401 if user is not admin', async () => {
      const user = await userId();
      const token = generateToken(user.id, false);
      const res = await chai.request(server).get('/api/v1/flags').set('x-auth', token);
      expect(res.status).to.eq(401);
      expect(res.body.message).to.eq('You dont have the permission to access this resource');
    });
  });
  describe('Admin can delete a given flag', () => {
    it('should delete a given flag id', async () => {
      const { rows } = await db.query('SELECT id FROM flags LIMIT 1');
      const { id } = rows[rows.length - 1];
      const user = await userId();
      const token = generateToken(user.id, true);
      const res = await chai.request(server).delete(`/api/v1/flags/${id}`).set('x-auth', token);
      expect(res.status).to.eq(200);
      expect(res.body.data.id).to.eq(id);
    });
    it('should return error 400 if flag id is wrong', async () => {
      const user = await userId();
      const token = generateToken(user.id, true);
      const res = await chai.request(server).delete('/api/v1/flags/126172782738').set('x-auth', token);
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('Invalid flag id');
    });
  });
  it('should return error 404 if flag is not found', async () => {
    const user = await userId();
    const token = generateToken(user.id, true);
    const res = await chai.request(server).delete('/api/v1/flags/1271278338293').set('x-auth', token);
    expect(res.status).to.eq(404);
    expect(res.body.message).to.eq('Flag not found');
  });
});
