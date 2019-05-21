import express from 'express';
import User from './controllers/UserController';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/api/v1/users', User.create);
app.get('/api/v1/users', User.getAll);
app.get('/api/v1/', (req, res) => res.status(200).send('Hello world'));

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;
