import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import './profile.css'; // We will create this

export default function Profile() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = 1; // MOCKED user ID as per current structure

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/v1/orders/history`);
      setOrders(response.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load order history.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await apiClient.post(`/v1/orders/${orderId}/cancel`);
      alert("Order cancelled successfully!");
      fetchOrders(); // Refresh list to reflect CANCELLED status
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to cancel order.");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'badge-warning';
      case 'PAID': return 'badge-success';
      case 'CANCELLED': return 'badge-danger';
      case 'SHIPPED': return 'badge-info';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-sidebar glass-sidebar">
        <h2>Your Profile</h2>
        <ul>
          <li className="active">Order History</li>
          <li>Account Settings</li>
          <li>Logout</li>
        </ul>
      </div>
      
      <div className="profile-content">
        <h1>Order History</h1>
        <p className="subtitle">View and track your previous orders</p>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="loading-spinner">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state glass-card">
            <p>You have no orders yet.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card glass-card">
                <div className="order-header">
                  <div className="order-id">
                    <strong>Order #{order.id}</strong>
                    <span className="order-date">{new Date(order.orderDate).toLocaleDateString()}</span>
                  </div>
                  <div className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </div>
                </div>

                <div className="order-items">
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <span>{item.quantity}x {item.productName}</span>
                      <span>{(item.price * item.quantity).toLocaleString()} VND</span>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    Total: <strong>{order.totalAmount ? order.totalAmount.toLocaleString() : '0'} VND</strong>
                  </div>
                  <div className="order-actions">
                    {order.status === 'PENDING' && (
                      <button 
                        className="btn-cancel"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Cancel Order
                      </button>
                    )}
                    <button className="btn-details">View Details</button>
                  </div>
                </div>
                
                {order.shipping && (
                    <div className="order-shipping-info">
                        <small>Shipping Status: <b>{order.shipping.status}</b></small>
                        <br/>
                        <small>Tracking: {order.shipping.trackingCode}</small>
                    </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
