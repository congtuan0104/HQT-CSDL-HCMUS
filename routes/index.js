
const siteRoute = require('./site');
const storesRouter = require('./stores');
// const ordersRoute = require('./orders');

function route(app) {
    // app.use('/my-orders', ordersRoute);
    app.use('/store', storesRouter);
    app.use('/', siteRoute);
}
module.exports = route;
