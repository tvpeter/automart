import db from './db';

class UserService {
  static async getAllUsers() {
    try {
      return await db.query('SELECT (id, email, first_name, last_name, address, isAdmin, phone, status) FROM users LIMIT 50');
    } catch (error) {
      throw error;
    }
  }

  static async getUserByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email=$1';
      return await db.query(query, [email]);
    } catch (error) {
      throw error;
    }
  }

  static async makeUserAdmin(data) {
    try {
      const text = 'UPDATE users SET isadmin=$1 WHERE id=$2 AND status=$3 RETURNING id, email, first_name, last_name, isadmin, phone, status';
      return await db.query(text, data);
    } catch (error) {
      throw error;
    }
  }

  static async disableUser(data) {
    try {
      const text = 'UPDATE users SET status=$1 WHERE id=$2 AND status=$3 RETURNING id, email, first_name, last_name, isadmin, phone, status';
      return await db.query(text, data);
    } catch (error) {
      throw error;
    }
  }

  static async selectPassword(id) {
    try {
      const query = 'SELECT password FROM users WHERE id=$1';
      return await db.query(query, [id]);
    } catch (error) {
      throw error;
    }
  }

  static async updateUserPassword(data) {
    try {
      const text = 'UPDATE users SET password=$1 WHERE id=$2 RETURNING id, email, first_name, last_name, phone, status';
      return await db.query(text, data);
    } catch (error) {
      throw error;
    }
  }

  static async createUser(data) {
    try {
      const text = 'INSERT INTO users (id, email, first_name, last_name, password, address, phone, account_number, bank) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, email, first_name, last_name, address, isadmin, phone, status';
      return await db.query(text, data);
    } catch (error) {
      // if (error.routine === '_bt_check_unique') {
      //   throw Error('User with given email or phone already exist');
      // }
      throw error;
    }
  }
}

export default UserService;
