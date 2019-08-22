const mongoose = require('mongoose');
const joi = require('@hapi/joi');
const { DEFAULT_SEARCH_FIELD } = require('../utils/constants');

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
    },
    ABN: {
        type: String,
        required: true,
        unique: true,
        default: ''
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
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    streetAddress: {
        type: String,
        required: true,
        lowercase: true,
        default: ''
    },
    postcode: {
        type: String,
        required: true
    },
    rate: {
        type: Number,
    },
    categories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
        }
    ],
    orders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        }
    ]
},
    {
        timestamps: true,
        toJSON: {
            virtuals: true
        }
    });

schema.statics.searchByFilters = async function (searchField, searchValue, pageRequested, pageSize, sortType, sortValue) {
    if (isNaN(pageSize) || parseInt(pageSize) <= 0) {
        return 'pageSize is invalid';
    }
    if (isNaN(pageRequested) || parseInt(pageRequested) <= 0) {
        return 'pageRequested is invalid';
    }
    if (parseInt(sortValue) !== 1 && parseInt(sortValue) !== -1) {
        return 'sortValue is invalid';
    }

    let query;
    if (!searchField || searchField === DEFAULT_SEARCH_FIELD) {
        query = this.find();
    } else {
        query = this.find({ [searchField]: new RegExp(searchValue, 'i') });
    }

    const data = await query.skip((parseInt(pageRequested) - 1) * parseInt(pageSize))
        .limit(parseInt(pageSize))
        .sort({ [sortType]: parseInt(sortValue) })
        .exec();

    return data;
}

const model = mongoose.model('Business', schema);

module.exports = model;