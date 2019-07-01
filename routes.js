import express from 'express';
import path from 'path';

const router = express.Router();

router.get('/', (req, res) => res.status(200).sendFile(path.join(`${__dirname}/index.html`)));
router.get('/signup', (req, res) => res.status(200).sendFile(path.join(`${__dirname}/signup.html`)));
router.get('/signin', (req, res) => res.status(200).sendFile(path.join(`${__dirname}/login.html`)));
router.get('/details', (req, res) => res.status(200).sendFile(path.join(`${__dirname}/details.html`)));
router.get('/products', (req, res) => res.status(200).sendFile(path.join(`${__dirname}/products.html`)));
router.get('/contact', (req, res) => res.status(200).sendFile(path.join(`${__dirname}/contact.html`)));
router.get('/profile', (req, res) => res.status(200).sendFile(path.join(`${__dirname}/userprofile.html`)));

export default router;
