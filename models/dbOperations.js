var config = require('./dbConfig');
const sql = require('mssql/msnodesqlv8');

async function get10Products() {
    try {
        let pool = await sql.connect(config);
        let products = await pool.request().query("SELECT * from SANPHAM");
        return products.recordset;
    }
    catch (error) {
        console.log(error);
    }
}

async function getProduct(productID) {
    try {
        let pool = await sql.connect(config);
        let product = await pool.request()
            .input('input_parameter', sql.Int, productID)
            .query("SELECT * from SANPHAM where MASP = @input_parameter");
        return product.recordset;
    }
    catch (error) {
        console.log(error);
    }
}

async function getDiscount(productID) {
    try {
        let pool = await sql.connect(config);
        let discount = await pool.request()
            .input('input_parameter', sql.Int, productID)
            .query("SELECT convert(varchar(10), d.NgayBatDau, 105) AS NgayBatDau,"
                + " convert(varchar(10), d.NgayKetThuc, 105) AS NgayKetThuc, Giam"
                + " from DOTGIAMGIA d, CT_DOTGIAMGIA ct"
                + " where MASP = @input_parameter AND d.NgayBatDau = ct.NgayBatDau AND d.NgayKetThuc=ct.NgayKetThuc"
                + " AND datediff(minute,getdate() - 1, d.NgayKetThuc) >= 0"
                + " AND datediff(minute,getdate() - 1, d.NgayBatDau) <= 0");
        if (discount.recordset.length == 0) return null;
        return discount.recordset;
    }
    catch (error) {
        console.log(error);
    }
}

async function getProductDetail(productID) {
    try {
        let pool = await sql.connect(config);
        let product = await pool.request()
            .input('input_parameter', sql.Int, productID)
            .query("SELECT SP.MaSP,TenSP,TenLoai,HanSuDung,GiaBan,TenThuongHieu,TongSoLuongTon"
                + " FROM SANPHAM SP,LOAISANPHAM LSP, THUONGHIEU TH"
                + " WHERE SP.MASP = @input_parameter AND SP.MaLoai = LSP.MaLoai AND TH.MaThuongHieu=SP.MaThuongHieu");
        return product.recordset;
    }
    catch (error) {
        console.log(error);
    }
}

// const table = new sql.Table('KHACHHANG'); // or temporary table, e.g. #temptable
// table.create = false;
// table.rows.add('KH1000',name, address,phone,email);

// const request = new sql.Request()
// request.bulk(table, (err, result) => {
//     err => console.log(err);
//     result => console.log("Thêm khách hàng thành công");
// })

async function addNewUser(name, address, phone) {
    try {
        let pool = await sql.connect(config);
        const request = await pool.request();
        request.input('TenKH', sql.NVarChar(50), name);
        request.input('DiaCHi', sql.NVarChar(200), address);
        request.input('SDT', sql.Char(10), phone);
        try {
            await request.query("insert into KHACHHANG (TenKH,DiaChi,SDT) values (@TenKH,@DiaChi,@SDT)");
            console.log('Đăng ký thành công');
            return 1;
        } catch (error) {
            console.log(error);
            return 0;
        }
    } catch (error) {
        console.log(error);
        return 0;
    }
}

async function verifyCustomer(phone) {
    try {
        let pool = await sql.connect(config);
        let customer = await pool.request()
            .input('input_parameter', sql.Char(10), phone)
            .query("SELECT * FROM KHACHHANG WHERE SDT = @input_parameter");
        if (customer.recordset.length == 0) return null;
        return customer.recordset;
    }
    catch (error) {
        console.log(error);
    }
}

async function verifyStaff(phone) {
    try {
        let pool = await sql.connect(config);
        let staff = await pool.request()
            .input('input_parameter', sql.Char(10), phone)
            .query("SELECT * FROM NHANVIEN WHERE SDT = @input_parameter");
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
            .input('input_parameter', sql.VarChar, '%' + searchName + '%')
            .query("SELECT * FROM SANPHAM WHERE TenSP LIKE @input_parameter");
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


async function addOrderDetail(orderID, productID, cost, discount, quantity, total) {
    try {
        let pool = await sql.connect(config);
        let orderDetail = await pool.request()
            .input('MaHD', sql.Int, orderID)
            .input('MaSP', sql.Int, productID)
            .input('GiaBan', sql.Money, cost)
            .input('GiaGiam', sql.Money, discount)
            .input('SoLuong', sql.Int, quantity)
            .input('ThanhTien', sql.Money, total)
            .query("Insert into CT_HOADON (MaHD,MaSP,GiaBan,GiaGiam,SoLuong,ThanhTien)"
                + " values (@MaHD, @MaSP, @GiaBan, @GiaGiam, @SoLuong, @ThanhTien)");
        return 1;
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
                + " MaHD, DiaChiNhanHang, TongTien, MaKH, MaNV, TinhTrang"
                + " from hoadon where makh=@MaKH");
            if(orders.recordset.length == 0) return null;
        return orders.recordset;
    }
    catch (error) {
        console.log(error);
    }
}

async function addShoppingHistory(customerID, productID) {
    try {
        let pool = await sql.connect(config);
        let orderDetail = await pool.request()
            .input('MaKH', sql.Int, customerID)
            .input('MaSP', sql.Int, productID)
            .query("insert into LS_MUAHANG(MaKH,MaSP) values(@MaKH,@MaSP)");
        return 1;
    }
    catch (error) {
        console.log(error);
        return 0;
    }
}

async function showHistory(customerID) {
    try {
        let pool = await sql.connect(config);
        let history = await pool.request()
            .input('input_parameter', sql.Int, customerID)
            .query("SELECT S.MaSP, TenSP, GiaBan from LS_MUAHANG LS, SANPHAM S where MAKH = @input_parameter AND LS.MaSP=S.MaSP");
        return history.recordset;
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
            .query("SELECT h.MaHD, ct.MaSP, TenSP, ct.GiaBan, GiaGiam, SoLuong, ThanhTien"
                + " FROM HOADON h, CT_HOADON ct, SANPHAM s"
                + " WHERE h.MAHD = ct.MAHD AND h.MaHD=@input_parameter AND ct.MaSP=s.MaSP");
            if(detail.recordset.length==0) return null;
        return detail.recordset;
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
            .query("SELECT h.MaHD, convert(varchar(10), NgayLap, 105) AS NgayLap, DiaChiNhanHang, TongTien, TenNV, TinhTrang"
                + " FROM HOADON h LEFT JOIN NHANVIEN n ON h.MaNV=n.MaNV"
                + " WHERE h.MaHD=@input_parameter");
            if(detail.recordset.length==0) return null;
        return detail.recordset;
    }
    catch (error) {
        console.log(error);
    }
}

module.exports = {
    getProduct: getProduct,
    get10Products: get10Products,
    getProductDetail: getProductDetail,
    addNewUser: addNewUser,
    verifyCustomer: verifyCustomer,
    verifyStaff: verifyStaff,
    search: search,
    getDiscount: getDiscount,
    addToOrder: addToOrder,
    addOrderDetail: addOrderDetail,
    addShoppingHistory: addShoppingHistory,
    showHistory: showHistory,
    showAllOrder: showAllOrder,
    getOrderDetail: getOrderDetail,
    getOrderList: getOrderList,
}