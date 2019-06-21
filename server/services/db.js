import { Pool } from 'pg';
import dotenv from 'dotenv';
import winston from '../logger';

dotenv.config();
const pool = (process.env.NODE_ENV === 'test') ? new Pool({ connectionString: process.env.PG_URL_TEST })
  : new Pool({ connectionString: process.env.PG_URL });

winston.log('info', `Connected to ${process.env.NODE_ENV} database`);

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
