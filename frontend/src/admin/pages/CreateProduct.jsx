import React from 'react';
import { Link } from 'react-router-dom';

export default function CreateProduct() {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
            <div className="">
              <h1 className="fs-3 mb-1">Add Inventory</h1>
              <p className="mb-0">Manage your inventory items</p>
            </div>
            <div>
              <Link to="/admin/inventory" className="btn btn-primary">Go to Inventory List</Link>
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
                    <label htmlFor="productName" className="form-label">Product Name</label>
                    <input type="text" className="form-control" id="productName" placeholder="Enter product name" required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="productSKU" className="form-label">SKU</label>
                    <input type="text" className="form-control" id="productSKU" placeholder="Enter SKU" required />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="productPrice" className="form-label">Price</label>
                    <input type="number" className="form-control" id="productPrice" placeholder="0.00" step="0.01" required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="productStock" className="form-label">Stock Quantity</label>
                    <input type="number" className="form-control" id="productStock" placeholder="0" required />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="productCategory" className="form-label">Category</label>
                  <select className="form-select" id="productCategory" required>
                    <option value="">Select category</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="food">Food</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="productImage" className="form-label">Product Image</label>
                  <input type="file" className="form-control" id="productImage" accept="image/*" required />
                </div>
                <div className="mb-3">
                  <label htmlFor="productDescription" className="form-label">Description</label>
                  <textarea className="form-control" id="productDescription" rows="4"
                    placeholder="Enter product description"></textarea>
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">Add Product</button>
                  <button type="reset" className="btn btn-secondary">Clear</button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
