/* eslint-disable camelcase */
import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../index';
import db from '../../services/db';
import generateToken from '../../lib/generateToken';


const { expect } = chai;
chai.use(chaiHttp);

describe('Order transaction', () => {
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
    image_url: 'image_url_url',
    state: 'new',
    price: `${Math.random() * 1000000000}`,
    manufacturer: carManufacturers[`${Math.floor(Math.random() * Math.floor(5))}`],
    model: models[`${Math.floor(Math.random() * Math.floor(6))}`],
    body_type: bodyt[`${Math.floor(Math.random() * Math.floor(5))}`],
    description: `${Math.random().toString(36).substr(2, 9)}`,
  });


  before(async () => {
    await db.query('CREATE TABLE IF NOT EXISTS users ( id BIGINT PRIMARY KEY, email VARCHAR(30) NOT NULL UNIQUE, first_name VARCHAR(30) NOT NULL, last_name VARCHAR(30) NOT NULL, password VARCHAR(140) NOT NULL, address VARCHAR(400) NOT NULL, is_admin BOOLEAN NOT NULL DEFAULT FALSE, phone VARCHAR(16), status VARCHAR(10) NOT NULL DEFAULT \'active\', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
    await db.query('CREATE TABLE IF NOT EXISTS cars (id BIGINT PRIMARY KEY,  owner BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, created_on TIMESTAMPTZ NOT NULL DEFAULT NOW(), state VARCHAR(8) NOT NULL, status VARCHAR(15) NOT NULL DEFAULT \'available\', price NUMERIC(10, 2) NOT NULL CHECK(price > 0), manufacturer VARCHAR(30) NOT NULL, model VARCHAR(30) NOT NULL, body_type VARCHAR(30) NOT NULL, description TEXT, image_url VARCHAR(150), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW() )');
    await db.query('CREATE TABLE IF NOT EXISTS orders (id BIGINT PRIMARY KEY, buyer_id BIGINT REFERENCES users(id) ON DELETE CASCADE,  car_id BIGINT NOT NULL REFERENCES cars(id) ON DELETE CASCADE, seller_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, price NUMERIC NOT NULL CHECK(price > 0), status VARCHAR(20) NOT NULL DEFAULT \'pending\', date TIMESTAMPTZ NOT NULL DEFAULT NOW(), price_offered NUMERIC NOT NULL CHECK(price_offered > 0), new_price_offered NUMERIC, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
    await db.query('CREATE TABLE IF NOT EXISTS flags (id BIGINT PRIMARY KEY, car_id BIGINT REFERENCES cars(id) ON DELETE CASCADE, created_on TIMESTAMPTZ NOT NULL DEFAULT NOW(), reason VARCHAR(20) NOT NULL, description TEXT, reportedBy BIGINT NOT NULL REFERENCES users(id), status VARCHAR(20) NOT NULL DEFAULT \'pending\', severity VARCHAR(20) NOT NULL DEFAULT \'minor\') ');
    const data = await dataValues();
    await chai.request(server).post('/api/v1/auth/signup').send(data);
  });

  after(async () => {
    await db.query('DELETE FROM flags');
    await db.query('DELETE FROM orders');
    await db.query('DELETE FROM cars');
    await db.query('DELETE FROM users');
  });

  const orderData = {
    car_id: 1288392382934,
    amount: '6000000',
  };

  describe('Create order', () => {
    it('should create an order', async () => {
      const data = await userId();
      const newUser = await dataValues();
      await chai.request(server).post('/api/v1/auth/signup').send(newUser);
      const newAd = await newAdValues();
      await db.query(`INSERT INTO cars (id, price, description, image_url, owner, state, manufacturer, model, body_type) VALUES  ('${Date.now()}', 8000000, '${newAd.description}',
    'image_url.png', ${data.id}, '${newAd.state}', '${newAd.manufacturer}', '${newAd.model}', '${newAd.body_type}')`);
      const { rows } = await db.query('SELECT id FROM cars limit 1');
      const user = await db.query('SELECT id FROM users LIMIT 1');
      const token = await generateToken(user.rows[0].id, false);
      orderData.car_id = rows[0].id;
      const res = await chai.request(server).post('/api/v1/order').set('x-auth', token).send(orderData);
      expect(res.status).to.eq(201);
      expect(res.body.data).to.have.property('id');
      expect(res.body.data).to.have.property('car_id').eq(orderData.car_id);
      expect(res.body.data.seller_id).to.eq(data.id);
    });

    it('should return error 400 if carId or price is not supplied', async () => {
      const token = await genToken();
      orderData.car_id = '';

      chai.request(server).post('/api/v1/order').set('x-auth', token).send(orderData)
        .end((err, res) => {
          expect(res.status).to.eq(400);
          expect(res.body.error).to.eq('Select car and state amount you want to pay');
        });
    });
    it('should return error 400 if car id is invalid', async () => {
      orderData.car_id = 128839238293;

      const token = await genToken();
      chai.request(server).post('/api/v1/order').set('x-auth', token).send(orderData)
        .end((err, res) => {
          expect(res.status).to.eq(400);
          expect(res.body.error).to.eq('Select car and state amount you want to pay');
        });
    });

    it('should return error 400 if car is not found', async () => {
      const token = await genToken();
      orderData.car_id = 1288392382934;

      const res = await chai.request(server).post('/api/v1/order').set('x-auth', token).send(orderData);
      expect(res.status).to.eq(400);
      expect(res.body.error).to.eq('The car is not available or the seller is not active. Check back');
    });

    it('should return error 401  if user is not logged in', (done) => {
      chai.request(server).post('/api/v1/order').send(orderData)
        .end((err, res) => {
          expect(res.status).to.eq(401);
          expect(res.body.error).to.eq('No authorization token provided');
          done();
        });
    });
  });

  // seller update order price
  describe('Buyer update order price while it is pending', () => {
    it('should update the order price ', async () => {
      const newUser = await dataValues();
      await chai.request(server).post('/api/v1/auth/signup').send(newUser);
      const orderInfo = await db.query('SELECT id, buyer_id, seller_id, price_offered, status FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      const { buyer_id } = orderInfo.rows[0];
      const token = await generateToken(buyer_id, false);

      const res = await chai.request(server).patch(`/api/v1/order/${id}/price`).set('x-auth', token).send({ price: 7100000 });
      expect(res.status).to.eq(200);
      expect(res.body.data.id).to.eq(id);
      expect(res.body.data.buyer_id).to.eq(buyer_id);
    });
    it('should return error 400 if newprice is not stated ', async () => {
      const newUser = await dataValues();
      await chai.request(server).post('/api/v1/auth/signup').send(newUser);
      const orderInfo = await db.query('SELECT id, buyer_id, seller_id, price_offered, status FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      const { buyer_id } = orderInfo.rows[0];
      await db.query(`UPDATE orders SET status='rejected' WHERE id=${id}`);
      const token = await generateToken(buyer_id, false);
      const newData = {
        order_id: id,
        price: '',
      };

      const res = await chai.request(server).patch(`/api/v1/order/${id}/price`).set('x-auth', token).send(newData);
      expect(res.status).to.eq(400);
      expect(res.body.error).to.eq('Ensure to send the order id and new price');
    });

    it('should return error 400 if order status is cancelled', async () => {
      const newUser = await dataValues();
      await chai.request(server).post('/api/v1/auth/signup').send(newUser);
      const orderInfo = await db.query('SELECT id, buyer_id, seller_id, price_offered, status FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      const { buyer_id } = orderInfo.rows[0];
      await db.query(`UPDATE orders SET status='cancelled' WHERE id=${id}`);
      const token = await generateToken(buyer_id, false);
      const newData = {
        order_id: id,
        price: 7100000,
      };

      const res = await chai.request(server).patch(`/api/v1/order/${id}/price`).set('x-auth', token).send(newData);
      expect(res.status).to.eq(400);
      expect(res.body.error).to.eq('Check that the order id is valid and your new price is different');
    });
  });

  // User retrieves his/her orders
  describe('User get his/her ads', () => {
    it('should return an array of the users ads', async () => {
      const newUser = await dataValues();
      await chai.request(server).post('/api/v1/auth/signup').send(newUser);
      const orderInfo = await db.query('SELECT seller_id FROM orders LIMIT 1');
      const { seller_id } = orderInfo.rows[0];
      const token = await generateToken(seller_id, false);

      const res = await chai.request(server).get('/api/v1/orders/me').set('x-auth', token);
      expect(res.status).to.eq(200);
      expect(res.body.data).to.be.an('Array');
      expect(res.body.data[0]).to.have.property('seller_id').eq(seller_id);
    });
    it('should return error 401 if user is not logged in', (done) => {
      chai.request(server).get('/api/v1/orders/me')
        .end((err, res) => {
          expect(res.status).to.eq(401);
          expect(res.body.error).to.eq('No authorization token provided');
          done();
        });
    });
  });
  // view all orders
  describe('View all orders', () => {
    it('should return all orders placed', async () => {
      const newUser = await dataValues();
      await chai.request(server).post('/api/v1/auth/signup').send(newUser);
      const { rows } = await db.query('SELECT id FROM users ');
      const { length } = rows;
      const token = generateToken(rows[length - 1].id, true);

      const res = await chai.request(server).get('/api/v1/orders').set('x-auth', token);
      expect(res.status).to.eq(200);
      expect(res.body.data).to.be.an('Array');
    });
    it('should return error 401 if user is not logged in', (done) => {
      chai.request(server).get('/api/v1/orders')
        .end((err, res) => {
          expect(res.body.status).to.eq(401);
          expect(res.body.error).to.eq('No authorization token provided');
          done();
        });
    });
    it('should return error 401 if user is not admin', async () => {
      const newUser = await dataValues();
      await chai.request(server).post('/api/v1/auth/signup').send(newUser);
      const { rows } = await db.query('SELECT id FROM users ');
      const { length } = rows;
      const token = generateToken(rows[length - 1].id, false);

      const res = await chai.request(server).get('/api/v1/orders').set('x-auth', token);
      expect(res.status).to.eq(401);
      expect(res.body.error).to.eq('You dont have the permission to access this resource');
    });
  });
  // view a single order
  describe('View a single order', () => {
    it('should return order if it is admin', async () => {
      const newUser = await dataValues();
      await chai.request(server).post('/api/v1/auth/signup').send(newUser);
      const { rows } = await db.query('SELECT id FROM users ');
      const { length } = rows;
      const token = generateToken(rows[length - 1].id, true);
      const orderInfo = await db.query('SELECT id FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];

      const res = await chai.request(server).get(`/api/v1/orders/${id}`).set('x-auth', token);
      expect(res.status).to.eq(200);
      expect(res.body.data.id).to.eq(id);
    });
    it('should return order if it is the seller', async () => {
      const orderInfo = await db.query('SELECT id, seller_id FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      const { seller_id } = orderInfo.rows[0];
      const token = await generateToken(seller_id, false);

      const res = await chai.request(server).get(`/api/v1/orders/${id}`).set('x-auth', token);
      expect(res.status).to.eq(200);
      expect(res.body.data.id).to.eq(id);
    });
    it('should return order if it is the buyer', async () => {
      const orderInfo = await db.query('SELECT id, buyer_id FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      const { buyer_id } = orderInfo.rows[0];
      const token = await generateToken(buyer_id, false);

      const res = await chai.request(server).get(`/api/v1/orders/${id}`).set('x-auth', token);
      expect(res.status).to.eq(200);
      expect(res.body.data.id).to.eq(id);
    });

    it('should return error 403 if it is not buyer or seller or admin', async () => {
      const newUser = await dataValues();
      await chai.request(server).post('/api/v1/auth/signup').send(newUser);
      const orderInfo = await db.query('SELECT id FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      const { rows } = await db.query('SELECT id from users');
      const len = rows.length - 1;
      const token = await generateToken(rows[len].id, false);

      const res = await chai.request(server).get(`/api/v1/orders/${id}`).set('x-auth', token);
      expect(res.status).to.eq(403);
      expect(res.body.error).to.eq('You dont have the permission to view this resource');
    });
  });

  // update order status
  describe('Seller and Buyer update order status', () => {
    it('should update order status by seller when it is pending', async () => {
      const newUser = await dataValues();
      await chai.request(server).post('/api/v1/auth/signup').send(newUser);
      const orderInfo = await db.query('SELECT id, seller_id FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      await db.query(`UPDATE orders SET status='pending' WHERE id=${id}`);
      const { seller_id } = orderInfo.rows[0];
      const token = await generateToken(seller_id, false);

      const res = await chai.request(server).patch(`/api/v1/order/${id}/status`).set('x-auth', token).send({ status: 'accepted' });
      expect(res.status).to.eq(200);
      expect(res.body.data.id).to.eq(id);
      expect(res.body.data.status).to.eq('accepted');
    });

    it('should update order status by buyer if the status is accepted', async () => {
      const newUser = await dataValues();
      await chai.request(server).post('/api/v1/auth/signup').send(newUser);
      const orderInfo = await db.query('SELECT id, buyer_id FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      await db.query(`UPDATE orders SET status='accepted' WHERE id=${id}`);
      const { buyer_id } = orderInfo.rows[0];
      const token = await generateToken(buyer_id, false);

      const res = await chai.request(server).patch(`/api/v1/order/${id}/status`).set('x-auth', token).send({ status: 'completed' });
      expect(res.status).to.eq(200);
      expect(res.body.data.id).to.eq(id);
      expect(res.body.data.status).to.eq('completed');
    });

    it('should return error 404 if order is not found', async () => {
      const orderInfo = await db.query('SELECT id, buyer_id FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      const { buyer_id } = orderInfo.rows[0];
      const token = await generateToken(buyer_id, false);
      const res = await chai.request(server).patch(`/api/v1/order/${id + 1}/status`).set('x-auth', token).send({ status: 'completed' });
      expect(res.status).to.eq(404);
      expect(res.body.error).to.eq('The order is not available');
    });

    it('should return error if seller or buyer is inactive', async () => {
      const newUser = await dataValues();
      await chai.request(server).post('/api/v1/auth/signup').send(newUser);
      const orderInfo = await db.query('SELECT id, buyer_id, seller_id FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      const { buyer_id } = orderInfo.rows[0];
      const { seller_id } = orderInfo.rows[0];
      await db.query(`UPDATE users SET status='suspended' WHERE id=${seller_id}`);
      const token = await generateToken(buyer_id, false);

      const res = await chai.request(server).patch(`/api/v1/order/${id}/status`).set('x-auth', token).send({ status: 'completed' });
      expect(res.status).to.eq(400);
      expect(res.body.error).to.eq('You cannot update the status of this order at its state');
    });

    it('should return error 403 if another user/admin attempts to update the order status', async () => {
      const newUser = await dataValues();
      await chai.request(server).post('/api/v1/auth/signup').send(newUser);
      const orderInfo = await db.query('SELECT id FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      const { rows } = await db.query('SELECT id FROM users');
      const len = rows.length - 1;
      const token = await generateToken(len, true);

      const res = await chai.request(server).patch(`/api/v1/order/${id}/status`).set('x-auth', token).send({ status: 'completed' });
      expect(res.status).to.eq(403);
      expect(res.body.error).to.eq('You dont have the permission to modify this resource');
    });

    it('should return error 400 if buyer wants to update a pending order', async () => {
      const orderInfo = await db.query('SELECT id, buyer_id FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      await db.query(`UPDATE orders SET status='pending' WHERE id=${id}`);
      const { buyer_id } = orderInfo.rows[0];
      const token = await generateToken(buyer_id, false);
      const res = await chai.request(server).patch(`/api/v1/order/${id}/status`).set('x-auth', token).send({ status: 'completed' });
      expect(res.status).to.eq(400);
      expect(res.body.error).to.eq('You cannot update the status of this order at its state');
    });

    it('should return error 400 if seller wants to update a cancelled order', async () => {
      const orderInfo = await db.query('SELECT id, seller_id FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      await db.query(`UPDATE orders SET status='cancelled' WHERE id=${id}`);
      const { seller_id } = orderInfo.rows[0];
      const token = await generateToken(seller_id, false);
      const res = await chai.request(server).patch(`/api/v1/order/${id}/status`).set('x-auth', token).send({ status: 'accepted' });
      expect(res.status).to.eq(400);
      expect(res.body.error).to.eq('You cannot update the status of this order at its state');
    });
  });

  // delete an order -  seller and admin can delete a cancelled order
  describe('deletes a cancelled order', () => {
    it('should return error 404 if seller attempts to delete an uncancelled order', async () => {
      const orderInfo = await db.query('SELECT id, seller_id FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      await db.query(`UPDATE orders SET status='rejected' WHERE id=${id}`);
      const { seller_id } = orderInfo.rows[0];
      const token = await generateToken(seller_id, false);
      const res = await chai.request(server).delete(`/api/v1/orders/${id}`).set('x-auth', token);
      expect(res.status).to.eq(404);
      expect(res.body.error).to.eq('The order does not exist');
    });

    it('should return error 404 if order is not found', async () => {
      const { rows } = await db.query('SELECT id from users');
      const len = rows.length - 1;
      const token = await generateToken(rows[len].id, true);
      const res = await chai.request(server).delete('/api/v1/orders/1678787878781').set('x-auth', token);
      expect(res.status).to.eq(404);
      expect(res.body.error).to.eq('The order does not exist');
    });

    it('admin should delete any order', async () => {
      const token = genToken();
      const cars = await db.query('SELECT id FROM cars');
      const newOrderData = {
        carId: cars.rows[0].id,
        price_offered: 45000000,
      };
      await chai.request(server).post('/api/v1/order').set('x-auth', token).send(newOrderData);
      const orderInfo = await db.query('SELECT id FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      const { rows } = await db.query('SELECT id FROM users LIMIT 1');
      const tk = generateToken(rows[0].id, true);
      const res = await chai.request(server).delete(`/api/v1/orders/${id}`).set('x-auth', tk);
      expect(res.status).to.eq(200);
      expect(res.body.data.id).to.eq(id);
    });
  });
  describe('User retrieves his/her sold ads', () => {
    // it('should return user sold ads on the platform', async () => {
    //   const newUser = await dataValues();
    //   await chai.request(server).post('/api/v1/auth/signup').send(newUser);
    //   const { rows } = await db.query('SELECT id FROM users LIMIT 1');

    //   const token = await generateToken(rows[0].id, false);
    //   await db.query(`UPDATE orders SET seller_id=${rows[0].id}`);
    //   const res = await chai.request(server).get('/api/v1/orders/me').set('x-auth', token);

    //   expect(res.status).to.eq(200);
    //   expect(res.body.data).to.be.an('ARRAY');
    // });
    it('should return error 404 if user has not sold on the platform', async () => {
      const newUser = await dataValues();
      await chai.request(server).post('/api/v1/auth/signup').send(newUser);
      const { rows } = await db.query('SELECT id FROM users LIMIT 1');

      const token = await generateToken(rows[0].id, false);
      await db.query(`DELETE FROM orders WHERE seller_id=${rows[0].id}`);
      const res = await chai.request(server).get('/api/v1/orders/me').set('x-auth', token);
      expect(res.status).to.eq(404);
      expect(res.body.error).to.eq('You do not have any transaction yet');
    });
  });
});
