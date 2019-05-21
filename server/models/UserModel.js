class UserModel {
  /**
       * class constructor
       */
  constructor() {
    this.users = [];
  }

  /**
     * @param {*} data
     * returns user object
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
    };
    this.users.push(newUser);
    return newUser;
  }
}

export default new UserModel();
