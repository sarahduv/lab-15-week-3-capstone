'use strict';

const app = require('../src/app');
const User = require('../src/model/user');
const supergoose = require('./supergoose');
const request = supergoose.server((app.server));
const jwt = require('jsonwebtoken');

beforeAll(supergoose.startDB);
afterAll(supergoose.stopDB);

describe('Testing express routes', () => {
  const authTestUser = { username: 'userman', password: 'private', email: 'userman@test.com' };

  describe('authentication routes', () => {
    it('Should be able to signup', (done) => {
      return request.post('/signup')
        .send(authTestUser)
        .then(response => {
          const parsedToken = jwt.verify(response.text, process.env.SECRET);
          expect(response.status).toBe(200);
          expect(parsedToken.id).toBeDefined();
          done();
        });
    });

    it('should be able to sign in', (done) => {
      return request.post('/signin')
        .auth('userman', 'private')
        .then(response => {
          const parsedToken = jwt.verify(response.text, process.env.SECRET);
          expect(response.status).toBe(200);
          expect(parsedToken.id).toBeDefined();
          done();
        });
    });
  });



  describe('Resource routes', () => {
    it('should be able to fetch images', async (done) => {
      const mongoUser = await User.findOne({username: 'userman'});
      const token = mongoUser.generateToken();
      return request.get('/images')
        .set('Authorization', `Bearer ${token}`)
        .then(response => {
          expect(response.status).toBe(200);
          expect(response.body.length).toBe(0);
          done();
        });
    });

    it ('should be able to post an image', async(done) => {
      const mongoUser = await User.findOne({username: 'userman'});
      const token = mongoUser.generateToken();
      return request.post('/images')
        .set('Authorization', `Bearer ${token}`)
        .send({title: 'test', user_id: mongoUser._id, url: 'image.location'})
        .then(response => {
          expect(response.status).toBe(200);
          expect(response.body.title).toBe('test');
          expect(response.body.user_id).toBe(`${mongoUser._id}`);
          done();
        });
    });
  });
});