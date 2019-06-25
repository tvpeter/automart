import db from './db';

class FlagService {
  static getAllFlags() {
    return db.query('SELECT * FROM flags GROUP BY status, id');
  }

  static deleteFlag(id) {
    const query = 'DELETE FROM flags WHERE id=$1 RETURNING *';
    return db.query(query, [id]);
  }

  static updateFlag(id) {
    const text = 'UPDATE flags SET status=\'resolved\' WHERE id=$1 AND status=\'pending\' RETURNING *';
    return db.query(text, [id]);
  }

  static getReportByUser(data) {
    const query = 'SELECT id FROM flags WHERE carid=$1 AND reportedby=$2';
    return db.query(query, data);
  }

  static getCarOwner(carId) {
    const text = 'SELECT owner FROM cars WHERE id=$1 AND status=\'available\'';
    return db.query(text, [carId]);
  }

  static createNewFlag(data) {
    const text = 'INSERT INTO flags(id, carid, reason, description, reportedby, severity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    return db.query(text, data);
  }
}

export default FlagService;
