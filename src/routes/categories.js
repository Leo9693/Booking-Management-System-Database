const express = require('express');
const {
    getAllCategories,
    getCategoryById,
    addCategory,
    updateCategory,
    deleteCategoryById,
    addBusinesstoCategory,
    deleteBusinessFromCategory
} = require('../controllers/categories');

const router = express.Router();
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', addCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategoryById);
router.post('/:categoryId/businesses/:businessId', addBusinesstoCategory);
router.delete('/:categoryId/businesses/:businessId', deleteBusinessFromCategory);

module.exports = router;