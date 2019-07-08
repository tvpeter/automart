import db from './db';

class CarService {
  static getAllCars() {
    return db.query('SELECT * FROM cars');
  }

  static getCarsInRange(min, max) {
    const query = 'SELECT id, state, status, price, manufacturer, model, body_type, description, img FROM cars where price BETWEEN $1 AND $2';
    return db.query(query, [min, max]);
  }

  static getCarsByProperty(reqParam, ppty) {
    const query = `SELECT id, state, status, price, manufacturer, model, body_type, description, img FROM cars where status='available' AND ${reqParam}=$1 LIMIT 100`;
    return db.query(query, [ppty]);
  }

  static getAllUnsoldCars() {
    return db.query('SELECT id, state, status, price, manufacturer, model, body_type, description, img, owner FROM cars WHERE status=\'available\'');
  }

  static getSingleCar(id) {
    const query = 'SELECT id, state, status, price, manufacturer, model, body_type, description, img FROM cars WHERE id=$1';
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
    const createQuery = 'INSERT INTO cars (id, price, description, img, owner, state, manufacturer, model, body_type) VALUES  ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *';
    return db.query(createQuery, data);
  }

  static getSingleCarAllPpties(id) {
    const query = 'SELECT * FROM cars WHERE id=$1';
    return db.query(query, [id]);
  }

  static updateBySeller(data) {
    const query = 'UPDATE cars SET price=$1, description=$2, status=$3 WHERE id=$4 RETURNING *';
    return db.query(query, data);
  }

  static updateByAdmin(data) {
    const query = 'UPDATE cars SET status=$1 WHERE id=$2 RETURNING *';
    return db.query(query, data);
  }

  static gerUserAds(userId) {
    const query = 'SELECT * FROM cars WHERE owner=$1';
    return db.query(query, [userId]);
  }
}

export default CarService;
