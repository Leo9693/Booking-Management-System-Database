const mongoose = require('mongoose');
const { DEFAULT_SEARCH_FIELD } = require('../utils/constants');

const schema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['ongoing', 'finished'],
        default: 'ongoing'
    },
    jobEstimatedTime: {
        type: Date,
    },
    jobLocation: {
        type: String,
        default: '',
        lowercase: true,
        required: true,
    },
    rate: {
        type: Number,
        enum: [0, 1, 2, 3, 4, 5],
        validate: (rate) => {
            if (rate < 0 || rate > 5) {
                return false;
            }
            return true;
        }
    },
    comment: {
        type: String
    }
},
    {
        timestamps: true,
        toJSON: {
            virtuals: true
        }
    });

schema.statics.searchByFilters = async function (searchField, searchValue, pageRequested, pageSize, sortType, sortValue) {
    if (isNaN(pageSize) || parseInt(pageSize) <= 0) {
        return 'Page Size is invalid';
    }

    if (isNaN(pageRequested) || parseInt(pageRequested) <= 0) {
        return 'Page Requested is invalid';
    }

    if (parseInt(sortValue) !== 1 && parseInt(sortValue) !== -1) {
        return 'Sort Value is invalid';
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

const model = mongoose.model('Order', schema);

module.exports = model;