import db from './db';

class OrderService {
  static getOrderPrice(data) {
    const text = 'SELECT price_offered FROM orders WHERE id=$1 AND buyer_id=$2 AND status NOT IN (\'accepted\', \'cancelled\')';
    return db.query(text, data);
  }

  static updateOrder(data) {
    const query = 'UPDATE orders SET new_price_offered=$1, updated_at=$2 WHERE id=$3 AND buyer_id=$4 returning *';
    return db.query(query, data);
  }

  static getUserOrders(id) {
    const text = 'SELECT * FROM orders WHERE seller_id=$1';
    return db.query(text, [id]);
  }

  static getAllOrders() {
    return db.query('SELECT * FROM orders ORDER BY updated_at DESC');
  }

  static getBuyerAndSeller(id) {
    const query = 'SELECT buyer_id, seller_id, status FROM orders WHERE id=$1';
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
    const query = 'DELETE FROM orders WHERE id=$1 AND seller_id=$2 AND status=\'cancelled\' RETURNING *';
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
    const text = 'SELECT id FROM orders WHERE car_id=$1 AND buyer_id=$2 AND status NOT IN (\'rejected\', \'cancelled\')';
    return db.query(text, data);
  }

  static async createOrder(data) {
    const text = 'INSERT INTO orders (id, buyer_id, car_id, seller_id, price, price_offered) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    return db.query(text, data);
  }
}

export default OrderService;
