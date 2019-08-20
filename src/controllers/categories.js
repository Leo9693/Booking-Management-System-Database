const Category = require('../models/categories');
const Business = require('../models/businesses');
const {
    DEFAULT_SEARCH_FIELD,
    DEFAULT_PAGE_REQUESTED,
    DEFAULT_PAGE_SIZE,
    SORT_VALUE,
    SORT_TYPE_ORDER
} = require('../utils/constants')

async function getAllCategories(req, res) {
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
        documentCount = await Category.countDocuments();
    } else {
        documentCount = await Category.countDocuments({
            [searchField]: new RegExp(searchValue, 'i')
        });
    }

    // get eligible documents with pagination
    const documents = await Category.searchByFilters(searchField, searchValue, pageRequested, pageSize, sortType, sortValue);
    if (!documents || documents.length === 0) {
        return res.status(404).json('Categories are not found');
    }

    if (typeof (documents) === 'string') {
        return res.status(500).json(documents);
    }

    return res.json({ documentCount, documents });
}

async function getCategoryById(req, res) {
    const { id } = req.params;
    const category = await Category.findById(id)
        .populate('businesses', 'name email')
        .populate('orders', 'status customerEmail');
    if (!category) {
        return res.status(404).json('Category is not found');
    }

    return res.json(category);
}

async function addCategory(req, res) {
    const { name, description } = req.body;
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
        return res.status(400).json('Category name has already existed');
    }

    const category = new Category({
        name,
        description
    });
    if (!category) {
        return res.status(500).json('adding category failed');
    }

    await category.save();
    return res.json(category);
}

async function updateCategory(req, res) {
    const { id } = req.params;
    const { name, description } = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(id, { name, description }, { runValidators: true, new: true });
    if (!updatedCategory) {
        return res.status(404).json('updating category failed');
    }
    return res.json(updatedCategory);
}

async function deleteCategoryById(req, res) {
    const { id } = req.params;
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
        return res.status(404).json('Deleting category failed');
    }

    await Business.updateMany(
        { _id: { $in: deletedCategory.businesses } },
        { $pull: { categories: deletedCategory._id } }
    );
    return res.json(deletedCategory);
}

async function addBusinesstoCategory(req, res) {
    const { categoryId, businessId } = req.params;
    const existingCategory = await Category.findById(categoryId);
    const existingBusiness = await Business.findById(businessId);
    if (!existingCategory || !existingBusiness) {
        return res.status(404).json('Category or business is not found');
    }

    existingCategory.businesses.addToSet(existingBusiness._id);
    await existingCategory.save();
    existingBusiness.categories.addToSet(existingCategory._id);
    await existingBusiness.save();
    return res.json(existingCategory);
}

async function deleteBusinessFromCategory(req, res) {
    const { categoryId, businessId } = req.params;
    const existingCategory = await Category.findById(categoryId);
    const existingBusiness = await Business.findById(businessId);
    if (!existingCategory || !existingBusiness) {
        return res.status(404).json('Category or business is not found');
    }
    existingCategory.businesses.pull(existingBusiness._id);
    await existingCategory.save();
    existingBusiness.categories.pull(existingCategory._id);
    await existingBusiness.save();
    return res.json(existingCategory);
}

module.exports = {
    getAllCategories,
    getCategoryById,
    addCategory,
    updateCategory,
    deleteCategoryById,
    addBusinesstoCategory,
    deleteBusinessFromCategory
};