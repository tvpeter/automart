import db from './db';

class OrderService {
  static getOrderPrice(data) {
    const text = 'SELECT price FROM orders WHERE id=$1 AND buyerid=$2 AND status NOT IN (\'pending\', \'cancelled\')';
    return db.query(text, data);
  }

  static updateOrder(data) {
    const query = 'UPDATE orders SET priceoffered=$1, updated_at=$2 WHERE id=$3 AND buyerid=$4 returning *';
    return db.query(query, data);
  }

  static getUserOrders(id) {
    const text = 'SELECT * FROM orders WHERE sellerid=$1';
    return db.query(text, [id]);
  }

  static getAllOrders() {
    return db.query('SELECT * FROM orders ORDER BY updated_at DESC');
  }

  static getBuyerAndSeller(id) {
    const query = 'SELECT buyerid, sellerid, status FROM orders WHERE id=$1';
    return db.query(query, [id]);
  }

  static updateOrderStatus(data) {
    const text = 'UPDATE orders SET status=$1 WHERE id=$2 RETURNING *';
    return db.query(text, data);
  }

  static adminDeleteOrder(id) {
    const query = 'DELETE FROM orders WHERE id=$1 RETURNING *';
    return db.query(query, [id]);
  }

  static sellerDeleteOrder(data) {
    const query = 'DELETE FROM orders WHERE id=$1 AND sellerId=$2 AND status=\'cancelled\' RETURNING *';
    return db.query(query, data);
  }

  static getSingleOrder(id) {
    const text = 'SELECT * FROM orders WHERE id=$1';
    return db.query(text, [id]);
  }

  static getCarAndUsersDetails(carId) {
    const query = 'select cars.id, cars.status carstatus, cars.price, cars.owner, users.status sellerstatus from cars inner join users on cars.owner=users.id where cars.id=$1';
    return db.query(query, [carId]);
  }

  static async checkOrderInDb(data) {
    const text = 'SELECT id FROM orders WHERE carid=$1 AND buyerid=$2 AND status NOT IN (\'rejected\', \'cancelled\')';
    return db.query(text, data);
  }

  static async createOrder(data) {
    const text = 'INSERT INTO orders (id, buyerid, carid, sellerid, price, priceoffered) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    return db.query(text, data);
  }
}

export default OrderService;
