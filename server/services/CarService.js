import db from './db';

class CarService {
  static async getAllCars() {
    try {
      return await db.query('SELECT * FROM cars');
    } catch (err) {
      throw err;
    }
  }

  static async getCarsInRange(min, max) {
    try {
      const query = 'SELECT id, state, status, price, manufacturer, model, body_type, description, img FROM cars where price BETWEEN $1 AND $2';
      return await db.query(query, [min, max]);
    } catch (err) {
      throw err;
    }
  }

  static async getCarsByProperty(reqParam, ppty) {
    try {
      const query = `SELECT id, state, status, price, manufacturer, model, body_type, description, img FROM cars where status='available' AND ${reqParam}=$1 LIMIT 100`;
      return await db.query(query, [ppty]);
    } catch (err) {
      throw err;
    }
  }

  static async getAllUnsoldCars() {
    try {
      return await db.query('SELECT id, state, status, price, manufacturer, model, body_type, description, img, owner FROM cars WHERE status=\'available\'');
    } catch (error) {
      throw error;
    }
  }

  static async getSingleCar(id) {
    try {
      const query = 'SELECT id, state, status, price, manufacturer, model, body_type, description, img FROM cars WHERE id=$1';
      return await db.query(query, [id]);
    } catch (err) {
      throw err;
    }
  }

  static async deleteCar(id) {
    try {
      const query = 'DELETE FROM cars WHERE id=$1 RETURNING *';
      return await db.query(query, [id]);
    } catch (error) {
      throw error;
    }
  }

  static async getCarsByUser(data) {
    try {
      const carsByUser = 'SELECT id FROM cars WHERE owner=$1 AND state=$2 AND status=\'available\' AND manufacturer=$3 AND model=$4 AND body_type=$5';
      return await db.query(carsByUser, data);
    } catch (error) {
      throw error;
    }
  }

  static async createCar(data) {
    try {
      const createQuery = 'INSERT INTO cars (id, price, description, img, owner, state, manufacturer, model, body_type) VALUES  ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *';
      return await db.query(createQuery, data);
    } catch (error) {
      throw error;
    }
  }

  static async getSingleCarAllPpties(id) {
    try {
      const query = 'SELECT * FROM cars WHERE id=$1';
      return await db.query(query, [id]);
    } catch (error) {
      throw error;
    }
  }

  static async updateBySeller(data) {
    try {
      const query = 'UPDATE cars SET price=$1, description=$2, status=$3 WHERE id=$4 RETURNING *';
      return await db.query(query, data);
    } catch (error) {
      throw error;
    }
  }

  static async updateByAdmin(data) {
    try {
      const query = 'UPDATE cars SET status=$1 WHERE id=$2 RETURNING *';
      return await db.query(query, data);
    } catch (error) {
      throw error;
    }
  }
}

export default CarService;
