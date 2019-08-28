const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const User = require('./User');
const util = require('util');

const TodoSchema = mongoose.Schema({
    title: {
      type: String,
      required: [true, `can't be blank`],
      unique: true,
      index: true
    },
    description: {
      type: String,
    },
    isFinished: Boolean,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
}, { timestamps: true });

TodoSchema.plugin(uniqueValidator, { message: 'is already taken.' });

TodoSchema.methods.toJSON = function() {
  return {
    title: this.title,
    description: this.description,
    isFinished: this.isFinished,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  }
};

module.exports = mongoose.model('Todo', TodoSchema);
