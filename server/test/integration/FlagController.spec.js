// import chai from 'chai';
// import chaiHttp from 'chai-http';
// import carsData from '../carsData';
// import server from '../../index';
// import CarModel from '../../models/CarModel';
// // import UserModel from '../../models/UserModel';
// import generateToken from '../../lib/generateToken';
// import usersData from '../usersData';
// import flagsData from '../flagsData';
// import FlagModel from '../../models/FlagModel';


// const { expect } = chai;
// chai.use(chaiHttp);

// describe('Flags controller', () => {
//   describe('Create a flag', () => {
//     it('should create a flag on an ad', (done) => {
//       carsData[0].owner = usersData[1].id;
//       CarModel.cars = carsData;
//       // UserModel.users = usersData;

//       const user = usersData[0];
//       user.isAdmin = false;
//       const token = generateToken(user.id, user.isAdmin);
//       const data = {
//         carId: carsData[0].id,
//         reason: 'Wrong Description',
//         description: 'The car description is misleading',
//         reportedBy: user.id,
//       };
//       chai.request(server).post('/api/v1/flag').set('x-auth', token).send(data)
//         .end((err, res) => {
//           expect(res.status).to.eq(200);
//           expect(res.body.data).to.have.property('id');
//           expect(res.body.data).to.have.property('carId').eq(data.carId);
//           expect(res.body.data.reason).to.eq(data.reason);
//           done();
//         });
//     });
//     it('should return error 400 if reason is not stated', (done) => {
//       carsData[0].owner = usersData[1].id;
//       CarModel.cars = carsData;
//       // UserModel.users = usersData;

//       const user = usersData[0];
//       user.isAdmin = false;
//       const token = generateToken(user.id, user.isAdmin);
//       const data = {
//         carId: carsData[0].id,
//         reason: '',
//         description: 'Weird description of the car by the owner',
//         reportedBy: user.id,
//       };
//       chai.request(server).post('/api/v1/flag').set('x-auth', token).send(data)
//         .end((err, res) => {
//           expect(res.status).to.eq(400);
// eslint-disable-next-line max-len
//           expect(res.body.message).to.eq('Ensure to indicate the ad id and reason for the report');
//           done();
//         });
//     });
//     it('should return error 400 if ad id is not stateds', (done) => {
//       carsData[0].owner = usersData[1].id;
//       CarModel.cars = carsData;
//       // UserModel.users = usersData;

//       const user = usersData[0];
//       user.isAdmin = false;
//       const token = generateToken(user.id, user.isAdmin);
//       const data = {
//         carId: '',
//         reason: 'stolen',
//         description: 'Weird description of the car by the owner',
//         reportedBy: user.id,
//       };
//       chai.request(server).post('/api/v1/flag').set('x-auth', token).send(data)
//         .end((err, res) => {
//           expect(res.status).to.eq(400);
// eslint-disable-next-line max-len
//           expect(res.body.message).to.eq('Ensure to indicate the ad id and reason for the report');
//           done();
//         });
//     });
//     it('should return error 404 if ad is not found', (done) => {
//       carsData[0].owner = usersData[1].id;
//       CarModel.cars = carsData;
//       // UserModel.users = usersData;

//       const user = usersData[0];
//       user.isAdmin = false;
//       const token = generateToken(user.id, user.isAdmin);
//       const data = {
//         carId: carsData[0] + 1,
//         reason: 'stolen',
//         description: 'Weird description of the car by the owner',
//         reportedBy: user.id,
//       };
//       chai.request(server).post('/api/v1/flag').set('x-auth', token).send(data)
//         .end((err, res) => {
//           expect(res.status).to.eq(404);
//           expect(res.body.message).to.eq('The ad is not longer active. Thank you.');
//           done();
//         });
//     });
//     it('should return error 404 if the status of the ad is not equal available', (done) => {
//       carsData[0].owner = usersData[1].id;
//       CarModel.cars = carsData;
//       // UserModel.users = usersData;
//       carsData[1].status = 'sold';

//       const user = usersData[0];
//       user.isAdmin = false;
//       const token = generateToken(user.id, user.isAdmin);
//       const data = {
//         carId: carsData[1],
//         reason: 'stolen',
//         description: 'Weird description of the car by the owner',
//         reportedBy: user.id,
//       };
//       chai.request(server).post('/api/v1/flag').set('x-auth', token).send(data)
//         .end((err, res) => {
//           expect(res.status).to.eq(404);
//           expect(res.body.message).to.eq('The ad is not longer active. Thank you.');
//           done();
//         });
//     });
// eslint-disable-next-line max-len
//     it('should create an extreme flag if car is flag as stolen or fake or suspicious', (done) => {
//       carsData[0].owner = usersData[1].id;
//       CarModel.cars = carsData;
//       // UserModel.users = usersData;

//       const user = usersData[0];
//       user.isAdmin = false;
//       const token = generateToken(user.id, user.isAdmin);
//       const data = {
//         carId: carsData[0].id,
//         reason: 'stolen',
//         description: 'Weird description of the car by the owner',
//         reportedBy: user.id,
//       };
//       chai.request(server).post('/api/v1/flag').set('x-auth', token).send(data)
//         .end((err, res) => {
//           expect(res.status).to.eq(200);
//           expect(res.body.data.severity).to.eq('extreme');
//           done();
//         });
//     });
//   });
//   describe('Update a flag', () => {
//     it('should update a flag status to resolved', () => {
//       flagsData[0].status = 'pending';
//       const { id } = flagsData[0];
//       FlagModel.flags = flagsData;
//       // UserModel.users = usersData;

//       const user = usersData[0];
//       user.isAdmin = true;
//       const token = generateToken(user.id, user.isAdmin);

