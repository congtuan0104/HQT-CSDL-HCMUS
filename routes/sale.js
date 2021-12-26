const { Router } = require('express');
const express = require('express');
const route = express.Router();

const saleController = require('../controllers/SaleController');
route.get('/product',saleController.product);
route.get('/products',saleController.products);
route.get('/',saleController.home);

module.exports = route;