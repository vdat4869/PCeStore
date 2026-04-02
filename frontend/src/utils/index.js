// Thư mục chứa các hàm util như format ngày tháng, tiền tệ...
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};
