const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();
const pool = (process.env.NODE_ENV === 'test') ? new Pool({ connectionString: process.env.PG_URL_TEST })
  : new Pool({ connectionString: process.env.PG_URL });
pool.on('connect', () => {
  console.log('info', `Connected to ${process.env.NODE_ENV} Database`);
});
const createTriggerFn = () => {
  const query = 'CREATE OR REPLACE FUNCTION trigger_set_timestamp() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at= NOW(); RETURN NEW; END;';
  pool.query(query).then((res) => {
    console.log('info', res);
    pool.end();
  })
    .catch((err) => {
      console.log('error', err);
      pool.end();
    });
};

const createUsersTable = () => {
  const query = 'CREATE TABLE IF NOT EXISTS users ( id BIGINT PRIMARY KEY, email VARCHAR(30) NOT NULL UNIQUE, first_name VARCHAR(30) NOT NULL, last_name VARCHAR(30) NOT NULL, password VARCHAR(140) NOT NULL, address VARCHAR(400) NOT NULL, isAdmin BOOLEAN NOT NULL DEFAULT FALSE, phone VARCHAR(16) NOT NULL UNIQUE, account_number BIGINT NOT NULL, bank VARCHAR(20) NOT NULL, status VARCHAR(10) NOT NULL DEFAULT \'active\', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()) ';
  pool.query(query).then((res) => {
    console.log('info', res);
    pool.end();
  })
    .catch((err) => {
      console.log('error', err);
      pool.end();
    });
};

const dropUsersTable = () => {
  const query = 'DROP TABLE IF EXISTS users';
  pool.query(query).then((res) => {
    console.log('info', res);
    pool.end();
  }).catch((err) => {
    console.log('error', err);
    pool.end();
  });
};

const createCarsTable = () => {
  const query = 'CREATE TABLE IF NOT EXISTS cars (id BIGINT PRIMARY KEY,  owner BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, created_on TIMESTAMPTZ NOT NULL DEFAULT NOW(), state VARCHAR(8) NOT NULL, status VARCHAR(15) NOT NULL DEFAULT \'available\', price NUMERIC(10, 2) NOT NULL CHECK(price > 0), manufacturer VARCHAR(30) NOT NULL, model VARCHAR(30) NOT NULL, body_type VARCHAR(30) NOT NULL, description TEXT NOT NULL, img VARCHAR(150) NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW() ) ';
  pool.query(query).then((res) => {
    console.log('info', res);
    pool.end();
  }).catch((err) => {
    console.log('error', err);
    pool.end();
  });
};

const dropCarsTable = async () => {
  const query = 'DROP TABLE IF EXISTS cars';
  try {
    const res = await pool.query(query);
    console.log('info', res);
    pool.end();
  } catch (error) {
    console.log('error', error);
    pool.end();
  }
};

const createOrdersTable = () => {
  const query = 'CREATE TABLE IF NOT EXISTS orders (id BIGINT PRIMARY KEY, buyerId BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,  carId BIGINT NOT NULL REFERENCES cars(id) ON DELETE RESTRICT, sellerId BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT, price NUMERIC NOT NULL CHECK(price > 0), status VARCHAR(20) NOT NULL DEFAULT \'pending\', date TIMESTAMPTZ NOT NULL DEFAULT NOW(), priceOffered NUMERIC NOT NULL CHECK(priceOffered > 0), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())';
  pool.query(query).then((res) => {
    console.log('info', res);
    pool.end();
  }).catch((err) => {
    console.log('error', err);
    pool.end();
  });
};

const dropOrdersTable = async () => {
  const query = 'DROP TABLE IF EXISTS orders';

  try {
    const res = await pool.query(query);
    console.log('info', res);
    pool.end();
  } catch (err) {
    console.log('error', err);
    pool.end();
  }
};

const createFlagsTable = () => {
  const query = 'CREATE TABLE IF NOT EXISTS flags (id BIGINT PRIMARY KEY, carId BIGINT REFERENCES cars(id) ON DELETE RESTRICT, created_on TIMESTAMPTZ NOT NULL DEFAULT NOW(), reason VARCHAR(20) NOT NULL, description TEXT, reportedBy BIGINT NOT NULL REFERENCES users(id), status VARCHAR(20) NOT NULL DEFAULT \'pending\', severity VARCHAR(20) NOT NULL DEFAULT \'minor\') ';
  pool.query(query).then((res) => {
    console.log('info', res);
    pool.end();
  }).catch((err) => {
    console.log('error', err);
    pool.end();
  });
};

const dropFlagsTable = async () => {
  const query = 'DROP TABLE IF EXISTS flags';

  try {
    const res = await pool.query(query);
    console.log('info', res);
    pool.end();
  } catch (err) {
    console.log('error', err);
    pool.end();
  }
};

const createTriggerOnTable = (table) => {
  const query = `CREATE TRIGGER set_timestamp BEFORE UPDATE ON ${table} FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp()`;
  pool.query(query).then((res) => {
    console.log('info', res);
  })
    .catch((err) => {
      console.log('error', err);
    });
};

const createAllTables = () => {
  createTriggerFn();
  createUsersTable();
  createCarsTable();
  createTriggerOnTable('cars');
  createOrdersTable();
  createTriggerOnTable('orders');
  createFlagsTable();
};

const dropAllTables = () => {
  dropUsersTable();
  dropCarsTable();
  dropOrdersTable();
  dropFlagsTable();
};

pool.on('remove', () => {
  console.log('info', 'client removed');
  process.exit(0);
});

module.exports = {
  createTriggerFn,
  createUsersTable,
  createCarsTable,
  createOrdersTable,
  createFlagsTable,
  dropUsersTable,
  dropCarsTable,
  dropOrdersTable,
  dropFlagsTable,
  createAllTables,
  dropAllTables,
};

require('make-runnable');
