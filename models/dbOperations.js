var config = require('./dbConfig');
const sql = require('mssql/msnodesqlv8');
const isolation = require('mssql/lib/isolationlevel');
const res = require('express/lib/response');
const { request } = require('express');
const { READ_UNCOMMITTED } = require('mssql/lib/isolationlevel');


async function getProductsList() {
    try {
        let pool = await sql.connect(config);
        let products = await pool.request().query(
            "SELECT s.MaSP,TenSP, d.MaDL, TenDL, GiaBan, SUM(SLBan) as DaBan"
            + " from SANPHAM s,CHINHANH_SANPHAM cs, DAILY d"
            + " where s.MaSP=cs.MaSP and cs.MaDL = d.MaDL"
            + " GROUP by s.masp,tensp, d.MaDL,TenDL, GiaBan");
        return products.recordset;
    }
    catch (error) {
        console.log(error);
    }
}

async function getStoreList() {
    try {
        let pool = await sql.connect(config);
        let stores = await pool.request().query("SELECT * from DAILY");
        return stores.recordset;
    }
    catch (error) {
        console.log(error);
    }
}

async function getStoreDetail(storeID) {
    try {
        let pool = await sql.connect(config);
        let store = await pool.request()
            .input('storeID', sql.Int, storeID)
            .query("SET TRAN ISOLATION LEVEL READ UNCOMMITTED SELECT * from DAILY d with(nolock) where d.MaDL=@storeID");
        return store.recordset;
    }
    catch (error) {
        console.log(error);
    }
}

async function getProductOfStore(storeID) {
    try {
        let pool = await sql.connect(config);
        let products = await pool.request()
            .input('storeID', sql.Int, storeID)
            .query("SET TRAN ISOLATION LEVEL READ UNCOMMITTED SELECT s.MaSP,MaDL,GiaBan,TenSP,ThuongHieu, sum(slton) as TongSLTon, sum(slban) as DaBan"
                + " from CHINHANH_SANPHAM cs with(nolock), SANPHAM s"
                + " where cs.MaDL=@storeID AND s.MaSP=cs.MaSP"
                + " group by s.MaSP,MaDL,GiaBan,TenSP,ThuongHieu");
        return products.recordset;
    }
    catch (error) {
        console.log(error);
    }
}

async function getProductDetail(storeID, productID) {
    try {
        let pool = await sql.connect(config);
        let product = await pool.request()
            .input('storeID', sql.Int, storeID)
            .input('productID', sql.Int, productID)
            .query("SET TRAN ISOLATION LEVEL READ UNCOMMITTED SELECT s.MaSP,MaDL,GiaBan,TenSP,ThuongHieu, TenLoaiSP, sum(slton) as TongSLTon, sum(slban) as DaBan"
                + " from CHINHANH_SANPHAM cs WITH(NOLOCK), SANPHAM s, LOAISP LSP"
                + " where cs.MaDL=@storeID AND s.MaSP=cs.MaSP AND s.MaSP=@productID AND LSP.MaLoaiSP=s.MaLoaiSP"
                + " group by s.MaSP,MaDL,GiaBan,TenSP,ThuongHieu,TenLoaiSP");
        return product.recordset;
    }
    catch (error) {
        console.log(error);
    }
}

async function getBranchHaveProduct(storeID, productID) {
    try {
        let pool = await sql.connect(config);
        let res;
        let product = await pool.request()
            .input('masp', sql.Int, productID)
            .input('madl', sql.Int, storeID)
            //     .execute('sp_XEM_THONG_TIN_SAN_PHAM')
            //     .then((result) => {
            //         res = result.recordset;
            //     })
            //return res;
            .query("SET TRAN ISOLATION LEVEL READ UNCOMMITTED SELECT MaSP, c.MaDL, c.STT, DiaChi, SLTon, SLBan"
                + " from CHINHANH_SANPHAM cs with(nolock), CHINHANH c with(nolock)"
                + " where cs.MaDL=@madl AND cs.MaSP=@masp AND"
                + " c.MaDL=cs.MaDL AND c.STT=cs.STT");
        return product.recordset;
    } catch (error) {
        console.log(error);
        return null;
    }
}



async function getBranchHaveProduct2(storeID, productID) {
    let res;
    let finalRes;
    let pool = await sql.connect(config);
    let transaction = new sql.Transaction(pool);
    transaction.isolationLevel = sql.ISOLATION_LEVEL.READ_UNCOMMITTED;

    await transaction.begin(async err => {
        if (err) {
            throw err;
        }

        let rolledBack = false;
        transaction.on('rollback', aborted => {
            // emited with aborted === true
            if (aborted) rolledBack = true;
        })


        const request = new sql.Request(transaction)
        request.input('masp', sql.Int, productID)
        request.input('madl', sql.Int, storeID)

        const test = await request.query('select cs.MaSP,cs.MaDL,cs.STT, DiaChi, SLTon'
            + ' from CHINHANH c,CHINHANH_SANPHAM cs'
            + ' where c.MaDL=cs.MaDL AND c.STT=cs.STT and cs.MaDL=@madl and cs.MaSP=@masp')
            .then(result => {
                res = result.recordset;
                if (err) {
                    if (!rolledBack) {
                        transaction.rollback(err => {
                            console.log('Rollback transaction');
                            return null;
                        })
                    }
                } else {
                    transaction.commit(err => {
                        console.log('Transaction committed.');
                    })
                    return res;
                }

            })

        return test;

    });

    console.log('last', transaction.test);
    return transaction.test;
}

