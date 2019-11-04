'use strict';

const User = require('./users-model.js');

module.exports = (req, res, next) => {
  
  try {
    let [authType, authString] = req.headers.authorization.split(/\s+/);
    
    switch( authType.toLowerCase() ) {
    case 'basic': 
      return _authBasic(authString);
    case 'bearer':
      return _authBearer(authString);
    default: 
      return _authError();
    }
  }
  catch(e) {
    _authError();
  }
  
  /**
   * A function that uses authBasic to buffer the password
   * @params {string} - string password
   * @returns {object} - if the password is correct, the user object is returned
   */
  function _authBasic(str) {
    // str: am9objpqb2hubnk=
    let base64Buffer = Buffer.from(str, 'base64'); // <Buffer 01 02 ...>
    let bufferString = base64Buffer.toString();    // john:mysecret
    let [username, password] = bufferString.split(':'); // john='john'; mysecret='mysecret']
    let auth = {username,password}; // { username:'john', password:'mysecret' }
    
    return User.authenticateBasic(auth)
      .then(user => _authenticate(user) )
      .catch(next);
  }

  /**
   * A function that uses bearer authentication
   * @params {string} - authString
   * @returns {object} - user object if the request is validated
   */
  function _authBearer(authString) {
    console.log('first log', authString);
    return User.authenticateToken(authString)
      .then( user => _authenticate(user) )
      .catch(next);
  }

  /**
   * A function used to authenticate the user with a token
   * @params {object} - user
   * @returns {} - a token is generated
   */
  function _authenticate(user) {
    if(user) {
      req.user = user;
      req.token = user.generateToken();
      next();
    }
    else {
      _authError();
    }
  }
  
  function _authError() {
    next('Invalid User ID/Password');
  }
  
};