/* eslint-disable import/no-extraneous-dependencies */
import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../index';


const { expect } = chai;
chai.use(chaiHttp);

describe('User routes', () => {
  describe('User get routes', () => {
    it('should status 200 if index page is requested', async () => {
      const res = await chai.request(server).get('/');
      expect(res.status).to.eq(200);
    });
    it('should status 200 if signup page is requested', async () => {
      const res = await chai.request(server).get('/signup');
      expect(res.status).to.eq(200);
    });
    it('should status 200 if signin page is requested', async () => {
      const res = await chai.request(server).get('/signin');
      expect(res.status).to.eq(200);
    });
    it('should status 200 if index page is request', async () => {
      const res = await chai.request(server).get('/details');
      expect(res.status).to.eq(200);
    });
    it('should status 200 if index page is request', async () => {
      const res = await chai.request(server).get('/products');
      expect(res.status).to.eq(200);
    });
    it('should status 200 if index page is request', async () => {
      const res = await chai.request(server).get('/contact');
      expect(res.status).to.eq(200);
    });
    it('should status 200 if index page is request', async () => {
      const res = await chai.request(server).get('/profile');
      expect(res.status).to.eq(200);
    });
    it('should status 200 if index page is request', async () => {
      const res = await chai.request(server).get('/createad');
      expect(res.status).to.eq(200);
    });
    it('should status 200 if index page is request', async () => {
      const res = await chai.request(server).get('/userads');
      expect(res.status).to.eq(200);
    });
  });
});
