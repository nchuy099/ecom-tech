# Ecom Monolith Frontend

Giao diện web cho hệ thống thương mại điện tử Ecom Monolith. Ứng dụng hỗ trợ mua hàng, quản lý đơn hàng, quản trị sản phẩm và giao hàng.

## Các khu vực chính

- Khách hàng: xem sản phẩm, tìm kiếm, giỏ hàng, thanh toán và theo dõi đơn hàng.
- Quản trị viên: quản lý sản phẩm, kho hàng, tồn kho và vận chuyển.
- Shipper: xem đơn được giao, cập nhật trạng thái và xác nhận giao hàng.

## Chạy dự án

Yêu cầu: Node.js 18 trở lên.

```bash
npm install
npm run dev
```

Mở ứng dụng tại [http://localhost:5173](http://localhost:5173).

Ứng dụng mặc định gọi backend tại `http://localhost:8080`. Có thể thay đổi địa chỉ backend trong file `.env` bằng biến `VITE_API_BASE_URL`.

## Kiểm tra bản build

```bash
npm run build
```

## Công nghệ sử dụng

React, TypeScript, Vite và Tailwind CSS.
