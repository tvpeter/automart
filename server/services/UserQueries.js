class UserQueries {
  static createUser() {
    return 'INSERT INTO users (email, first_name, last_name, password, address, phone, account_number, bank, status) VALUES ($em, $fn, $ln, $pa, $ad, $ph, $ac, $ba, $st)';
  }
}

export default UserQueries;
