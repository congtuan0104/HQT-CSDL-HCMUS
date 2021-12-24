const db = require('../models/dbOperations');

class StoresController {
    //[GET]/stores
    async home(req, res, next) {
        const storeList = await db.getStoreList();

        if (req.session.user) {

            res.render('home', {
                title: 'Trang chủ',
                user: req.session.user,
                numberOfProduct: req.session.cart.length,
                stores: storeList,
                cssP: () => 'css',
                scriptP: () => 'script',
                navP: () => 'navCustomer',
                footerP: () => 'footer',
            });
            return;
        }
        res.render('home', {
            title: 'Trang chủ',
            stores: storeList,
            cssP: () => 'css',
            scriptP: () => 'script',
            navP: () => 'nav',
            footerP: () => 'footer',
        })
    }

    //[GET]/stores/:storeID
    async detail(req, res, next) {
        const storeDetail = await db.getStoreDetail(req.params.storeID);
        const productsList = await db.getProductOfStore(req.params.storeID);
        const productID = req.query.productID;
        if (productID) {
            const productDetail = await db.getProductDetail(req.params.storeID, productID);
            const branchesList = await db.getBranchHaveProduct(req.params.storeID, productID);
            //console.log('list',branchesList);
            if (req.session.user) {
                res.render('product-detail', {
                    title: productDetail.at(0).TenSP,
                    user: req.session.user,
                    numberOfProduct: req.session.cart.length,
                    storeDetail: storeDetail,
                    product: productDetail,
                    branch: branchesList,
                    cssP: () => 'product-style',
                    scriptP: () => 'script',
                    navP: () => 'navCustomer',
                    footerP: () => 'footer',
                })

                return;
            }
            res.render('product-detail', {
                title: productDetail.at(0).TenSP,
                storeDetail: storeDetail,
                product: productDetail,
                branch: branchesList,
                cssP: () => 'product-style',
                scriptP: () => 'script',
                navP: () => 'nav',
                footerP: () => 'footer',
            })
            return;

        }
        if (req.session.user) {
            res.render('store-detail', {
                title: storeDetail.at(0).TenDL,
                user: req.session.user,
                numberOfProduct: req.session.cart.length,
                storeDetail: storeDetail,
                products: productsList,
                cssP: () => 'invoice-template',
                scriptP: () => 'script',
                navP: () => 'navCustomer',
                footerP: () => 'footer',
            })

            return;
        }

        res.render('store-detail', {
            title: storeDetail.at(0).TenDL,
            storeDetail: storeDetail,
            products: productsList,
            cssP: () => 'invoice-template',
            scriptP: () => 'script',
            navP: () => 'nav',
            footerP: () => 'footer',
        })


    }
}

module.exports = new StoresController;
