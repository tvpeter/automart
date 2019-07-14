import db from './db';

class UserService {
  static getAllUsers() {
    return db.query('SELECT (id, email, first_name, last_name, address, is_admin, phone, status) FROM users LIMIT 50');
  }

  static getUserByEmail(email) {
    const query = 'SELECT * FROM users WHERE email=$1';
    return db.query(query, [email]);
  }

  static makeUserAdmin(data) {
    const text = 'UPDATE users SET is_admin=$1 WHERE id=$2 AND status=$3 RETURNING id, email, first_name, last_name, is_admin, phone, status';
    return db.query(text, data);
  }

  static disableUser(data) {
    const text = 'UPDATE users SET status=$1 WHERE id=$2 AND status=$3 RETURNING id, email, first_name, last_name, is_admin, phone, status';
    return db.query(text, data);
  }

  static selectPassword(id) {
    const query = 'SELECT password FROM users WHERE id=$1';
    return db.query(query, [id]);
  }

  static updateUserPassword(data) {
    const text = 'UPDATE users SET password=$1 WHERE id=$2 RETURNING id, email, first_name, last_name, phone, status';
    return db.query(text, data);
  }

  static createUser(data) {
    const text = 'INSERT INTO users (id, email, first_name, last_name, password, address, phone) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email, first_name, last_name, address, is_admin, phone, status';
    return db.query(text, data);
  }
}

export default UserService;
