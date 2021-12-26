const db = require('../models/dbOperations');

class OrdersController {
    //[GET]/my-orders/
    async showAllOrder(req, res, next) {
        if (req.session.user) {
            const orders = await db.showAllOrder(req.session.user.at(0).MaKH);

            if (orders) {
                orders.forEach(order => {
                    if (order.TrangThaiDH == 0) {
                        order.TrangThaiDH = 'Đang chuẩn bị hàng';

                    }
                    else if (order.TrangThaiDH == 1) {
                        order.TrangThaiDH = 'Đang gửi hàng';
                    }
                    else if (order.TrangThaiDH == 2) {
                        order.TrangThaiDH = 'Đã nhận hàng/Đã thanh toán';
                    }
                });
                res.render('my-orders', {
                    title: 'Hoá đơn và đơn hàng',
                    user: req.session.user,
                    numberOfProduct: req.session.cart.length,
                    orders: orders,
                    cssP: () => 'invoice-template',
                    scriptP: () => 'script',
                    navP: () => 'navCustomer',
                    footerP: () => 'footer',
                });
                return;
            }
            res.send('Bạn chưa có hoá đơn nào');
            return;
        }
        res.redirect('/sign-in');
    }

    //[GET]/my-orders/:orderID=...
    async detail(req, res, next) {
        if (req.session.user) {
            const orderDetail = await db.getOrderDetail(req.params.orderID);
            const orderList = await db.getOrderList(req.params.orderID);
            const status = orderDetail.at(0).TrangThaiDH;
            if (orderDetail.at(0).TrangThaiDH == 0) {
                orderDetail.at(0).TrangThaiDH  = 'Đang chuẩn bị hàng';
            }
            else if (orderDetail.at(0).TrangThaiDH  == 1) {
                orderDetail.at(0).TrangThaiDH  = 'Đang gửi hàng';
            }
            else if (orderDetail.at(0).TrangThaiDH  == 2) {
                orderDetail.at(0).TrangThaiDH  = 'Đã nhận hàng/Đã thanh toán';
            }
            

            res.render('order-detail', {
                title: 'Chi tiết hoá đơn',
                orderDetail: orderDetail,
                orderList: orderList,
                user: req.session.user,
                status: status,
                numberOfProduct: req.session.cart.length,
                cssP: () => 'invoice-template',
                scriptP: () => 'script',
                navP: () => 'navCustomer',
                footerP: () => 'footer',
            })
            return;
        }
        res.redirect('/sign-in');
    }
}

module.exports = new OrdersController;