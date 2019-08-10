const express = require('express');
const {
    getAllOrders,
    getOrderById,
    addOrder,
    updateOrder,
    deleteOrderById
} = require('../controllers/orders');

const router = express.Router();
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.post('/', addOrder);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrderById);

module.exports = router;