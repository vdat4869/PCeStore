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
    { name: 'Sales', data: [0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { name: 'Purchase', data: [0, 0, 0, 0, 0, 0, 0, 0, 0] },
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

  const customerSeries = [0, 0];

  return (
    <div className="container-fluid">
      <div className="row ">
        <div className="col-12">
          <div className="mb-6">
            <h1 className="fs-3 mb-1">Tổng quan</h1>
            <p>Nội dung chính hiển thị tại đây...</p>
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
                <h2 className="mb-3 fs-6">Tổng doanh thu</h2>
                <h3 className="fw-bold mb-0">$0</h3>
                <p className="text-primary mb-0 small">0% so với tháng trước</p>
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
                <h2 className="mb-3 fs-6">Tổng mua hàng</h2>
                <h3 className="fw-bold mb-0">$0</h3>
                <p className="text-success mb-0 small">0% so với tháng trước</p>
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
                <h2 className="mb-3 fs-6">Tổng chi phí</h2>
                <h3 className="fw-bold mb-0">$0</h3>
                <p className="text-info mb-0 small">0% so với tháng trước</p>
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
                <h2 className="mb-3 fs-6">Hóa đơn đến hạn</h2>
                <h3 className="fw-bold mb-0">$0</h3>
                <p className="text-warning mb-0 small">0% so với tháng trước</p>
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
                  <h3 className="fw-bold h4">$0</h3>
                  <span>Tổng lợi nhuận</span>
                </div>
                <div>
                  <i className="ti ti-layers-subtract fs-1 text-primary"></i>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center small">
                <div className="text-muted"><span className="text-secondary">0%</span> so với tháng trước</div>
                <div><a href="#!" className="link-primary text-decoration-underline">Xem chi tiết</a></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-12">
          <div className="card">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between border-bottom pb-5 mb-3">
                <div>
                  <h3 className="fw-bold h4">$0</h3>
                  <span>Tổng tiền hoàn trả</span>
                </div>
                <div>
                  <i className="ti ti-credit-card fs-1 text-danger"></i>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center small">
                <div className="text-muted"><span className="text-secondary">0%</span> so với tháng trước</div>
                 <div><a href="#!" className="link-primary text-decoration-underline">Xem chi tiết</a></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-12">
          <div className="card">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between border-bottom pb-5 mb-3">
                <div>
                  <h3 className="fw-bold h4">$0</h3>
                  <span>Tổng chi phí</span>
                </div>
                <div>
                  <i className="ti ti-cash-banknote fs-1 text-warning"></i>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center small">
                <div className="text-muted"><span className="text-secondary">0%</span> so với tháng trước</div>
                <div><a href="#!" className="link-primary text-decoration-underline">Xem chi tiết</a></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center bg-transparent px-4 py-3">
              <h3 className="h5 mb-0">Doanh thu & Mua hàng</h3>
              <div>
                <select className="form-select form-select-sm" defaultValue="This Year">
                  <option value="This Year">Năm nay</option>
                  <option value="This Month">Tháng này</option>
                  <option value="This Week">Tuần này</option>
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
              <h3 className="h5 mb-0">Thông tin tổng thể</h3>
              <div>
                <select className="form-select form-select-sm" defaultValue="Last 6 Months">
                  <option value="Last 6 Months">6 Tháng qua</option>
                  <option value="This Month">Tháng này</option>
                  <option value="This Week">Tuần này</option>
                </select>
              </div>
            </div>
            <div className="card-body p-4">
              <h3 className="h6">Tổng quan khách hàng</h3>
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
                        <h2 className="mb-1">0</h2>
                        <p className="text-success mb-2">Khách mới</p>
                        <span className="badge bg-secondary"><i className="ti ti-minus me-1"></i>0%</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center">
                        <h2 className="mb-1">0</h2>
                        <p className="text-warning mb-2">Quay lại</p>
                        <span className="badge bg-secondary badge-xs d-inline-flex align-items-center"><i
                            className="ti ti-minus me-1"></i>0%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row text-center border-top mt-4 pt-4">
                <div className="col-4 border-end">
                  <h3 className="fw-bold mb-2">0</h3>
                  <small className="text-secondary">Nhà cung cấp</small>
                </div>
                <div className="col-4 border-end">
                  <h3 className="fw-bold mb-2">0</h3>
                  <small className="text-secondary">Khách hàng</small>
                </div>
                <div className="col-4">
                  <h3 className="fw-bold mb-2">0</h3>
                  <small className="text-secondary">Đơn hàng</small>
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
              <h4 className="mb-0 h5">Sản phẩm bán chạy nhất</h4>
              <button className="btn btn-sm btn-outline-secondary">
                <i className="ti ti-calendar"></i> Hôm nay
              </button>
            </div>
            <div className="text-center p-4 text-muted">
              <p className="mb-0">Chưa có dữ liệu</p>
            </div>
          </div>
        </div>

        {/* CARD 2 — Low Stock Products */}
        <div className="col-lg-4">
          <div className="card  h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center px-4 py-3">
              <div className="d-flex align-items-center">
                <h4 className="mb-0 h5">Sản phẩm sắp hết hàng</h4>
              </div>
              <a href="#!" className="small text-primary text-decoration-underline">Xem tất cả</a>
            </div>
            <div className="text-center p-4 text-muted">
              <p className="mb-0">Chưa có dữ liệu</p>
            </div>
          </div>
        </div>

        {/* CARD 3 — Recent Sales */}
        <div className="col-lg-4">
          <div className="card  h-100">
            <div className="card-header bg-white d-flex justify-content-between align-items-center px-4 py-3">
              <h4 className="mb-0 h5">Đơn hàng gần đây</h4>
              <button className="btn btn-sm btn-outline-secondary">
                <i className="ti ti-calendar-event"></i> Tuần này
              </button>
            </div>
            <div className="text-center p-4 text-muted">
              <p className="mb-0">Chưa có đơn hàng nào</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
