import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../../src/index';

const { expect } = chai;
chai.use(chaiHttp);

describe('User controller', () => {
  let data;
  beforeEach((done) => {
    data = {
      email: 'peter@gmail.com',
      first_name: 'Anthonia',
      last_name: 'Tyonum',
      password: 'power',
      address: 'my address',
      phone: '08137277480',
      account_number: '2081769837',
      bank: 'UBA',
    };
    done();
  });
  describe('User create', () => {
    it('should return error if all required fields are not supplied', (done) => {
      data.email = '';
      chai.request(server).post('/api/v1/users').send(data).end((req, res) => {
        expect(res.status).to.eq(400);
        expect(res.body).to.have.property('message');
        done();
      });
    });

    it('should return a new user with the supplied properties', (done) => {
      chai.request(server).post('/api/v1/users').send(data).end((req, res) => {
        expect(res.status).to.eq(201);
        expect(res.body).to.be.a('object');
        // get the keys and iterate
        const keys = Object.keys(data);
        keys.forEach((key) => {
          expect(res.body).to.have.property(key).equal(data[key]);
        });
        done();
      });
    });

  });
});
