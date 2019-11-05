'use strict';

const mongoose = require('mongoose');

const images = new mongoose.Schema({
  title: {type: String, required:true},
  user_id: {type: String, required:true, unique:true},
  description: {type: String},
  url: {type: String, required:true},
  created_at: {type: String},
});


module.exports = mongoose.model('images', images);
