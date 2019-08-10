const express = require('express');
const routeCustomers = require('./routes/customers');
const routeBusinesses = require('./routes/businesses')
const routeOrders = require('./routes/orders');
const routeCategories = require('./routes/categories');
const routeUsers = require('./routes/users');
const routeAuth = require('./routes/auth');

const router = express.Router();
router.use('/customers', routeCustomers);
router.use('/businesses', routeBusinesses);
router.use('/orders', routeOrders);
router.use('/categories', routeCategories);
router.use('/users', routeUsers);
router.use('/auth', routeAuth);

module.exports = router;