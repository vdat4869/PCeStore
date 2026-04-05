import React from 'react';
import { Link } from 'react-router-dom';

export default function CreateProduct() {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <div className="">
              <h1 className="fs-3 mb-1">Thêm sản phẩm</h1>
              <p className="mb-0">Quản lý các mặt hàng trong kho</p>
            </div>
            <div>
              <Link to="/admin/products" className="btn btn-primary">Đến danh sách sản phẩm</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body p-4">
              <form id="addProductForm">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="productName" className="form-label">Tên sản phẩm</label>
                    <input type="text" className="form-control" id="productName" placeholder="Nhập tên sản phẩm" required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="productSKU" className="form-label">Mã SKU</label>
                    <input type="text" className="form-control" id="productSKU" placeholder="Nhập mã SKU" required />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="productPrice" className="form-label">Giá</label>
                    <input type="number" className="form-control" id="productPrice" placeholder="0.00" step="0.01" required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="productStock" className="form-label">Số lượng tồn kho</label>
                    <input type="number" className="form-control" id="productStock" placeholder="0" required />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="productCategory" className="form-label">Danh mục</label>
                  <select className="form-select" id="productCategory" required>
                    <option value="">Chọn danh mục</option>
                    <option value="electronics">Điện tử</option>
                    <option value="clothing">Quần áo</option>
                    <option value="food">Thực phẩm</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="productImage" className="form-label">Hình ảnh sản phẩm</label>
                  <input type="file" className="form-control" id="productImage" accept="image/*" required />
                </div>
                <div className="mb-3">
                  <label htmlFor="productDescription" className="form-label">Mô tả</label>
                  <textarea className="form-control" id="productDescription" rows="4"
                    placeholder="Nhập mô tả sản phẩm"></textarea>
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">Thêm sản phẩm</button>
                  <button type="reset" className="btn btn-secondary">Xóa trắng</button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
