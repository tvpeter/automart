import { Pool } from 'pg';
import winston from '../logger';

let connection; let envt;
if (process.env.NODE_ENV === 'test') {
  connection = process.env.PG_URL_TEST;
  envt = 'test';
} else if (process.env.NODE_ENV === 'development') {
  connection = process.env.PG_URL;
  envt = 'development';
} else if (process.env.NODE_ENV === 'production') {
  connection = process.env.DATABASE_URL;
  envt = 'production';
}
const pool = new Pool({ connectionString: connection });
winston.log('info', `Connected to ${envt} database`);

export default {
  query(text, params) {
    return new Promise((resolve, reject) => {
      pool.query(text, params)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },
};
