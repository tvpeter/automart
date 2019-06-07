import usersdata from '../test/usersData';

class UserModel {
  constructor() {
    this.users = usersdata;
  }

  /**
   * @param {Object} data
   * @returns {Object}
   */
  create(data) {
    const newUser = {
      id: Math.floor(Math.random() * 100000) + 1 + Date.now(),
      email: data.email || '',
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      password: data.password || '',
      address: data.address || '',
      isAdmin: data.isAdmin || false,
      phone: data.phone || '',
      account_number: data.account_number || '',
      bank: data.bank || '',
      status: 'active',
    };
    this.users.push(newUser);
    return newUser;
  }

  /**
   * @description - function to check whether the given value already exist in the db
   * @param {string} ppty
   * @param {string} value
   * @returns {object} found user or undefined
   */
  findByProperty(ppty, value) {
    return this.users.find(user => user[ppty] === value);
  }

  getAllUsers() {
    return this.users;
  }

  /**
   * @param {Number} userid
   * @param {String} newPassword - new hashed password
   * @returns {Object}
   */
  changePassword(userid, newPassword) {
    const user = this.getUser(userid);
    user.password = newPassword || user.password;
    return user;
  }

  /**
   * @description - get a user
   * @param {Number} userid
   * @returns {Object}
   */
  getUser(userid) {
    return this.users.find(user => user.id === parseInt(userid, 10));
  }

  /**
   *@description Returns an active user by specified property
   * @param {} ppty [id, email, phone]
   * @param {*} val
   * @returns {Object} User object;
   */
  isUserActive(ppty, val) {
    const user = (ppty.toLowerCase() === 'id') ? this.getUser(val) : this.findByProperty(ppty, val);
    if (!user || user.status.toLowerCase() !== 'active') {
      return false;
    }
    return user;
  }

  /**
   * @param {Number}
   * @returns {Object}
   */
  makeUserAdmin(userId) {
    const user = this.getUser(userId);
    user.isAdmin = true;
    return user;
  }

  /**
   * @description - disable a user using userId
   * @param {Number} userId
   */
  disableUser(userId) {
    const user = this.getUser(userId);
    user.status = 'disabled';
    return user;
  }
}

export default new UserModel();
