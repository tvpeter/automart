import db from './db';

class CarService {
  static getAllCars() {
    return db.query('SELECT * FROM cars');
  }

  static getCarsInRange(status, min, max) {
    const query = 'SELECT id, state, status, price, manufacturer, model, body_type, description, image_url FROM cars where status=$1 AND price BETWEEN $2 AND $3';
    return db.query(query, [status, min, max]);
  }

  static getCarsByProperty(status, reqParam, ppty) {
    const query = `SELECT id, state, status, price, manufacturer, model, body_type, description, image_url FROM cars where status=$1 AND ${reqParam}=$2 LIMIT 100`;
    return db.query(query, [status, ppty]);
  }

  static getAllUnsoldCars(status) {
    const query = 'SELECT id, state, status, price, manufacturer, model, body_type, description, image_url, owner FROM cars WHERE status=$1';
    return db.query(query, [status]);
  }

  static getSingleCar(id) {
    const query = 'SELECT * FROM cars WHERE id=$1';
    return db.query(query, [id]);
  }

  static deleteCar(id) {
    const query = 'DELETE FROM cars WHERE id=$1 RETURNING *';
    return db.query(query, [id]);
  }

  static getCarsByUser(data) {
    const carsByUser = 'SELECT id FROM cars WHERE owner=$1 AND state=$2 AND status=\'available\' AND manufacturer=$3 AND model=$4 AND body_type=$5';
    return db.query(carsByUser, data);
  }

  static createCar(data) {
    const createQuery = 'INSERT INTO cars (id, price, description, image_url, owner, state, manufacturer, model, body_type) VALUES  ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *';
    return db.query(createQuery, data);
  }

  static getSingleCarAllPpties(id) {
    const query = 'SELECT * FROM cars WHERE id=$1';
    return db.query(query, [id]);
  }

  static updatePrice(price, id) {
    const query = 'UPDATE cars SET price=$1 WHERE id=$2 RETURNING *';
    return db.query(query, [price, id]);
  }

  static gerUserAds(userId) {
    const query = 'SELECT * FROM cars WHERE owner=$1';
    return db.query(query, [userId]);
  }
}

export default CarService;
