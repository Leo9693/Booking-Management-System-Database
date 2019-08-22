const Order = require('../models/orders');
const Customer = require('../models/customers');
const Business = require('../models/businesses');
const Category = require('../models/categories');
const {
    DEFAULT_SEARCH_FIELD,
    DEFAULT_PAGE_REQUESTED,
    DEFAULT_PAGE_SIZE,
    SORT_VALUE,
    SORT_TYPE_ORDER
} = require('../utils/constants')

async function getAllOrders(req, res) {
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
        documentCount = await Order.countDocuments();
    } else {
        documentCount = await Order.countDocuments({
            [searchField]: new RegExp(searchValue, 'i')
        });
    }

    // get eligible documents with pagination
    const documents = await Order.searchByFilters(searchField, searchValue, pageRequested, pageSize, sortType, sortValue);
    if (!documents || documents.length === 0) {
        return res.status(404).json('Orders are not found');
    }

    if (typeof (documents) === 'string') {
        return res.status(500).json(documents);
    }

    return res.json({ documentCount, documents });
}

// populate business data
async function getOrderById(req, res) {
    const { id } = req.params;
    const order = await Order.findById(id)
        .populate('customer', 'name email phone')
        .populate('business', 'name email phone postcode')
        .populate('category', 'name')
    if (!order) {
        return res.status(404).json('Order is not found');
    }

    return res.json(order);
}

async function addOrder(req, res) {
    const { customer, business, category, status,
        jobEstimatedTime, jobLocation, rate, comment } = req.body;
    const order = new Order({
        customer,
        business,
        category,
        status,
        jobEstimatedTime,
        jobLocation,
        rate,
        comment
    });
    if (!order) {
        return res.status(500).json('Adding order failed');
    }

    const existingCustomer = await Customer.findById(customer);
    if (!existingCustomer) {
        return res.status(404).json(`Customer is not found`);
    }

    const existingCategory = await Category.findById(category);
    if (!existingCategory) {
        return res.status(404).json(`Category is not found`);
    }

    if (business) {
        const existingBusiness = await Business.findById(business);
        if (!existingBusiness) {
            return res.status(404).json(`Business is not found`);
        }

        existingBusiness.orders.addToSet(order._id);
        await existingBusiness.save();
    }

    existingCustomer.orders.addToSet(order._id);
    await existingCustomer.save();
    existingCategory.orders.addToSet(order._id);
    await existingCategory.save();
    await order.save();
    return res.json(order);
}

async function updateOrder(req, res) {
    const { id } = req.params;
    const { customer, business, category, status,
        jobEstimatedTime, jobLocation, rate, comment } = req.body;
    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
        return res.status(404).json('Order is not found');
    }

    if (customer && customer !== existingOrder.customer) {
        return res.status(400).json(`Customer can not be changed`);
    }

    if (business && business !== existingOrder.business) {
        const existingBusiness = await Business.findById(business);
        if (!existingBusiness) {
            return res.status(404).json(`Business is not found`);
        }

        const previousBusiness = await Business.findById(existingOrder.business);
        if (previousBusiness) {
            previousBusiness.orders.pull(existingOrder._id);
            await previousBusiness.save();
        }

        existingBusiness.orders.addToSet(existingOrder._id);
        await existingBusiness.save();
    } else if (!business) {
        const previousBusiness = await Business.findById(existingOrder.business);
        if (previousBusiness) {
            previousBusiness.orders.pull(existingOrder._id);
            await previousBusiness.save();
        }
    }

    if (category && category !== existingOrder.category) {
        const existingCategory = await Category.findById(category);
        if (!existingCategory) {
            return res.status(404).json(`Category is not found`);
        }

        const previousCategory = await Category.findById(existingOrder.category);
        if (previousCategory) {
            previousCategory.orders.pull(existingOrder._id);
            await previousCategory.save();
        }

        existingCategory.orders.addToSet(existingOrder._id);
        await existingCategory.save();
    }

    const updatedOrder = await Order.findByIdAndUpdate(id,
        { business, category, status, jobEstimatedTime, jobLocation, rate, comment },
        { runValidators: true, new: true }
    );
    if (!updatedOrder) {
        return res.status(404).json('updating order failed');
    }

    return res.json(updatedOrder);
}

async function deleteOrderById(req, res) {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) {
        return res.status(404).json('deleting order failed');
    }

    const existingCustomer = await Customer.findById(deletedOrder.customer);
    existingCustomer.orders.pull(id);
    await existingCustomer.save();

    const existingBusiness = await Business.findById(deletedOrder.business);
    existingBusiness.orders.pull(id);
    await existingBusiness.save();

    const existingCategory = await Category.findById(deletedOrder.category);
    existingCategory.orders.pull(id);
    await existingCategory.save();

    return res.json(deletedOrder);
}

module.exports = {
    getAllOrders,
    getOrderById,
    addOrder,
    updateOrder,
    deleteOrderById
};