const Business = require('../models/businesses');
const Category = require('../models/categories');
const {
    DEFAULT_SEARCH_FIELD,
    DEFAULT_PAGE_REQUESTED,
    DEFAULT_PAGE_SIZE,
    SORT_VALUE,
    SORT_TYPE_ORDER
} = require('../utils/constants')

async function getAllBusinesses(req, res) {
    const {
        searchField = DEFAULT_SEARCH_FIELD,
        searchValue,
        pageRequested = DEFAULT_PAGE_REQUESTED,
        pageSize = DEFAULT_PAGE_SIZE,
        sortType = SORT_TYPE_ORDER,
        sortValue = SORT_VALUE
    } = req.query;

    // get the number of all eligible docments without pagination
    let documentCount;
    if (!searchField || searchField === DEFAULT_SEARCH_FIELD) {
        documentCount = await Business.countDocuments();
    } else {
        documentCount = await Business.countDocuments({
            [searchField]: new RegExp(searchValue, 'i')
        });
    }

    const documents = await Business.searchByFilters(searchField, searchValue, pageRequested, pageSize, sortType, sortValue);
    if (!documents || documents.length === 0) {
        return res.status(404).json('Businesses are not found');
    }

    if (typeof (documents) === 'string') {
        return res.status(500).json(documents);
    }

    return res.json({ documentCount, documents });
}

async function getBusinessById(req, res) {
    const { id } = req.params;
    const business = await Business.findById(id)
        .populate('categories', 'name')
        .populate('orders', 'status');
    if (!business) {
        return res.status(404).json('Business is not found');
    }

    return res.json(business);
}

async function addBusiness(req, res) {
    const { name, ABN, email, phone, streetAddress, postcode, rate } = req.body;
    const existingEmail = await Business.findOne({ email });
    if (existingEmail) {
        return res.status(400).json('Email has already existed');
    }
    const business = new Business({
        name,
        ABN,
        email,
        phone,
        streetAddress,
        postcode,
        rate
    })
    if (!business) {
        return res.status(500).json('Adding business failed');
    }

    await business.save();
    return res.json(business);
}

async function updateBusiness(req, res) {
    const { id } = req.params;
    const { name, ABN, email, phone, streetAddress, postcode, rate } = req.body;
    const updatedBusiness = await Business.findByIdAndUpdate(id,
        { name, ABN, email, phone, streetAddress, postcode, rate },
        { runValidators: true, new: true });
    if (!updatedBusiness) {
        return res.status(404).json('Updating business failed');
    }

    return res.json(updatedBusiness);
}

async function deleteBusinessById(req, res) {
    const { id } = req.params;
    const deletedBusiness = await Business.findByIdAndDelete(id);
    if (!deletedBusiness) {
        return res.status(404).json('Deleting business failed');
    }

    await Category.updateMany(
        { _id: { $in: deletedBusiness.categories } },
        { $pull: { businesses: deletedBusiness._id } }
    );
    return res.json(deletedBusiness);
}

async function addCategorytoBusiness(req, res) {
    const { businessId, categoryId } = req.params;
    const existingBusiness = await Business.findById(businessId);
    const existingCategory = await Category.findById(categoryId);
    if (!existingBusiness || !existingCategory) {
        return res.status(404).json('Business or category is not found');
    }

    existingBusiness.categories.addToSet(existingCategory._id);
    await existingBusiness.save();
    existingCategory.businesses.addToSet(existingBusiness._id);
    await existingCategory.save();
    return res.json(existingBusiness);
}

async function deleteCategoryFromBusiness(req, res) {
    const { businessId, categoryId } = req.params;
    const existingBusiness = await Business.findById(businessId);
    const existingCategory = await Category.findById(categoryId);
    if (!existingBusiness || !existingCategory) {
        return res.status(404).json('Business or category is not found');
    }

    existingBusiness.categories.pull(existingCategory._id);
    await existingBusiness.save();
    existingCategory.businesses.pull(existingBusiness._id);
    await existingCategory.save();
    return res.json(existingBusiness);
}

module.exports = {
    getAllBusinesses,
    getBusinessById,
    addBusiness,
    updateBusiness,
    deleteBusinessById,
    addCategorytoBusiness,
    deleteCategoryFromBusiness,
};