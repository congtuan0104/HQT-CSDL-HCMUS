
const siteRoute = require('./site');
const storesRouter = require('./stores');
const ordersRoute = require('./orders');
const saleRoute = require('./sale');

function route(app) {
    app.use('/sales-channel', saleRoute);
    app.use('/my-orders', ordersRoute);
    app.use('/store', storesRouter);
    app.use('/', siteRoute);
}
module.exports = route;
