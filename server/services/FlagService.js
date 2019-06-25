import db from './db';

class FlagService {
  static async getAllFlags() {
    try {
      return await db.query('SELECT * FROM flags GROUP BY status, id');
    } catch (error) {
      throw error;
    }
  }

  static async deleteFlag(id) {
    try {
      const query = 'DELETE FROM flags WHERE id=$1 RETURNING *';
      return await db.query(query, [id]);
    } catch (error) {
      throw error;
    }
  }

  static async updateFlag(id) {
    try {
      const text = 'UPDATE flags SET status=\'resolved\' WHERE id=$1 AND status=\'pending\' RETURNING *';
      return await db.query(text, [id]);
    } catch (error) {
      throw error;
    }
  }

  static async getReportByUser(data) {
    try {
      const query = 'SELECT id FROM flags WHERE carid=$1 AND reportedby=$2';
      return await db.query(query, data);
    } catch (error) {
      throw error;
    }
  }

  static async getCarOwner(carId) {
    try {
      const text = 'SELECT owner FROM cars WHERE id=$1 AND status=\'available\'';
      return await db.query(text, [carId]);
    } catch (error) {
      throw error;
    }
  }

  static async createNewFlag(data) {
    try {
      const text = 'INSERT INTO flags(id, carid, reason, description, reportedby, severity) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
      return await db.query(text, data);
    } catch (error) {
      throw error;
    }
  }
}

export default FlagService;
