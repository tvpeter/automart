import { Pool } from 'pg';
import winston from '../logger';
import connection from '../../config';

const pool = new Pool({ connectionString: connection });
winston.log('info', `Connected to ${connection} database`);
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
