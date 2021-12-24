const { Router } = require('express');
const express = require('express');
const route = express.Router();

const siteController = require('../controllers/SiteController');

route.get('/log-out',siteController.logout);
route.get('/cart',siteController.cart);
route.get('/sign-up',siteController.signup);
route.get('/sign-in',siteController.singin);
route.post('/addCustomer',siteController.addCustomer);
route.post('/verifyCustomer',siteController.verifyCustomer);
route.post('/verifyStaff',siteController.verifyStaff);
route.get('/search',siteController.search);
route.get('/addToCart',siteController.addToCart);
route.get('/removeFromCart',siteController.removeFromCart);
route.post('/addToOrder', siteController.addToOrder);
// route.get('/profile',siteController.profile);
route.get('/',siteController.home);

module.exports = route;
