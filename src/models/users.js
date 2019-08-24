const mongoose = require('mongoose');
const joi = require('@hapi/joi');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        validate: {
            validator: email => !joi.validate(email, joi.string().email()).error,
            msg: 'Invalid email format'
        }
    },
    hashPassword: {
        type: String,
        required: true
    }
});

const model = mongoose.model('User', schema);

module.exports = model;