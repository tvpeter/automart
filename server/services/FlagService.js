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
      return await db.query(query, id);
    } catch (error) {
      throw error;
    }
  }

  static async updateFlag(id) {
    try {
      const text = 'UPDATE flags SET status=\'resolved\' WHERE id=$1 AND status=\'pending\' RETURNING *';
      return await db.query(text, id);
    } catch (error) {
      throw error;
    }
  }
}

export default FlagService;
