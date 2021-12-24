
const db = require('../models/dbOperations');

class SiteController {
    //[GET]/
    async home(req, res, next) {

        const productsList = await db.getProductsList();
        const storeList = await db.getStoreList();

        if (req.session.user) {

            res.render('home', {
                title: 'Trang chủ',
                user: req.session.user,
                numberOfProduct: req.session.cart.length,
                products: productsList,
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
            products: productsList,
            stores: storeList,
            cssP: () => 'css',
            scriptP: () => 'script',
            navP: () => 'nav',
            footerP: () => 'footer',
        })
    }

    //[GET]/cart
    cart(req, res, next) {
        if (req.session.user) {
            res.render('cart', {
                title: 'Giỏ hàng',
                user: req.session.user,
                numberOfProduct: req.session.cart.length,
                products: req.session.cart,
                grandTotal: req.session.grandTotal,
                cssP: () => 'cartStyle',
                scriptP: () => 'script',
                navP: () => 'navCustomer',
                footerP: () => 'footer',
            });
            return;
        }
        res.render('cart', {
            title: 'Giỏ hàng',
            cssP: () => 'css',
            scriptP: () => 'script',
            navP: () => 'nav',
            footerP: () => 'footer',
        })
    }

    //[GET]/sign-up
    signup(req, res, next) {
        res.render('sign-up', {
            title: 'Đăng ký',
            cssP: () => 'accountStyle',
            scriptP: () => 'script',
            navP: () => 'nav',
            footerP: () => 'footer',
        })
    }

    //[GET]/sign-in
    singin(req, res, next) {
        res.render('sign-in', {
            title: 'Đăng nhập',
            cssP: () => 'signinStyle',
            scriptP: () => 'script',
            navP: () => 'nav',
            footerP: () => 'footer',
        })
    }

    //[GET]/log-out
    logout(req, res, next) {
        if (req.session.user) req.session.destroy();
        res.redirect('/')
    }

    //[POST]/addCustomer
    async addCustomer(req, res, next) {
        const name = req.body.name;
        const address = req.body.address;
        const phone = req.body.phone;
        const email = req.body.email;
        const username = req.body.username;
        const password = req.body.password;
        const success = await db.addNewUser(name, address, phone,email,username,password);
        if (success != 1) {
            res.send('Đăng ký không thành công');
            return;
        }
        else {
            const user = await db.verifyCustomer(username,password);
            req.session.user = user;
            req.session.cart = [];
            req.session.grandTotal = 0;
            res.redirect('/');
            //res.send('Đăng ký thành công');
            return;
        }
    }


    //[POST]/verifyCustomer
    async verifyCustomer(req, res, next) {
        const username = req.body.username;
        const password = req.body.password;
        const user = await db.verifyCustomer(username,password);
        if (user) {
            console.log('Đăng nhập thành công');
            req.session.user = user;
            req.session.cart = [];
            req.session.grandTotal = 0;
            res.redirect('/');
            return;
        }
        res.send('Tên đăng nhập hoặc mật khẩu không đúng');
        return;
    }

    //POST/verifyStaff
    async verifyStaff(req, res, next) {
        const phone = req.body.phone;
        const user = await db.verifyStaff(phone);
        if (user) {
            console.log('Đăng nhập thành công');
            req.session.user = user;
            req.session.cart = [];
            req.session.grandTotal = 0;
            res.send(user.at(0).TenNV);
            return;
        }
        res.send('SĐT này chưa được đăng ký');
        return;
    }

    //[GET]/search?q=...
    async search(req, res, next) {
        const q = req.query.q;
        const products = await db.search(q);
        if (products) {
            if (req.session.user) {
                res.render('home', {
                    title: 'Tìm kiếm: ' + q,
                    products: products,
                    user: req.session.user,
                    numberOfProduct: req.session.cart.length,
                    cssP: () => 'css',
                    scriptP: () => 'script',
                    navP: () => 'navCustomer',
                    footerP: () => 'footer',
                })
                return;
            }
            res.render('home', {
                title: 'Tìm kiếm: ' + q,
                products: products,
                cssP: () => 'css',
                scriptP: () => 'script',
                navP: () => 'nav',
                footerP: () => 'footer',
            })
        }
        else {
            res.send('Không tìm thấy sản phẩm');
        }

    }

    //[GET]/addToCart?productID=...&quantity=...&branch=...
    async addToCart(req, res, next) {
        if (req.session.user) {
            const productID = req.query.productID;
            const storeID = req.query.storeID;
            const branch = req.query.branch;
            const quantity = req.query.q;
            const product = await db.getProductOfBranch(productID,storeID,branch);

            // for (var i = 0; i < req.session.cart.length; i++) {
            //     if (req.session.cart[i].productID == product.at(0).MaSP) {
            //         res.redirect('/');
            //         return;
            //     }
            // }


            const total = (product.at(0).GiaBan) * parseInt(quantity);
            

            req.session.cart.push({
                productName: product.at(0).TenSP,
                productID: product.at(0).MaSP,
                storeID: product.at(0).MaDL,
                storeName: product.at(0).TenDL,
                cost: product.at(0).GiaBan,
                branch: branch,
                quantity: quantity,
                total: total,
            });
        
            req.session.grandTotal = req.session.grandTotal + total;
          
            res.redirect('back');
            // console.log('---------------------------------');
            // console.log(req.session.cart);
            return;
        }
        res.redirect('/sign-in');
    }

    //[GET]/removerFromCart?productID = ...
    async removeFromCart(req, res, next) {
        if (req.session.user) {
            const productID = req.query.productID;
            for (var i = 0; i < req.session.cart.length; i++) {
                if (req.session.cart[i].productID == productID) {
                    req.session.grandTotal = req.session.grandTotal - req.session.cart[i].total;
                    req.session.cart.splice(i, 1);
                    res.redirect('/cart');
                    return;
                }
            }
            res.redirect('/');
            return;
        }
        res.redirect('/sign-in');
    }

    //[POST]/addToOrder
    async addToOrder(req, res, next) {
        if (req.session.user) {
            console.log(req.session.cart);
            const address = req.body.address;
            const shipFee = req.body.fee;
            const payments = req.body.payments;
            const grandTotal = req.session.grandTotal + shipFee;
            const customerID = req.session.user.at(0).MaKH;
            const storeID = req.session.cart[0].storeID;
            const branch = req.session.cart[0].branch;
            const orderID = await db.addToOrder(storeID,branch,customerID,payments,address,shipFee,grandTotal);

            req.session.cart.forEach(product => {
                db.addOrderDetail(orderID, product.productID, product.cost,  product.quantity, storeID,customerID,branch);
            });


            req.session.cart = [];
            req.session.grandTotal = 0;
            res.redirect('/');
            return;
        }
        res.redirect('/sign-in');
    }



    // profile(req,res,next){
    //     if (req.session.user) {
    //         res.render('profile', {
    //             title: 'Thông tin cá nhân',
    //             user: req.session.user,
    //             numberOfProduct: req.session.cart.length,
    //             cssP: () => 'invoice-template',
    //             scriptP: () => 'script',
    //             navP: () => 'navCustomer',
    //             footerP: () => 'footer',
    //         });
    //         return;
    //     }
    //     res.redirect('/sign-in');
    // }
}

module.exports = new SiteController;
