import React from 'react';
import { Link } from 'react-router-dom';
import Chart from 'react-apexcharts';

export default function Dashboard() {
  const salesPurchaseOptions = {
    colors: ['#f7a085', '#E66239'],
    chart: {
      type: 'bar',
      toolbar: { show: false },
    },
    grid: { show: true, borderColor: "#e2e8f0" },
    legend: {
      show: true,
      fontFamily: 'Poppins, serif',
      fontWeight: 500,
      markers: { size: 5, shape: 'square', offsetX: -2, offsetY: 0, strokeWidth: 0 },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '85%',
        borderRadius: 3,
        borderRadiusApplication: 'end',
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories: ['28 Jan', '29 Jan', '30 Jan', '31 Jan', '1 Feb', '2 Feb', '3 Feb', '4 Feb', '5 Feb'],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { formatter: (e) => e + 'k' },
      title: { text: '$ (thousands)' },
    },
    fill: { opacity: 1 },
    tooltip: {
      y: { formatter: (val) => "$ " + val + " thousands" }
    },
  };

  const salesPurchaseSeries = [
    { name: 'Sales', data: [44, 55, 57, 56, 61, 58, 63, 60, 66] },
    { name: 'Purchase', data: [76, 85, 101, 98, 87, 105, 91, 114, 94] },
  ];

  const customerOptions = {
    chart: { type: 'radialBar' },
    colors: ['#5BE49B', '#E66239'],
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: { fontSize: '14px' },
          value: { fontSize: '16px' },
          total: { show: false },
        },
        hollow: { margin: 3, size: '40%', background: 'transparent' },
        track: { show: true, background: "#f0f0f0", strokeWidth: '45%' },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        gradientToColors: ['#007867', '#FFD666', '#FFAC82'],
        stops: [0, 100],
      },
    },
    stroke: { lineCap: 'round' },
    labels: ['First Time', 'Return'],
  };

  const customerSeries = [44, 55];

  return (
    <div className="container-fluid">
      <div className="row ">
        <div className="col-12">
          <div className="mb-6">
            <h1 className="fs-3 mb-1">Dashboard</h1>
            <p>Your main content goes here...</p>
          </div>
        </div>
      </div>
      <div className="row g-3 mb-3">
        <div className="col-lg-3 col-12">
          <div className="card p-4  bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-2">
            <div className="d-flex gap-3 ">
              <div className="icon-shape icon-md bg-primary text-white rounded-2">
                <i className="ti ti-report-analytics fs-4"></i>
              </div>
              <div>
                <h2 className="mb-3 fs-6">Total Sales</h2>
                <h3 className="fw-bold mb-0">$25,000</h3>
                <p className="text-primary mb-0 small">+5% since last month</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-12">
          <div className="card p-4  bg-success bg-opacity-10 border border-success border-opacity-25 rounded-2">
            <div className="d-flex gap-3 ">
              <div className="icon-shape icon-md bg-success text-white rounded-2">
                <i className="ti ti-repeat fs-4"></i>
              </div>
              <div>
                <h2 className="mb-3 fs-6">Total Purchase</h2>
                <h3 className="fw-bold mb-0">$18,000</h3>
                <p className="text-success mb-0 small">+22% since last month</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-12">
          <div className="card p-4  bg-info bg-opacity-10 border border-info border-opacity-25 rounded-2">
            <div className="d-flex gap-3 ">
              <div className="icon-shape icon-md bg-info text-white rounded-2">
                <i className="ti ti-currency-dollar fs-4"></i>
              </div>
              <div>
                <h2 className="mb-3 fs-6">Total Expenses</h2>
                <h3 className="fw-bold mb-0">$9,000</h3>
                <p className="text-info mb-0 small">+10% since last month</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-12">
          <div className="card p-4  bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded-2">
            <div className="d-flex gap-3 ">
              <div className="icon-shape icon-md bg-warning text-white rounded-2">
                <i className="ti ti-notes fs-4"></i>
              </div>
              <div>
                <h2 className="mb-3 fs-6">Invoice Due</h2>
                <h3 className="fw-bold mb-0">$25,000</h3>
                <p className="text-warning mb-0 small">+35% since last month</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-lg-4 col-12">
          <div className="card">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between border-bottom pb-5 mb-3">
                <div>
                  <h3 className="fw-bold h4">$25,458</h3>
                  <span>Total Profit</span>
                </div>
                <div>
                  <i className="ti ti-layers-subtract fs-1 text-primary"></i>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center small">
                <div className="text-muted"><span className="text-success">+35%</span> vs Last Month</div>
                <div><a href="#!" className="link-primary text-decoration-underline">View</a></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-12">
          <div className="card">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between border-bottom pb-5 mb-3">
                <div>
                  <h3 className="fw-bold h4">$45,458</h3>
                  <span>Total Payment Returns</span>
                </div>
                <div>
                  <i className="ti ti-credit-card fs-1 text-danger"></i>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center small">
                <div className="text-muted"><span className="text-danger">-20%</span> vs Last Month</div>
                 <div><a href="#!" className="link-primary text-decoration-underline">View</a></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-12">
          <div className="card">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between border-bottom pb-5 mb-3">
                <div>
                  <h3 className="fw-bold h4">$34,458</h3>
                  <span>Total Expenses</span>
                </div>
                <div>
                  <i className="ti ti-cash-banknote fs-1 text-warning"></i>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center small">
                <div className="text-muted"><span className="text-warning">-20%</span> vs Last Month</div>
                <div><a href="#!" className="link-primary text-decoration-underline">View</a></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center bg-transparent px-4 py-3">
              <h3 className="h5 mb-0">Sales vs Purchase</h3>
              <div>
                <select className="form-select form-select-sm" defaultValue="This Year">
                  <option value="This Year">This Year</option>
                  <option value="This Month">This Month</option>
                  <option value="This Week">This Week</option>
                </select>
              </div>
            </div>
            <div className="card-body p-4">
              <div id="salesPurchaseChart">
                <Chart options={salesPurchaseOptions} series={salesPurchaseSeries} type="bar" height={350} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center bg-transparent px-4 py-3">
              <h3 className="h5 mb-0">Overall Information</h3>
              <div>
                <select className="form-select form-select-sm" defaultValue="Last 6 Months">
                  <option value="Last 6 Months">Last 6 Months</option>
                  <option value="This Month">This Month</option>
                  <option value="This Week">This Week</option>
                </select>
              </div>
            </div>
            <div className="card-body p-4">
              <h3 className="h6">Customers Overview</h3>
              <div className="row align-items-center">
                <div className="col-sm-6">
                  <div id="customerChart">
                    <Chart options={customerOptions} series={customerSeries} type="radialBar" height={220} />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="row">
                    <div className="col-6 border-end">
                      <div className="text-center ">
                        <h2 className="mb-1">5.5K</h2>
                        <p className="text-success mb-2">First Time</p>
                        <span className="badge bg-success"><i className="ti ti-arrow-up-left me-1"></i>25%</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center">
                        <h2 className="mb-1">3.5K</h2>
                        <p className="text-warning mb-2">Return</p>
                        <span className="badge bg-success badge-xs d-inline-flex align-items-center"><i
                            className="ti ti-arrow-up-left me-1"></i>21%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row text-center border-top mt-4 pt-4">
                <div className="col-4 border-end">
                  <h3 className="fw-bold mb-2">6987</h3>
                  <small className="text-secondary">Suppliers</small>
                </div>
                <div className="col-4 border-end">
                  <h3 className="fw-bold mb-2">4896</h3>
                  <small className="text-secondary">Customers</small>
                </div>
                <div className="col-4">
                  <h3 className="fw-bold mb-2">487</h3>
                  <small className="text-secondary">Orders</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* CARD 1 — Top Selling Products */}
        <div className="col-lg-4">
          <div className="card  h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center px-4 py-3">
              <h4 className="mb-0 h5">Top Selling Products</h4>
              <button className="btn btn-sm btn-outline-secondary">
                <i className="ti ti-calendar"></i> Today
              </button>
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item d-flex align-items-center gap-3">
                <img src="/src/admin/assets/images/product-2.png" className="rounded" width="48" alt="" />
                <div className="flex-grow-1">
                  <p className="mb-1">Wireless Earphones</p>
                  <div className="d-flex align-items-center gap-2 text-muted">
                    <small className="fw-semibold">$89 </small>
                    <small>•</small>
                    <small>1,250 Units</small>
                  </div>
                </div>
                <span className="badge bg-danger-subtle text-danger border border-danger">18%</span>
              </li>
              <li className="list-group-item d-flex align-items-center gap-3">
                <img src="/src/admin/assets/images/product-1.png" className="rounded" width="48" alt="" />
                <div className="flex-grow-1">
                  <p className="mb-1">Gaming Joy Stick</p>
                  <div className="d-flex align-items-center gap-2 text-muted">
                    <small className="fw-semibold">$49 </small>
                    <small>•</small>
                    <small>5,420 Units</small>
                  </div>
                </div>
                <span className="badge bg-primary-subtle text-primary border border-primary">32%</span>
              </li>
              <li className="list-group-item d-flex align-items-center gap-3">
                <img src="/src/admin/assets/images/product-3.png" className="rounded" width="48" alt="" />
                <div className="flex-grow-1">
                  <p className="mb-1">Smart Watch Pro</p>
                  <div className="d-flex align-items-center gap-2 text-muted">
                    <small className="fw-semibold">$98 </small>
                    <small>•</small>
                    <small>862 Units</small>
                  </div>
                </div>
                <span className="badge bg-info-subtle text-info border border-info">22%</span>
              </li>
              <li className="list-group-item d-flex align-items-center gap-3">
                <img src="/src/admin/assets/images/product-4.png" className="rounded" width="48" alt="" />
                <div className="flex-grow-1">
                  <p className="mb-1">USB-C Fast Charger</p>
                  <div className="d-flex align-items-center gap-2 text-muted">
                    <small className="fw-semibold">$35 </small>
                    <small>•</small>
                    <small>3,200 Units</small>
                  </div>
                </div>
                <span className="badge bg-success-subtle text-success border border-success">28%</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CARD 2 — Low Stock Products */}
        <div className="col-lg-4">
          <div className="card  h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center px-4 py-3">
              <div className="d-flex align-items-center">
                <h4 className="mb-0 h5">Low Stock Products</h4>
              </div>
              <a href="#!" className="small text-primary text-decoration-underline">View All</a>
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item d-flex align-items-center gap-3">
                <img src="/src/admin/assets/images/product-8.png" className="rounded" width="48" alt="" />
                <div className="flex-grow-1">
                  <p className="mb-1">Wireless Headphones</p>
                  <small>ID: #554433</small>
                </div>
                <div className="d-flex flex-column gap-0 align-items-center">
                  <span className="fw-semibold text-primary">06</span>
                  <small className="text-muted">In Stock</small>
                </div>
              </li>
              <li className="list-group-item d-flex align-items-center gap-3">
                <img src="/src/admin/assets/images/product-4.png" className="rounded" width="48" alt="" />
                <div className="flex-grow-1">
                  <p className="mb-1">USB-C Cable Pack</p>
                  <small>ID: #887766</small>
                </div>
                <div className="d-flex flex-column gap-0 align-items-center">
                  <span className="fw-semibold text-primary">09</span>
                  <small className="text-muted">In Stock</small>
                </div>
              </li>
              <li className="list-group-item d-flex align-items-center gap-3">
                <img src="/src/admin/assets/images/product-10.png" className="rounded" width="48" alt="" />
                <div className="flex-grow-1">
                  <p className="mb-1">Phone Screen Protector</p>
                  <small>ID: #332211</small>
                </div>
                <div className="d-flex flex-column gap-0 align-items-center">
                  <span className="fw-semibold text-primary">03</span>
                  <small className="text-muted">In Stock</small>
                </div>
              </li>
              <li className="list-group-item d-flex align-items-center gap-3">
                <img src="/src/admin/assets/images/product-6.png" className="rounded" width="48" alt="" />
                <div className="flex-grow-1">
                  <p className="mb-1">Mechanical Keyboard RGB</p>
                  <small>ID: #665544</small>
                </div>
                <div className="d-flex flex-column gap-0 align-items-center">
                  <span className="fw-semibold text-primary">02</span>
                  <small className="text-muted">In Stock</small>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* CARD 3 — Recent Sales */}
        <div className="col-lg-4">
          <div className="card  h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center px-4 py-3">
              <h4 className="mb-0 h5">Recent Sales</h4>
              <button className="btn btn-sm btn-outline-secondary">
                <i className="ti ti-calendar-event"></i> Weekly
              </button>
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item d-flex align-items-center gap-3">
                <img src="/src/admin/assets/images/product-7.png" className="rounded" width="48" alt="" />
                <div className="flex-grow-1">
                  <p className="mb-1">MacBook Pro 16"</p>
                  <div className="d-flex align-items-center gap-2 text-muted">
                    <small className="fw-semibold">Computers </small>
                    <small>•</small>
                    <small>$2,499</small>
                  </div>
                </div>
                <span className="badge bg-success-subtle text-success">Completed</span>
              </li>
              <li className="list-group-item d-flex align-items-center gap-3">
                <img src="/src/admin/assets/images/product-9.png" className="rounded" width="48" alt="" />
                <div className="flex-grow-1">
                  <p className="mb-1">AirPods Pro Max</p>
                  <div className="d-flex align-items-center gap-2 text-muted">
                    <small className="fw-semibold">Audio </small>
                    <small>•</small>
                    <small>$549</small>
                  </div>
                </div>
                <span className="badge bg-primary-subtle text-primary">Processing</span>
              </li>
              <li className="list-group-item d-flex align-items-center gap-3">
                <img src="/src/admin/assets/images/product-8.png" className="rounded" width="48" alt="" />
                <div className="flex-grow-1">
                  <p className="mb-1">iPad Air 11"</p>
                  <div className="d-flex align-items-center gap-2 text-muted">
                    <small className="fw-semibold">Tablets </small>
                    <small>•</small>
                    <small>$799</small>
                  </div>
                </div>
                <span className="badge bg-success-subtle text-success">Completed</span>
              </li>
              <li className="list-group-item d-flex align-items-center gap-3">
                <img src="/src/admin/assets/images/product-6.png" className="rounded" width="48" alt="" />
                <div className="flex-grow-1">
                  <p className="mb-1">Magic Keyboard</p>
                  <div className="d-flex align-items-center gap-2 text-muted">
                    <small className="fw-semibold">Accessories </small>
                    <small>•</small>
                    <small>$299</small>
                  </div>
                </div>
                <span className="badge bg-danger-subtle text-danger">Cancelled</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
