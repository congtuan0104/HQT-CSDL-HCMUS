const db = require('../models/dbOperations');

class SaleController {
    //[GET]/sales-channel/
    async home(req, res, next) {

        if (req.session.user) {
            res.render('sale-dashboard', {
                layout: 'sales-channel-layout',
                title: 'Kênh bán hàng',
                tag: 'Trang chính',
                user: req.session.user,
                cssP: () => 'css',
                scriptP: () => 'script',
            });
            return;
        }
        res.redirect('/sign-in');
    }

    //[GET]/sales-channel/products
    async products(req,res,next){       
        if (req.session.user) {
            const productsList = await db.getProductOfStore(req.session.user[0].MaDL);
            //console.log(productsList);
            res.render('sale-product-manage', {
                layout: 'sales-channel-layout',
                title: 'Quản lý sản phẩm',
                tag: 'Quản lý sản phẩm',
                user: req.session.user,
                products: productsList,
                cssP: () => 'css',
                scriptP: () => 'script',
            });
            return;
        }
        res.redirect('/sign-in');
    }

    async product(req,res,next){  
        const productID = req.query.productID;
        const storeID = req.session.user[0].MaDL;
        if (req.session.user) {
            const productDetail = await db.getProductDetail(storeID, productID);
            const branchesList = await db.getBranchHaveProduct(storeID, productID);
            
            res.render('product-edit', {
                layout: 'sales-channel-layout',
                title: 'Quản lý sản phẩm',
                tag: 'Quản lý sản phẩm',
                user: req.session.user,
                product: productDetail,
                branch: branchesList,
                cssP: () => 'css',
                scriptP: () => 'script',
            });
            return;
        }
        res.redirect('/sign-in');
    }
}

module.exports = new SaleController;