import express from 'express';
import winston from 'winston';
import routes from './routes/index';
import logger from './logging';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
logger.configure();

app.use('/api/v1', routes);
const port = process.env.PORT || 4000;

app.listen(port, () => winston.log('debug', `Listening on port ${port}`));

module.exports = app;
