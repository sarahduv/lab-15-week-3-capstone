'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const users = new mongoose.Schema({
  username: {type:String, required:true, unique:true},
  password: {type:String, required:true},
  email: {type: String},
});


users.pre('save', async function() {
  if (this.isModified('password'))
  {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

/**
 * A function that creates a new user using Oauth
 * @params {string} - email
 * @returns {object} - returns the user object
 */
users.statics.createFromOauth = function(email) {

  if(! email) { return Promise.reject('Validation Error'); }

  return this.findOne( {email} )
    .then(user => {
      if( !user ) { throw new Error('User Not Found'); }
      console.log('Welcome Back', user.username);
      return user;
    })
    // eslint-disable-next-line no-unused-vars
    .catch( error => {
      console.log('Creating new user');
      let username = email;
      let password = 'none';
      return this.create({username, password, email});
    });

};

/**
 * A function that authenticates a token
 * @params {string} - token
 * @returns {object} - this object query
 */
users.statics.authenticateToken = function(token) {
  console.log('token is ', token);
  let parsedToken = jwt.verify(token, process.env.SECRET);
  console.log('parsed token is  ', parsedToken);
  // if (Date.now() - parsedToken.generatedAt > (1400*60)) {
  //   throw new Error('Token has expired');
  // }
  let query = {_id: parsedToken.id};
  console.log('query is', query);
  return this.findOne(query);
};




/**
 * A function that authenticates in basic form
 * @params {object} - auth - username and password
 * @returns {object} - if the request is valid
 */
users.statics.authenticateBasic = function(auth) {
  let query = {username:auth.username};
  return this.findOne(query)
    .then( user => user && user.comparePassword(auth.password) )
    .catch(error => {throw error;});
};

/**
 * A function that compares passwords
 * @params {string} - password
 * @returns {object} - user object if the request is valid
 * @returns {null} - if the request is invalid 
 */
users.methods.comparePassword = function(password) {
  return bcrypt.compare( password, this.password )
    .then( valid => valid ? this : null);
};

/**
 * A function that generats a token
 * @params {none}
 * @returns {string} - token from jwt
 */
users.methods.generateToken = function() {

  let token = {
    id: this._id,
    role: this.role,
    generatedAt: Date.now(),
  };

  return jwt.sign(token, process.env.SECRET);
};

module.exports = mongoose.model('users', users);
