import db from './db';

class OrderService {
  static async getOrderPrice(data) {
    try {
      const text = 'SELECT price FROM orders WHERE id=$1 AND buyerid=$2 AND status NOT IN (\'pending\', \'cancelled\')';
      return await db.query(text, data);
    } catch (error) {
      throw error;
    }
  }

  static async updateOrder(data) {
    try {
      const query = 'UPDATE orders SET priceoffered=$1, updated_at=$2 WHERE id=$3 AND buyerid=$4 returning *';
      return await db.query(query, data);
    } catch (error) {
      throw error;
    }
  }

  static async getUserOrders(id) {
    try {
      const text = 'SELECT * FROM orders WHERE sellerid=$1';
      return db.query(text, [id]);
    } catch (error) {
      throw error;
    }
  }

  static async getAllOrders() {
    try {
      return await db.query('SELECT * FROM orders ORDER BY updated_at DESC');
    } catch (error) {
      throw error;
    }
  }

  static async getBuyerAndSeller(id) {
    try {
      const query = 'SELECT buyerid, sellerid, status FROM orders WHERE id=$1';
      return await db.query(query, [id]);
    } catch (error) {
      throw error;
    }
  }

  static async updateOrderStatus(data) {
    try {
      const text = 'UPDATE orders SET status=$1 WHERE id=$2 RETURNING *';
      return await db.query(text, data);
    } catch (error) {
      throw error;
    }
  }

  static async adminDeleteOrder(id) {
    try {
      const query = 'DELETE FROM orders WHERE id=$1 RETURNING *';
      return await db.query(query, [id]);
    } catch (error) {
      throw error;
    }
  }

  static async sellerDeleteOrder(data) {
    try {
      const query = 'DELETE FROM orders WHERE id=$1 AND sellerId=$2 AND status=\'cancelled\' RETURNING *';
      return await db.query(query, data);
    } catch (error) {
      throw error;
    }
  }

  static async getSingleOrder(id) {
    try {
      const text = 'SELECT * FROM orders WHERE id=$1';
      return await db.query(text, [id]);
    } catch (error) {
      throw error;
    }
  }

  static async getCarAndUsersDetails(carId) {
    try {
      const query = 'select cars.id, cars.status carstatus, cars.price, cars.owner, users.status sellerstatus from cars inner join users on cars.owner=users.id where cars.id=$1';
      return await db.query(query, [carId]);
    } catch (error) {
      throw error;
    }
  }

  static async checkOrderInDb(data) {
    try {
      const text = 'SELECT id FROM orders WHERE carid=$1 AND buyerid=$2 AND status NOT IN (\'rejected\', \'cancelled\')';
      return await db.query(text, data);
    } catch (error) {
      throw error;
    }
  }

  static async createOrder(data) {
    try {
      const text = 'INSERT INTO orders (id, buyerid, carid, sellerid, price, priceoffered) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
      return await db.query(text, data);
    } catch (error) {
      throw error;
    }
  }
}

export default OrderService;