async function addNewUser(name, address, phone, email, username, password) {
    try {
        let pool = await sql.connect(config);

        const newUser = await pool.request();
        newUser.input('TenKH', sql.NVarChar(50), name);
        newUser.input('DiaCHi', sql.NVarChar(200), address);
        newUser.input('SDT', sql.Char(10), phone);
        newUser.input('Email', sql.VarChar(30), email);
        newUser.input('Login', sql.VarChar(20), username);
        newUser.input('Pass', sql.VarChar(20), password);

        newUser.execute('SP_TAO_TAI_KHOAN_KHACH_HANG_2', (err, result) => {
            if (result.returnValue == 0) return 0;
        })
        return 1;
    } catch (error) {
        console.log(error);
        return 0;
    }
}



async function verifyCustomer(username, password) {
    try {
        let pool = await sql.connect(config);
        let customer = await pool.request()
            .input('username', sql.VarChar(20), username)
            .input('password', sql.VarChar(20), password)
            .query("SELECT * FROM KHACHHANG WHERE TenDangNhap = @username AND MatKhau = @password");
        if (customer.recordset.length == 0) return null;
        return customer.recordset;
    }
    catch (error) {
        console.log(error);
    }
}

async function verifyStore(phone) {
    try {
        let pool = await sql.connect(config);
        let store = await pool.request()
            .input('sdt', sql.Char(10), phone)
            .query("SELECT * FROM DAILY WHERE SDT = @sdt");
            //console.table(store.recordset);
        if (store.recordset.length == 0) return null;
        return store.recordset;
    }
    catch (error) {
        console.log(error);
    }
}

async function verifyStaff(phone) {
    try {
        let pool = await sql.connect(config);
        let staff = await pool.request()
            .input('sdt', sql.Char(10), phone)
            .query("SELECT * FROM NHANVIEN WHERE SDT = @sdt");
        if (staff.recordset.length == 0) return null;
        return staff.recordset;
    }
    catch (error) {
        console.log(error);
    }
}

async function search(searchName) {
    try {
        let pool = await sql.connect(config);
        let product = await pool.request()
            .input('search', sql.VarChar, '%' + searchName + '%')
            .query("SELECT s.MaSP,TenSP, d.MaDL, TenDL, GiaBan, SUM(SLBan) as DaBan"
                + " from SANPHAM s,CHINHANH_SANPHAM cs, DAILY d"
                + " where s.MaSP=cs.MaSP and cs.MaDL = d.MaDL AND TenSP LIKE @search"
                + " GROUP by s.masp,tensp, d.MaDL,TenDL, GiaBan");
        if (product.recordset.length == 0) return null;
        return product.recordset;
    }
    catch (error) {
        console.log(error);
    }
}


async function addToOrder(customerID, address, grandTotal, staffID) {
    try {
        let pool = await sql.connect(config);
        let order = await pool.request()
            .input('DiaChi', sql.NVarChar(100), address)
            .input('MaKH', sql.Int, customerID)
            .input('MaNV', sql.Int, staffID)
            .input('TongTien', sql.Money, grandTotal)
            .query("Insert into HOADON (NgayLap,DiaChiNhanHang,MaKH,MaNV,TongTien)"
                + " values (getdate(),@DiaChi,@MaKH,@MaNV,@TongTien)");

        let orderID = await pool.request()
            .input('MaKH', sql.Int, customerID)
            .query("Select max(mahd)as newID from hoadon where makh=@MaKH");

        return orderID.recordset.at(0).newID;
    }
    catch (error) {
        console.log(error);
        return 0;
    }
}

async function getProductOfBranch(productID, storeID, branch) {
    try {
        let pool = await sql.connect(config);
        let product = await pool.request()
            .input('productID', sql.Int, productID)
            .input('storeID', sql.Int, storeID)
            .input('branch', sql.Int, branch)
            .query("SELECT s.MaSP,cs.MaDL,STT,GiaBan,TenSP, SLTon,TenDL"
                + " from CHINHANH_SANPHAM cs, SANPHAM s,DAILY d"
                + " where cs.MaDL=@storeID AND s.MaSP=cs.MaSP AND s.MaSP=@productID AND STT=@branch AND d.MaDL=cs.MaDL");
        if (product.recordset.length == 0) return null;
        return product.recordset;
    }
    catch (error) {
        console.log(error);
    }
}

