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

  const orderData = {
    carId: 1288392382934,
    priceOffered: '6000000',
  };

  describe('Create order', () => {
    it('should create an order', async () => {
      const data = await userId();
      const newAd = await newAdValues();
      await db.query(`INSERT INTO cars (id, price, description, img, owner, state, manufacturer, model, body_type) VALUES  ('${Date.now()}', 8000000, '${newAd.description}',
    'img.png', ${data.id}, '${newAd.state}', '${newAd.manufacturer}', '${newAd.model}', '${newAd.body_type}')`);
      const newUser = await dataValues();
      await chai.request(server).post('/api/v1/auth/signup').send(newUser);
      const { rows } = await db.query('SELECT id FROM cars limit 1');
      const user = await db.query('SELECT id FROM users LIMIT 2');
      const token = await generateToken(user.rows[1].id, false);

      orderData.carId = rows[0].id;

      const res = await chai.request(server).post('/api/v1/order').set('x-auth', token).send(orderData);
      expect(res.status).to.eq(201);
      expect(res.body.data).to.have.property('id');
      expect(res.body.data).to.have.property('carid').eq(orderData.carId);
      expect(res.body.data.priceoffered).to.eq(orderData.priceOffered);
      expect(res.body.data.sellerid).to.eq(data.id);
      expect(res.body.data.buyerid).to.eq(user.rows[1].id);
    });

    it('should return error 400 if carId or price is not supplied', async () => {
      const token = await genToken();
      orderData.carId = '';

      chai.request(server).post('/api/v1/order').set('x-auth', token).send(orderData)
        .end((err, res) => {
          expect(res.status).to.eq(400);
          expect(res.body.message).to.eq('Select car and state amount you want to pay');
        });
    });
    it('should return error 400 if car id is invalid', async () => {
      orderData.carId = 128839238293;

      const token = await genToken();
      chai.request(server).post('/api/v1/order').set('x-auth', token).send(orderData)
        .end((err, res) => {
          expect(res.status).to.eq(400);
          expect(res.body.message).to.eq('Select car and state amount you want to pay');
        });
    });

    it('should return error 400 if car is not found', async () => {
      const token = await genToken();
      orderData.carId = 1288392382934;

      const res = await chai.request(server).post('/api/v1/order').set('x-auth', token).send(orderData);
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('The car is not available or the seller is not active. Check back');
    });

    it('should return 401 if user is not logged in', (done) => {
      chai.request(server).post('/api/v1/order').send(orderData)
        .end((err, res) => {
          expect(res.status).to.eq(401);
          expect(res.body.message).to.eq('No authorization token provided');
          done();
        });
    });
  });

  // seller update order price
  describe('Buyer update order price while order it is not pending or cancelled', () => {
    it('should update the order price ', async () => {
      const newUser = await dataValues();
      await chai.request(server).post('/api/v1/auth/signup').send(newUser);
      const orderInfo = await db.query('SELECT id, buyerid, sellerid, priceoffered, status FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      const { buyerid } = orderInfo.rows[0];
      await db.query(`UPDATE orders SET status='rejected' WHERE id=${id}`);
      const token = await generateToken(buyerid, false);
      const newData = {
        orderId: id,
        newPrice: 7100000,
      };

      const res = await chai.request(server).patch('/api/v1/order').set('x-auth', token).send(newData);
      expect(res.status).to.eq(200);
      expect(res.body.data.id).to.eq(id);
      expect(res.body.data.buyerid).to.eq(buyerid);
      expect(parseFloat(res.body.data.priceoffered)).to.eq(newData.newPrice);
    });
    it('should return error 400 if newprice is not stated ', async () => {
      const newUser = await dataValues();
      await chai.request(server).post('/api/v1/auth/signup').send(newUser);
      const orderInfo = await db.query('SELECT id, buyerid, sellerid, priceoffered, status FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      const { buyerid } = orderInfo.rows[0];
      await db.query(`UPDATE orders SET status='rejected' WHERE id=${id}`);
      const token = await generateToken(buyerid, false);
      const newData = {
        orderId: id,
        newPrice: '',
      };

      const res = await chai.request(server).patch('/api/v1/order').set('x-auth', token).send(newData);
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('Ensure to send the order id and new price');
    });
    it('should return error 400 if order id is not supplied ', async () => {
      const newUser = await dataValues();
      await chai.request(server).post('/api/v1/auth/signup').send(newUser);
      const orderInfo = await db.query('SELECT id, buyerid, sellerid, priceoffered, status FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      const { buyerid } = orderInfo.rows[0];
      await db.query(`UPDATE orders SET status='rejected' WHERE id=${id}`);
      const token = await generateToken(buyerid, false);
      const newData = {
        orderId: '',
        newPrice: 7100000,
      };

      const res = await chai.request(server).patch('/api/v1/order').set('x-auth', token).send(newData);
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('Ensure to send the order id and new price');
    });
    it('should return error 400 if order status is pending or cancelled', async () => {
      const newUser = await dataValues();
      await chai.request(server).post('/api/v1/auth/signup').send(newUser);
      const orderInfo = await db.query('SELECT id, buyerid, sellerid, priceoffered, status FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      const { buyerid } = orderInfo.rows[0];
      await db.query(`UPDATE orders SET status='pending' WHERE id=${id}`);
      const token = await generateToken(buyerid, false);
      const newData = {
        orderId: id,
        newPrice: 7100000,
      };

      const res = await chai.request(server).patch('/api/v1/order').set('x-auth', token).send(newData);
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('Check that the order id is valid and not cancelled and your new price is different');
    });
  });

  // User retrieves his/her orders
  describe('User get his/her ads', () => {
    it('should return an array of the users ads', async () => {
      const newUser = await dataValues();
      await chai.request(server).post('/api/v1/auth/signup').send(newUser);
      const orderInfo = await db.query('SELECT sellerid FROM orders LIMIT 1');
      const { sellerid } = orderInfo.rows[0];
      const token = await generateToken(sellerid, false);

      const res = await chai.request(server).get('/api/v1/orders/me').set('x-auth', token);
      expect(res.status).to.eq(200);
      expect(res.body.data).to.be.an('Array');
      expect(res.body.data[0]).to.have.property('sellerid').eq(sellerid);
    });
    it('should return error 401 if user is not logged in', (done) => {
      chai.request(server).get('/api/v1/orders/me')
        .end((err, res) => {
          expect(res.status).to.eq(401);
          expect(res.body.message).to.eq('No authorization token provided');
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
    // it('should return error 404 if there are no orders', async () => {
    //   const newUser = await dataValues();
    //   await chai.request(server).post('/api/v1/auth/signup').send(newUser);
    //   const { rows } = await db.query('SELECT id FROM users ');
    //   const { length } = rows;
    //   const token = generateToken(rows[length - 1].id, true);

    //   const res = await chai.request(server).get('/api/v1/orders').set('x-auth', token);
    //   expect(res.body.status).to.eq(404);
    //   expect(res.body.message).to.eq('There are no orders now. Check back');
    // });
    it('should return error 401 if user is not logged in', (done) => {
      chai.request(server).get('/api/v1/orders')
        .end((err, res) => {
          expect(res.body.status).to.eq(401);
          expect(res.body.message).to.eq('No authorization token provided');
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
      expect(res.body.message).to.eq('You dont have the permission to access this resource');
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
      const orderInfo = await db.query('SELECT id, sellerid FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      const { sellerid } = orderInfo.rows[0];
      const token = await generateToken(sellerid, false);

      const res = await chai.request(server).get(`/api/v1/orders/${id}`).set('x-auth', token);
      expect(res.status).to.eq(200);
      expect(res.body.data.id).to.eq(id);
    });
    it('should return order if it is the buyer', async () => {
      const orderInfo = await db.query('SELECT id, buyerid FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      const { buyerid } = orderInfo.rows[0];
      const token = await generateToken(buyerid, false);

      const res = await chai.request(server).get(`/api/v1/orders/${id}`).set('x-auth', token);
      expect(res.status).to.eq(200);
      expect(res.body.data.id).to.eq(id);
    });
    // it('should return error 404 if order is not found', async () => {
    //   const orderInfo = await db.query('SELECT id, buyerid FROM orders LIMIT 1');
    //   const { buyerid } = orderInfo.rows[0];
    //   const token = await generateToken(buyerid, false);

    // eslint-disable-next-line max-len
    // const res = await chai.request(server).get('/api/v1/orders/1212727172172').set('x-auth', token);
    //   expect(res.status).to.eq(404);
    //   expect(res.body.message).to.eq('Order not found');
    // });

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
      expect(res.body.message).to.eq('You dont have the permission to view this resource');
    });
  });

  // update order status
  describe('Seller and Buyer update order status', () => {
    it('should update order status by seller when it is pending', async () => {
      const newUser = await dataValues();
      await chai.request(server).post('/api/v1/auth/signup').send(newUser);
      const orderInfo = await db.query('SELECT id, sellerid FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      await db.query(`UPDATE orders SET status='pending' WHERE id=${id}`);
      const { sellerid } = orderInfo.rows[0];
      const token = await generateToken(sellerid, false);

      const res = await chai.request(server).patch(`/api/v1/orders/${id}`).set('x-auth', token).send({ status: 'accepted' });
      expect(res.status).to.eq(200);
      expect(res.body.data.id).to.eq(id);
      expect(res.body.data.status).to.eq('accepted');
    });

    it('should update order status by buyer if the status is accepted', async () => {
      const newUser = await dataValues();
      await chai.request(server).post('/api/v1/auth/signup').send(newUser);
      const orderInfo = await db.query('SELECT id, buyerid FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      await db.query(`UPDATE orders SET status='accepted' WHERE id=${id}`);
      const { buyerid } = orderInfo.rows[0];
      const token = await generateToken(buyerid, false);

      const res = await chai.request(server).patch(`/api/v1/orders/${id}`).set('x-auth', token).send({ status: 'completed' });
      expect(res.status).to.eq(200);
      expect(res.body.data.id).to.eq(id);
      expect(res.body.data.status).to.eq('completed');
    });

    it('should return error 404 if order is not found', async () => {
      const orderInfo = await db.query('SELECT id, buyerid FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      const { buyerid } = orderInfo.rows[0];
      const token = await generateToken(buyerid, false);
      const res = await chai.request(server).patch(`/api/v1/orders/${id + 1}`).set('x-auth', token).send({ status: 'completed' });
      expect(res.status).to.eq(404);
      expect(res.body.message).to.eq('The order is not available');
    });

    it('should return error 406 if seller or buyer is inactive', async () => {
      const newUser = await dataValues();
      await chai.request(server).post('/api/v1/auth/signup').send(newUser);
      const orderInfo = await db.query('SELECT id, buyerid, sellerid FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      const { buyerid } = orderInfo.rows[0];
      const { sellerid } = orderInfo.rows[0];
      await db.query(`UPDATE users SET status='suspended' WHERE id=${sellerid}`);
      const token = await generateToken(buyerid, false);

      const res = await chai.request(server).patch(`/api/v1/orders/${id}`).set('x-auth', token).send({ status: 'completed' });
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('You cannot update the status of this order at its state');
    });

    it('should return error 403 if another user/admin attempts to update the order status', async () => {
      const newUser = await dataValues();
      await chai.request(server).post('/api/v1/auth/signup').send(newUser);
      const orderInfo = await db.query('SELECT id FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      const { rows } = await db.query('SELECT id FROM users');
      const len = rows.length - 1;
      const token = await generateToken(len, true);

      const res = await chai.request(server).patch(`/api/v1/orders/${id}`).set('x-auth', token).send({ status: 'completed' });
      expect(res.status).to.eq(403);
      expect(res.body.message).to.eq('You dont have the permission to modify this resource');
    });

    it('should return error 400 if buyer wants to update a pending order', async () => {
      const orderInfo = await db.query('SELECT id, buyerid FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      await db.query(`UPDATE orders SET status='pending' WHERE id=${id}`);
      const { buyerid } = orderInfo.rows[0];
      const token = await generateToken(buyerid, false);
      const res = await chai.request(server).patch(`/api/v1/orders/${id}`).set('x-auth', token).send({ status: 'completed' });
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('You cannot update the status of this order at its state');
    });

    it('should return error 400 if seller wants to update a cancelled order', async () => {
      const orderInfo = await db.query('SELECT id, sellerid FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      await db.query(`UPDATE orders SET status='cancelled' WHERE id=${id}`);
      const { sellerid } = orderInfo.rows[0];
      const token = await generateToken(sellerid, false);
      const res = await chai.request(server).patch(`/api/v1/orders/${id}`).set('x-auth', token).send({ status: 'accepted' });
      expect(res.status).to.eq(400);
      expect(res.body.message).to.eq('You cannot update the status of this order at its state');
    });
  });

  // delete an order -  seller and admin can delete a cancelled order
  describe('deletes a cancelled order', () => {
    it('should return error 404 if seller attempts to delete an uncancelled order', async () => {
      const orderInfo = await db.query('SELECT id, sellerid FROM orders LIMIT 1');
      const { id } = orderInfo.rows[0];
      await db.query(`UPDATE orders SET status='rejected' WHERE id=${id}`);
      const { sellerid } = orderInfo.rows[0];
      const token = await generateToken(sellerid, false);
      const res = await chai.request(server).delete(`/api/v1/orders/${id}`).set('x-auth', token);
      expect(res.status).to.eq(404);
      expect(res.body.message).to.eq('The order does not exist');
    });

    it('should return error 404 if order is not found', async () => {
      const { rows } = await db.query('SELECT id from users');
      const len = rows.length - 1;
      const token = await generateToken(rows[len].id, true);
      const res = await chai.request(server).delete('/api/v1/orders/1678787878781').set('x-auth', token);
      expect(res.status).to.eq(404);
      expect(res.body.message).to.eq('The order does not exist');
    });

    // it('should return error 404 if a logged in user attempts to delete the order', async () => {
    //   const orderInfo = await db.query('SELECT id, sellerid FROM orders LIMIT 1');
    //   const { id } = orderInfo.rows[0];
    //   const { rows } = await db.query('SELECT id from users');
    //   const len = rows.length - 1;
    //   const token = await generateToken(rows[len].id, true);
    //   const res = await chai.request(server).delete(`/api/v1/orders/${id}`).set('x-auth', token);
    //   expect(res.status).to.eq(404);
    //   expect(res.body.message).to.eq('You dont have permission to delete this resource');
    // });
    // it('seller should delete an order that is cancelled', async () => {
    //   const token = genToken();
    //   const cars = await db.query('SELECT id FROM cars');
    //   const newOrderData = {
    //     carId: cars.rows[0].id,
    //     priceOffered: 45000000,
    //   };
    //   await chai.request(server).post('/api/v1/order').set('x-auth', token).send(newOrderData);

    //   const orderInfo = await db.query('SELECT id, sellerid FROM orders LIMIT 1');
    //   const { id } = orderInfo.rows[0];
    //   await db.query(`UPDATE orders SET status='cancelled' WHERE id=${id}`);
    //   const { sellerid } = orderInfo.rows[0];
    //   const tk = await generateToken(sellerid, false);
    //   const res = await chai.request(server).delete(`/api/v1/orders/${id}`).set('x-auth', tk);
    //   expect(res.status).to.eq(200);
    //   expect(res.body.data.id).to.eq(id);
    // });
    it('admin should delete any order', async () => {
      const token = genToken();
      const cars = await db.query('SELECT id FROM cars');
      const newOrderData = {
        carId: cars.rows[0].id,
        priceOffered: 45000000,
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
  // describe('User retrieves his/her ads', () => {
  //   it('should return error 404 if user has not sold on the platform', async () => {
  //     const newUser = await dataValues();
  //     await chai.request(server).post('/api/v1/auth/signup').send(newUser);
  //     const { rows } = await db.query('SELECT id FROM users LIMIT 2');
  //     const token = await generateToken(rows[0].id, false);
  //     await db.query('DELETE FROM orders');
  //     const res = await chai.request(server).get('/api/v1/orders/me').set('x-auth', token);
  //     expect(res.status).to.eq(404);
  //     expect(res.body.message).to.eq('You do not have any transaction yet');
  //   });
  // });
});
