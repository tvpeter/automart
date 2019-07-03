import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import routes from './routes/index';
import winston from './logger';
import uiroutes from '../UI/routes';

dotenv.config();
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('tiny', { stream: winston.stream }));
app.use(cors());

app.use('/css', express.static(path.join(__dirname, '../UI/css')));
app.use('/js', express.static(path.join(__dirname, '../UI/js/')));
app.use('/images', express.static(path.join(__dirname, '../UI/images/')));

app.use('/api/v1', routes);
app.use(uiroutes);
const port = process.env.PORT || 3000;

app.listen(port, () => winston.log('info', `Listening on port ${port}`));

module.exports = app;
