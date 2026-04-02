import React from 'react';
import { Link } from 'react-router-dom';

export default function Inventory() {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="">
              <h1 className="fs-3 mb-1">Inventory</h1>
              <p className="mb-0">Manage your product inventory</p>
            </div>
            <div>
              <Link to="/admin/create-product" className="btn btn-primary">Add Product</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <div>
            <div className="d-flex gap-2 mb-3 flex-wrap justify-content-between">
              <input type="text" className="form-control" placeholder="Search products..." style={{ maxWidth: '250px' }} />
              <div className="d-flex gap-2">
                <button className="btn btn-outline-secondary">
                  <i className="ti ti-filter"></i> Filter
                </button>
                <button className="btn btn-outline-secondary">
                  <i className="ti ti-file-excel"></i> Excel
                </button>
                <button className="btn btn-outline-secondary">
                  <i className="ti ti-file-pdf"></i> PDF
                </button>
              </div>
            </div>
          </div>
          <div className="card table-responsive ">
            <table className="table mb-0 text-nowrap table-hover">
              <thead className="table-light border-light">
                <tr>
                  <th>Image</th>
                  <th>Code</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Unit</th>
                  <th>Quantity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="align-middle ">
                  <td><a href="#!"><img src="/src/admin/assets/images/product-1.png" alt="" className="avatar avatar-md rounded" /><span className="ms-3">Gaming Joy Stick</span></a>
                  </td>
                  <td>PRD001</td>
                  <td>Electronics</td>
                  <td>Brand Name</td>
                  <td>$99.99</td>
                  <td>pcs</td>
                  <td>150</td>
                  <td className="">
                    <a href="#!" className=""><i className="ti ti-edit "></i></a>
                    <a href="#!" className="link-danger"><i className="ti ti-trash ms-2"></i></a>
                  </td>
                </tr>
                <tr className="align-middle">
                  <td><a href="#!"><img src="/src/admin/assets/images/product-2.png" alt="" className="avatar avatar-md rounded" /><span className="ms-3">Wireless Earphones</span></a>
                  </td>
                  <td>PRD002</td>
                  <td>Electronics</td>
                  <td>Tech Pro</td>
                  <td>$89.99</td>
                  <td>pcs</td>
                  <td>320</td>
                  <td className="">
                    <a href="#!" className=""><i className="ti ti-edit "></i></a>
                    <a href="#!" className="link-danger"><i className="ti ti-trash ms-2"></i></a>
                  </td>
                </tr>
                <tr className="align-middle">
                 <td><a href="#!"><img src="/src/admin/assets/images/product-3.png" alt="" className="avatar avatar-md rounded" /><span className="ms-3">Smart Watch Pro</span></a>
                  </td>
                  <td>PRD003</td>
                  <td>Electronics</td>
                  <td>Tech Pro</td>
                  <td>$98.00</td>
                  <td>pcs</td>
                  <td>200</td>
                  <td className="">
                    <a href="#!" className=""><i className="ti ti-edit "></i></a>
                    <a href="#!" className="link-danger"><i className="ti ti-trash ms-2"></i></a>
                  </td>
                </tr>
                <tr className="align-middle">
                  <td><a href="#!"><img src="/src/admin/assets/images/product-4.png" alt="" className="avatar avatar-md rounded" /><span className="ms-3">USB-C Fast Charger</span></a>
                  </td>
                  <td>PRD004</td>
                  <td>Electronics</td>
                  <td>Tech Pro</td>
                  <td>$86.00</td>
                  <td>pcs</td>
                  <td>80</td>
                  <td className="">
                    <a href="#!" className=""><i className="ti ti-edit "></i></a>
                    <a href="#!" className="link-danger"><i className="ti ti-trash ms-2"></i></a>
                  </td>
                </tr>
                <tr className="align-middle">
                  <td><a href="#!"><img src="/src/admin/assets/images/product-5.png" alt="" className="avatar avatar-md rounded" /><span className="ms-3">Portable Bluetooth Speaker</span></a>
                  </td>
                  <td>PRD005</td>
                  <td>Electronics</td>
                  <td>Tech Pro</td>
                  <td>$32.00</td>
                  <td>pcs</td>
                  <td>110</td>
                  <td className="">
                    <a href="#!" className=""><i className="ti ti-edit "></i></a>
                    <a href="#!" className="link-danger"><i className="ti ti-trash ms-2"></i></a>
                  </td>
                </tr>
                <tr className="align-middle">
                  <td><a href="#!"><img src="/src/admin/assets/images/product-6.png" alt="" className="avatar avatar-md rounded" /><span className="ms-3">Magic Keyboard</span></a>
                  </td>
                  <td>PRD006</td>
                  <td>Electronics</td>
                  <td>Tech Pro</td>
                  <td>$49.00</td>
                  <td>pcs</td>
                  <td>10</td>
                  <td className="">
                    <a href="#!" className=""><i className="ti ti-edit "></i></a>
                    <a href="#!" className="link-danger"><i className="ti ti-trash ms-2"></i></a>
                  </td>
                </tr>
              </tbody>
              <tfoot className="">
                <tr>
                  <td className="border-bottom-0">Showing product per page</td>
                  <td colSpan="7" className="border-bottom-0">
                    <nav aria-label="Page navigation" className="d-flex justify-content-end">
                      <ul className="pagination mb-0">
                        <li className="page-item disabled">
                          <a className="page-link" href="#!" tabIndex="-1">Previous</a>
                        </li>
                        <li className="page-item active"><a className="page-link" href="#!">1</a></li>
                        <li className="page-item"><a className="page-link" href="#!">2</a></li>
                        <li className="page-item"><a className="page-link" href="#!">3</a></li>
                        <li className="page-item">
                          <a className="page-link" href="#!">Next</a>
                        </li>
                      </ul>
                    </nav>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