//       chai.request(server).patch(`/api/v1/flag/${id}`).set('x-auth', token)
//         .end((err, res) => {
//           expect(res.status).to.eq(200);
//           expect(res.body.data.id).to.eq(id);
//           expect(res.body.data.status).to.eq('resolved');
//         });
//     });
//     it('should return error 401 if user is not logged in', () => {
//       flagsData[0].status = 'pending';
//       const { id } = flagsData[0];
//       FlagModel.flags = flagsData;

//       chai.request(server).patch(`/api/v1/flag/${id}`)
//         .end((err, res) => {
//           expect(res.status).to.eq(401);
//           expect(res.body.message).to.eq('No authorization token provided');
//         });
//     });
//     it('should return error 401 if logged in user is not admin', () => {
//       flagsData[0].status = 'pending';
//       const { id } = flagsData[0];
//       FlagModel.flags = flagsData;
//       // UserModel.users = usersData;

//       const user = usersData[0];
//       user.isAdmin = false;
//       const token = generateToken(user.id, user.isAdmin);
//       chai.request(server).patch(`/api/v1/flag/${id}`).set('x-auth', token)
//         .end((err, res) => {
//           expect(res.status).to.eq(401);
//           expect(res.body.message).to.eq('You dont have the permission to access this resource');
//         });
//     });
//     it('should return error 404 if flag id is wrong', () => {
//       flagsData[0].status = 'pending';
//       const { id } = flagsData[0];
//       FlagModel.flags = flagsData;
//       // UserModel.users = usersData;

//       const user = usersData[0];
//       user.isAdmin = true;
//       const token = generateToken(user.id, user.isAdmin);
//       chai.request(server).patch(`/api/v1/flag/${id + 1}`).set('x-auth', token)
//         .end((err, res) => {
//           expect(res.status).to.eq(404);
//           expect(res.body.message).to.eq('Flag not found');
//         });
//     });
//   });
//   describe('Get all flags', () => {
//     it('should return all flags', (done) => {
//       const user = usersData[0];
//       FlagModel.flags = flagsData;
//       user.isAdmin = true;
//       const token = generateToken(user.id, user.isAdmin);
//       chai.request(server).get('/api/v1/flags').set('x-auth', token).end((err, res) => {
//         expect(res.status).to.eq(200);
//         expect(res.body.data).to.be.an('Array');
//         expect(res.body.data[0]).to.be.an('Object');
//         done();
//       });
//     });
//     it('should return error 404 if there are no flags', (done) => {
//       const user = usersData[0];
//       FlagModel.flags = [];

//       user.isAdmin = true;
//       const token = generateToken(user.id, user.isAdmin);
//       chai.request(server).get('/api/v1/flags').set('x-auth', token).end((err, res) => {
//         expect(res.status).to.eq(404);
//         expect(res.body.message).to.eq('There are no flags now.');
//         done();
//       });
//     });
//     it('should return error 401 if user is not logged in', (done) => {
//       FlagModel.flags = flagsData;

//       chai.request(server).get('/api/v1/flags').end((err, res) => {
//         expect(res.status).to.eq(401);
//         expect(res.body.message).to.eq('No authorization token provided');
//         done();
//       });
//     });
//     it('should return error 401 if user is not admin', (done) => {
//       const user = usersData[0];
//       FlagModel.flags = flagsData;
//       user.isAdmin = false;
//       const token = generateToken(user.id, user.isAdmin);
//       chai.request(server).get('/api/v1/flags').set('x-auth', token).end((err, res) => {
//         expect(res.status).to.eq(401);
//         expect(res.body.message).to.eq('You dont have the permission to access this resource');
//         done();
//       });
//     });
//   });
//   describe('Admin can delete a given flag', () => {
//     it('should delete a given flag id', (done) => {
//       const user = usersData[0];
//       const flagId = flagsData[0].id;
//       FlagModel.flags = flagsData;
//       user.isAdmin = true;
//       const token = generateToken(user.id, user.isAdmin);
// eslint-disable-next-line max-len
//       chai.request(server).delete(`/api/v1/flags/${flagId}`).set('x-auth', token).end((err, res) => {
//         expect(res.status).to.eq(200);
//         expect(res.body.message).to.eq('Flag successfully deleted');
//         done();
//       });
//     });
//     it('should return error 404 if flag is not found', (done) => {
//       const user = usersData[0];
//       const flagId = flagsData[0].id + 1;
//       FlagModel.flags = flagsData;
//       user.isAdmin = true;
//       const token = generateToken(user.id, user.isAdmin);
// eslint-disable-next-line max-len
//       chai.request(server).delete(`/api/v1/flags/${flagId}`).set('x-auth', token).end((err, res) => {
//         expect(res.status).to.eq(404);
//         expect(res.body.message).to.eq('The flag is no longer available');
//         done();
//       });
//     });
//     it('should return error 401 if user is not logged in', (done) => {
//       const flagId = flagsData[0].id;
//       FlagModel.flags = flagsData;
//       chai.request(server).delete(`/api/v1/flags/${flagId}`).end((err, res) => {
//         expect(res.status).to.eq(401);
//         expect(res.body.message).to.eq('No authorization token provided');
//         done();
//       });
//     });
//     it('should return error 401 if user is not admin', (done) => {
//       const user = usersData[0];
//       const flagId = flagsData[0].id;
//       FlagModel.flags = flagsData;
//       user.isAdmin = false;
//       const token = generateToken(user.id, user.isAdmin);
// eslint-disable-next-line max-len
//       chai.request(server).delete(`/api/v1/flags/${flagId}`).set('x-auth', token).end((err, res) => {
//         expect(res.status).to.eq(401);
//         expect(res.body.message).to.eq('You dont have the permission to access this resource');
//         done();
//       });
//     });
//   });
// });
