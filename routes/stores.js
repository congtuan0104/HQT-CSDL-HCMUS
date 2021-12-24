const { Router } = require('express');
const express = require('express');
const route = express.Router();

const storesController = require('../controllers/StoresController');

route.get('/:storeID',storesController.detail);
route.get('/',storesController.home);

module.exports = route;