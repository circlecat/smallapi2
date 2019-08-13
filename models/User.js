const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const crypto = require('crypto');
const util = require('util');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, `can't be blank`],
    match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
    index: true
  },
  email: {
    type: String, 
    lowercase: true, 
    unique: true, 
    required: [true, "can't be blank"], 
    match: [/\S+@\S+\.\S+/, 'is invalid'], 
    index: true
  },
  hash: String,
  salt: String
}, { timestamps: true });

UserSchema.plugin(uniqueValidator, { message: 'is already taken.' });

const pbkdf2 = util.promisify(crypto.pbkdf2).bind(crypto);

UserSchema.methods.validPassword = (password) => {
  const hash = crypto.pbkdf2(password, this.salt, 1000, 512, 'sha512').toString('hex');
  return this.hash === hash;
}

UserSchema.methods.setPassword = async (password) => {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = await pbkdf2(password, this.salt, 1000, 512, 'sha512').toString('hex');
}

mongoose.model('User', UserSchema);