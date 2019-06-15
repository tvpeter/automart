import express from 'express';
import morgan from 'morgan';
import routes from './routes/index';
import winston from './logger';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('tiny', { stream: winston.stream }));

app.use('/api/v1', routes);
const port = process.env.PORT || 4000;

app.listen(port, () => winston.log('info', `Listening on port ${port}`));

module.exports = app;
