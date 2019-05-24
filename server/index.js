import express from 'express';
import routes from './routes/index';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1', routes);

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;
