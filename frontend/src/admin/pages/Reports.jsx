import React, { useState } from 'react';
import Chart from 'react-apexcharts';

export default function Reports() {
  const [showingBoth, setShowingBoth] = useState(true);

  // Data
  const salesThisYear = [42000, 53000, 48000, 61000, 72000, 69000, 74000, 82000, 78000, 86000, 91000, 97000];
  const salesLastYear = [38000, 45000, 47000, 56000, 65000, 63000, 68000, 70000, 69000, 75000, 80000, 84000];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // Series based on state
  const series = showingBoth 
    ? [
        { name: 'This Year', data: salesThisYear },
        { name: 'Last Year', data: salesLastYear }
      ]
    : [
        { name: 'This Year', data: salesThisYear }
      ];

  const salesOptions = {
    chart: { type: 'area', zoom: { enabled: false }, toolbar: { show: false } },
    colors: ['#E66239', '#198754'],
    stroke: { width: [3, 2.5], curve: 'smooth' },
    markers: { size: 4, hover: { sizeOffset: 2 } },
    dataLabels: { enabled: false },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, inverseColors: false, opacityFrom: 0.45, opacityTo: 0.05, stops: [20, 60, 100] }
    },
    yaxis: {
      labels: { formatter: (val) => '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 }) },
      title: { text: 'Sales (INR)' }
    },
    xaxis: { categories: months, tickPlacement: 'on' },
    tooltip: {
      shared: true,
      y: { formatter: (val) => '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 }) }
    },
    legend: { position: 'top', horizontalAlign: 'right' },
  };

  const toggleSeries = () => {
    setShowingBoth(!showingBoth);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="">
            <h1 className="fs-3 mb-1">Reports</h1>
            <p className="mb-0">View your inventory analytics and reports</p>
          </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        {/* Stat cards */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card h-100">
            <div className="card-body p-4">
              <h6 className="mb-4 ">Total Revenue</h6>
              <h3 className="mb-1 fw-bold">$45,231</h3>
              <p className="mb-0 text-success small"><i className="ti ti-arrow-up"> </i>12% from last month</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="card h-100">
            <div className="card-body p-4">
              <h6 className="mb-4 ">Products Sold</h6>
              <h3 className="mb-1 fw-bold">1,234</h3>
              <p className="mb-0 text-success small"><i className="ti ti-arrow-up"> </i> 8% from last month</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="card h-100">
            <div className="card-body p-4">
              <h6 className="mb-4 ">Low Stock Items</h6>
              <h3 className="mb-1 fw-bold">23</h3>
              <p className="mb-0 text-danger small"><i className="ti ti-arrow-down"> </i> 3% from last month</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="card h-100">
            <div className="card-body p-4">
              <h6 className="mb-4 ">Out of Stock</h6>
              <h3 className="mb-1 fw-bold">5</h3>
              <p className="mb-0 text-danger small"><i className="ti ti-arrow-down"> </i> 2% from last month</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        {/* Sales Overview (full width) */}
        <div className="col-12">
          <div className="card">
            <div className="card-body p-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-3 gap-2">
                <div>
                  <h2 className="mb-0 fs-5">Sales Overview</h2>
                </div>
                <div className="controls">
                  <button className="btn btn-light btn-sm me-2">Randomize Data</button>
                  <button className="btn btn-primary btn-sm" onClick={toggleSeries}>
                    {showingBoth ? 'Show This Year Only' : 'Show Comparison'}
                  </button>
                </div>
              </div>

              {/* Chart Implementation */}
              <div id="salesChart">
                 <Chart options={salesOptions} series={series} type="area" height={420} />
              </div>

              <div className="d-flex justify-content-end mt-3">
                <a href="#!" className="small">View detailed report</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Top Products */}
        <div className="col-12">
          <div className="card">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h2 className="mb-0 fs-5">Top Products</h2>
                </div>
              </div>

              {/* Product rows */}
              <div className="list-group list-group-flush">
                <div className="list-group-item p-3 d-flex align-items-center">
                  <div className="me-3">
                    <img src="/src/admin/assets/images/product-1.png" alt="Product A" className="rounded" style={{ width:'48px', height:'48px', objectFit:'cover' }} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">Gaming Joy Stick</h6>
                        <small className="text-secondary">156 units sold</small>
                      </div>
                      <div className="text-end">
                        <strong>$3,120</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="list-group-item p-3 d-flex align-items-center">
                  <div className="me-3">
                    <img src="/src/admin/assets/images/product-2.png" alt="Product B" className="rounded" style={{ width:'48px', height:'48px', objectFit:'cover' }} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">Wireless Headphones</h6>
                        <small className="text-secondary">134 units sold</small>
                      </div>
                      <div className="text-end">
                        <strong>$2,680</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="list-group-item p-3 d-flex align-items-center">
                  <div className="me-3">
                    <img src="/src/admin/assets/images/product-3.png" alt="Product C" className="rounded" style={{ width:'48px', height:'48px', objectFit:'cover' }} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">Smartwatch</h6>
                        <small className="text-secondary">98 units sold</small>
                      </div>
                      <div className="text-end">
                        <strong>$1,960</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
