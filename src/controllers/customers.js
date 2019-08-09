const Customer = require('../models/customers');
const Order = require('../models/orders');

async function getAllCustomers(req, res) {
    // const numCustomers = await Customer.estimatedDocumentCount();
    // const {condition = null, skipNum = 0, pageSize = null, sortMethod = null, selectMethod = null} = req.body;
    // const customers = await Customer.find(condition).skip(skipNum).limit(pageSize).sort(sortMethod). select(selectMethod).exec();
    // // const customers = await Customer.find().exec();
    // if (!customers) {
    //     return res.status(404).json('customers are not found');
    // }
    // //console.log(numCustomers);
    // return res.json({numCustomers, customers});
    
    const {conditionKey = 'email', conditionValue, pageRequested = 1, pageSize = 5, sortKey = 'email', sortValue = 1} = req.query;
    
    console.log(conditionKey);
    console.log(conditionValue);

    const documentCountBeforePagination = await Customer.countDocuments({[conditionKey]: new RegExp(conditionValue, 'i')});
    
    const documentsAfterPagination = await Customer.searchByFilters(conditionKey, conditionValue, pageRequested, pageSize, sortKey, sortValue);
    if (!documentsAfterPagination || documentsAfterPagination.length === 0) {
        return res.status(404).json('Customers are not found');
    }
    if (typeof(documentsAfterPagination) === 'string') {
        return res.status(500).json(documentsAfterPagination);
    }
    return res.json({documentCountBeforePagination, documentsAfterPagination});
}

async function getCustomerById(req, res) {
    const {id} = req.params;
    const customer = await Customer.findById(id);
    if (!customer) {
        return res.status(404).json('customer is not found');
    }
    return res.json(customer);
}

async function addCustomer(req, res) {
    const {customerName, preferName, email, phone} = req.body;
    const existingEmail = await Customer.findOne({email});
    if (existingEmail) {
        return res.status(400).json('email has already existed');
    }
    const customer = new Customer({
        customerName,
        preferName,
        email,
        phone
    })
    if (!customer) {
        return res.status(500).json('adding customer failed');
    }
    await customer.save();
    return res.json(customer);
}

async function updateCustomer(req, res) {
    const {id} = req.params;
    const {customerName, preferName, email, phone} = req.body;
    const updatedCustomer = await Customer.findByIdAndUpdate(id,
        {customerName, preferName, email, phone},
        {runValidators: true, new: true});
    if (!updatedCustomer) {
        return res.status(404).json('updating customer failed');
    }
    return res.json(updatedCustomer);
}

async function deleteCustomerById(req, res) {
    const {id} = req.params;
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