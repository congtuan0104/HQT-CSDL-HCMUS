
const siteRoute = require('./site');
const productsRouter = require('./products');
const ordersRoute = require('./orders');

function route(app) {
    app.use('/my-orders', ordersRoute);
    app.use('/products', productsRouter);
    app.use('/', siteRoute);
}
module.exports = route;