async function addToOrder(storeID, branch, customerID, payments, address, fee, grandTotal) {
    try {
        let pool = await sql.connect(config);
        let order = await pool.request()
            .input('MaDL', sql.Int, storeID)
            .input('STT', sql.Int, branch)
            .input('MaKH', sql.Int, customerID)
            .input('HinhThuc', sql.Int, payments)
            .input('DiaChi', sql.NVarChar(100), address)
            .input('PhiVanChuyen', sql.Money, fee)
            .input('TongTien', sql.Money, grandTotal)
            .query("Insert into DONHANG (MaDL,STT,MaKH,HinhThucThanhToan,DCNhanHang,"
                + " PhiVanChuyen, NgayLap, TrangThaiDH,TongTien)"
                + " values (@MaDL,@STT,@MaKH,@HinhThuc,@DiaChi,@PhiVanChuyen,getdate(),0,@TongTien)");

        let orderID = await pool.request()
            .input('MaKH', sql.Int, customerID)
            .query("Select max(madh)as newID from donhang where makh=@MaKH");

        return orderID.recordset.at(0).newID;
    }
    catch (error) {
        console.log(error);
        return 0;
    }
}


async function addOrderDetail(orderID, productID, cost, quantity, storeID, customerID, branch) {
    try {
        let pool = await sql.connect(config);
        let orderDetail = await pool.request();
        orderDetail.input('madh', sql.Int, orderID);
        orderDetail.input('masp', sql.Int, productID);
        orderDetail.input('soluong', sql.Int, quantity);
        orderDetail.input('madl', sql.Int, storeID);
        orderDetail.input('chinhanh', sql.Int, branch);
        orderDetail.input('makh', sql.Int, customerID);
        orderDetail.input('gia', sql.Money, cost);
        if (quantity == 2) {
            orderDetail.execute('sp_THEM_SP_VAO_DON_HANG', (err, result) => {
                //console.log(err);
            })
            return orderDetail.returnValue;
        }
        orderDetail.execute('sp_THEM_SP_VAO_DON_HANG_2', (err, result) => {
            //console.log(err);
        })
        return orderDetail.returnValue;
    }
    catch (error) {
        console.log(error);
        return 0;
    }
}

async function showAllOrder(customerID) {
    try {
        let pool = await sql.connect(config);
        let orders = await pool.request()
            .input('MaKH', sql.Int, customerID)
            .query("Select convert(varchar(10), NgayLap, 105) AS NgayLap,"
                + " MaDH, MaDL, STT, DCNhanHang, TongTien, MaKH, TrangThaiDH, PhiVanChuyen"
                + " from DONHANG where makh=@MaKH");
            if(orders.recordset.length == 0) return null;
        return orders.recordset;
    }
    catch (error) {
        console.log(error);
    }
}

async function getOrderDetail(orderID){
    try {
        let pool = await sql.connect(config);
        let detail = await pool.request()
            .input('input_parameter', sql.Int, orderID)
            .query("SELECT h.MaDH, convert(varchar(10), NgayLap, 105) AS NgayLap, DCNhanHang, TongTien, TrangThaiDH, PhiVanChuyen"
                + " FROM DONHANG h "
                + " WHERE h.MaDH=@input_parameter");
            if(detail.recordset.length==0) return null;
        return detail.recordset;
    }
    catch (error) {
        console.log(error);
    }
}

async function getOrderList(orderID){
    try {
        let pool = await sql.connect(config);
        let detail = await pool.request()
            .input('input_parameter', sql.Int, orderID)
            .query("SELECT h.MaDH, ct.MaSP, TenSP, ct.GiaBan, SoLuong, ThanhTien"
                + " FROM DONHANG h, CHITIETDH ct, SANPHAM s"
                + " WHERE h.MADH = ct.MADH AND h.MaDH=@input_parameter AND ct.MaSP=s.MaSP");
            if(detail.recordset.length==0) return null;
        return detail.recordset;
    }
    catch (error) {
        console.log(error);
    }
}

module.exports = {
    getProductsList: getProductsList,
    getStoreList: getStoreList,
    getStoreDetail: getStoreDetail,
    getProductOfStore: getProductOfStore,
    getProductDetail: getProductDetail,
    getBranchHaveProduct: getBranchHaveProduct,
    addNewUser: addNewUser,
    verifyCustomer: verifyCustomer,
    verifyStore: verifyStore,
    verifyStaff: verifyStaff,
    search: search,
    addToOrder: addToOrder,
    getProductOfBranch: getProductOfBranch,
    addOrderDetail: addOrderDetail,
    getBranchHaveProduct2: getBranchHaveProduct2,
    showAllOrder: showAllOrder,
    getOrderDetail: getOrderDetail,
    getOrderList: getOrderList,
}
