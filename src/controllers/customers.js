const Customer = require('../models/customers');
const {
    DEFAULT_SEARCH_FIELD,
    DEFAULT_PAGE_REQUESTED,
    DEFAULT_PAGE_SIZE,
    SORT_VALUE,
    SORT_TYPE_ORDER
} = require('../utils/constants')

async function getAllCustomers(req, res) {
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
        documentCount = await Customer.countDocuments();
    } else {  
        documentCount = await Customer.countDocuments({
            [searchField]: new RegExp(searchValue, 'i')
        });
    }
    
    // get eligible documents with pagination
    const documents = await Customer.searchByFilters(searchField, searchValue, pageRequested, pageSize, sortType, sortValue);
    if (!documents || documents.length === 0) {
        return res.status(404).json('Customers are not found');
    }

    if (typeof(documents) === 'string') {
        return res.status(500).json(documents);
    }
    return res.json({ documentCount, documents });
}

async function getCustomerById(req, res) {
    const { id } = req.params;
    const customer = await Customer.findById(id);
    if (!customer) {
        return res.status(404).json('Customer is not found');
    }
    return res.json(customer);
}

async function addCustomer(req, res) {
    const { name, email, phone } = req.body;
    const existingEmail = await Customer.findOne({ email });
    if (existingEmail) {
        return res.status(400).json('Email has already existed');
    }

    const customer = new Customer({
        name,
        email,
        phone
    })
    if (!customer) {
        return res.status(500).json('Adding customer failed');
    }

    await customer.save();
    return res.json(customer);
}

async function updateCustomer(req, res) {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    const updatedCustomer = await Customer.findByIdAndUpdate(id,
        { name, email, phone },
        { runValidators: true, new: true });
    if (!updatedCustomer) {
        return res.status(404).json('Updating customer failed');
    }

    return res.json(updatedCustomer);
}

async function deleteCustomerById(req, res) {
    const { id } = req.params;
    const deletedCustomer = await Customer.findByIdAndDelete(id);
    if (!deletedCustomer) {
        return res.status(404).json('deleting customer failed');
    }

    return res.json(deletedCustomer); 
}

module.exports = {
    getAllCustomers,
    getCustomerById,
    addCustomer,
    updateCustomer,
    deleteCustomerById
};