# Ecom Monolith Java Frontend (Modern Storefront & Management UI)

Giao diện người dùng hiện đại, tinh tế được xây dựng bằng **React + TypeScript + Tailwind CSS**, thiết kế chuẩn hóa và đồng bộ 100% với backend Spring Boot 3.5 tại [`ecom-monolith-java`](../ecom-monolith-java).

---

## ✨ Điểm Nhấn Kiến Trúc & Thiết Kế

1. **Phong cách Hiện Đại (Modern & Sleek UI)**:
   - Hệ màu tối giản cao cấp (Modern Slate, Glassmorphism `backdrop-blur-md`, subtle border tokens).
   - Hỗ trợ toàn diện **Dark Mode & Light Mode** tự động nhận diện hoặc chuyển đổi tức thì.
   - Micro-interactions, Skeleton loading, Toast notifications và hoạt ảnh mượt mà.

2. **Chế độ UI-First & Mock Data Engine Sẵn Sàng**:
   - Tích hợp sẵn bộ sinh dữ liệu mô phỏng chân thực (sản phẩm công nghệ cao cấp, biến thể cấu hình, mạng lưới kho Hà Nội - HCM - Đà Nẵng, đơn hàng, vận đơn).
   - Cho phép bạn trải nghiệm click-through toàn bộ luồng mua sắm ngay lập tức mà không cần khởi động MySQL hay Backend trước.
   - Dễ dàng chuyển sang chế độ kết nối trực tiếp với backend Spring Boot `:8080` chỉ với 1 click trên thanh **Dev Tool**.

3. **Phản Ánh Trọn Vẹn Các Cơ Chế Của Backend Java**:
   - **Haversine Geolocation Dispatch**: Tính toán cự ly giữa địa chỉ giao hàng và 3 tổng kho (Long Biên, Tân Bình, Hải Châu) để tự động chọn kho gần nhất.
   - **Pessimistic Lock & Reservation**: Trực quan hóa trạng thái tồn kho khả dụng (`availableQuantity`) và tồn kho tạm giữ (`reservedQuantity`).
   - **Keyset Cursor Pagination**: Phân trang theo con trỏ chuẩn `CursorPageResponse`.
   - **OAuth2 JWT Authentication**: Tương thích Spring Security Bearer Token.
   - **Shipment Timeline**: Theo dõi hành trình kiện hàng theo từng mốc trạng thái vận đơn.

---

## 🧭 Cấu Trúc Các Phân Hệ Màn Hình

### 1. Phân Hệ Khách Hàng (Storefront)
- **Trang chủ (`/`)**: Hero banner, Flash Sale đếm ngược thời gian thực, danh mục sản phẩm, tính năng định tuyến kho Haversine.
- **Trang danh mục & Tìm kiếm (`/catalog`)**: Tìm kiếm từ khóa, lọc theo ngành hàng, thanh trượt khoảng giá, lọc chỉ hàng có sẵn, sắp xếp và chuyển đổi chế độ xem Lưới (Grid) / Danh sách (List).
- **Trang chi tiết sản phẩm (`/products/:id`)**: Bộ sưu tập ảnh, bộ chọn biến thể cập nhật giá và tồn kho thời gian thực, modal tra cứu kho hàng, accordion thông số kỹ thuật.
- **Giỏ hàng trượt (Slide-over Cart Drawer) & Trang giỏ hàng (`/cart`)**: Thao tác tăng giảm số lượng, nhập voucher ưu đãi (`ECOMLAB2026`).
- **Quy trình thanh toán đa kho 4 bước (`/checkout`)**:
  - Bước 1: Chọn sổ địa chỉ nhận hàng (có hiển thị tọa độ GPS).
  - Bước 2: Hiển thị bảng điều phối kho & tính cự ly Km (`ShipmentPlanResponse`).
  - Bước 3: Chọn phương thức thanh toán (QR Napas247, Thẻ quốc tế, COD).
  - Bước 4: Xác nhận và thực hiện đặt hàng kèm animation mô phỏng khóa hàng.
- **Theo dõi & Lịch sử đơn hàng (`/orders`, `/orders/:id`)**: Stepper trạng thái (`PENDING` -> `CONFIRMED` -> `SHIPPED` -> `DELIVERED`), timeline vận đơn, nút Hủy đơn (JPA Rollback) và Yêu cầu đổi trả (`/returns`).
- **Tài khoản cá nhân (`/profile`)**: Quản lý thông tin và sổ địa chỉ giao hàng.
- **Trung tâm thông báo (`/notifications`)**: Xem và đánh dấu đã đọc thông báo hệ thống.

### 2. Phân Hệ Quản Trị Viên (Admin Portal - `/admin`)
- **Dashboard (`/admin`)**: Thẻ KPI doanh thu, tổng đơn hàng, tổng tồn kho khả dụng vs tạm giữ, cảnh báo hàng sắp hết.
- **Quản lý sản phẩm (`/admin/products`)**: Bảng dữ liệu sản phẩm, SKU, giá bán, modal tạo sản phẩm & biến thể mới.
- **Mạng lưới kho & Tồn kho (`/admin/warehouses`)**: Danh sách kho với kinh độ / vĩ độ, bảng phân bổ tồn kho và modal điều chỉnh số lượng (`/api/v1/admin/inventory/adjust`).
- **Điều phối vận chuyển (`/admin/shipments`)**: Bảng vận đơn và phân công tài xế giao hàng.

### 3. Phân Hệ Tài Xế Giao Hàng (Shipper Portal - `/shipper`)
- Giao diện tối ưu di động với các tác vụ giao hàng, số điện thoại khách hàng (click to call), link dẫn đường Google Maps và các nút cập nhật trạng thái: "Bắt đầu giao", "Giao thành công", "Báo thất bại".

---

## 🚀 Khởi Chạy Dự Án

### 1. Cài đặt và Chạy Development Server

```bash
cd /home/nchuy099/ecom-lab/ecom-monolith-java-frontend
npm install
npm run dev
```

*Ứng dụng sẽ lắng nghe tại cổng **`http://localhost:3001`** (cấu hình sẵn proxy `/api` sang backend Java `http://localhost:8080`).*

### 2. Kiểm Tra Biên Dịch & Đóng Gói (Production Build)

```bash
npm run build
```

---

## 🛠️ Thanh Công Cụ Nhà Phát Triển (Dev Tool Floating Dock)

Ở góc dưới bên trái màn hình luôn có sẵn một thanh công cụ nổi:
- **Mock Data UI Toggle**: Bật tắt giữa chế độ chạy dữ liệu mẫu và gọi API Spring Boot thật.
- **1-Click Chuyển Đổi Vai Trò**: Chuyển nhanh giữa `Customer`, `Admin`, `Shipper`, `Thủ kho` và `Khách vãng lai` mà không cần nhập mật khẩu.
- **Copy JWT Token**: Sao chép Bearer Token để kiểm thử trên Swagger UI (`http://localhost:8080/swagger-ui.html`) hoặc Postman.
