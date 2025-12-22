#  Sequence Diagram – AIMS System

## Giới thiệu
Tài liệu này mô tả **phần công việc vẽ Sequence Diagram** của nhóm trong dự án **AIMS** – một hệ thống thương mại điện tử cho phép khách hàng đặt hàng, thanh toán trực tuyến qua các phương thức khác nhau (PayPal, VietQR...).

Mục tiêu của phần này là:
- Phân tích luồng tương tác giữa **các tác nhân (Actors)** và **các đối tượng trong hệ thống (Objects)**.
- Minh họa **các bước trao đổi thông điệp (Messages)** trong từng **Use Case chính**.

---

##  Phân công nhiệm vụ

| STT | Thành viên | MSSV | Nhiệm vụ chính | Use Case | Mô tả chi tiết |
|-----|-------------|------|----------------|-----------|----------------|
| 1 | **Đỗ Gia Huy** | 20226085 | Vẽ Sequence Diagram cho **Pay Order (Credit Card - PayPal)** | `UC006` | Biểu diễn quy trình thanh toán qua PayPal, bao gồm: xác thực OAuth, tạo đơn hàng PayPal, redirect người dùng, xác minh giao dịch, và thanh toán thành công. |
| 2 | **Nguyễn Trung Hiếu** | 20226082 | Vẽ Sequence Diagram cho **Place Order** | `UC004` | Thể hiện luồng từ khi khách hàng chọn sản phẩm, xác nhận giỏ hàng, nhập thông tin giao hàng đến khi hệ thống tạo đơn hàng và sinh hóa đơn. |
| 3 | **Nguyễn Minh Quang** | 20226123 | Vẽ Sequence Diagram cho **Pay Order by VietQR** | `UC005` | Minh họa quá trình thanh toán qua mã QR (VietQR): sinh mã QR, khách hàng quét mã, xác minh giao dịch qua callback API và thanh toán thành công. |
| 4 | **Trần Phạm Minh Đức** | 20226077 | **Review và thống nhất sơ đồ của các thành viên** | Tất cả | Kiểm tra logic, tính nhất quán giữa các sơ đồ; chỉnh sửa lỗi ký hiệu UML, đảm bảo format và tiêu chuẩn thống nhất trong toàn bộ phần Sequence Diagram. |

---
Tuần 8:
- Trần Phạm Minh Đức:
    + src/pages/ProductListPage.tsx: Trang danh sách chuyển sang gọi API backend /products với phân trang server-side; giữ state page, pageSize, total và filter (search, category, price band) rồi truyền vào listProducts. Hiển thị số trang/sản phẩm từ backend, loading/error state, và cập nhật page theo kết quả trả về.
    + src/services/productService.ts: Hàm listProducts map params sang page (0-based) và size cho backend; getProductById gọi /products/{id}. Mapping sản phẩm bổ sung đầy đủ detail cho từng loại (Book, CD, DVD, Newspaper) theo trường backend
    + src/pages/ViewProductDetail.tsx: Trang chi tiết lấy id từ route, gọi getProductById backend; có loading/error. Phần “Product Details” render theo loại
    + làm API product

- Nguyễn Trung Hiếu: 
    + làm API để thanh toán bằng VietQR
    + làm API Place Order

- Nguyễn Minh Quang:
    + Làm API Payment bằng Paypal
    + Dựng code base
- Đỗ Gia Huy:
    + kết nối Frontend và backend
    + làm Authentication

Tuần 9: 

- Trần Phạm Minh Đức:
    + src/pages/ProductListPage.tsx: Trang danh sách chuyển sang gọi API backend /products với phân trang server-side; giữ state page, pageSize, total và filter (search, category, price band) rồi truyền vào listProducts. Hiển thị số trang/sản phẩm từ backend, loading/error state, và cập nhật page theo kết quả trả về.
    + src/services/productService.ts: Hàm listProducts map params sang page (0-based) và size cho backend; getProductById gọi /products/{id}. Mapping sản phẩm bổ sung đầy đủ detail cho từng loại (Book, CD, DVD, Newspaper) theo trường backend
    + Thêm console log khi kết nối backend thành công và log lỗi khi call thất bại.
    src/pages/ViewProductDetail.tsx: Trang chi tiết lấy id từ route, gọi getProductById backend; có loading/error. Phần “Product Details” render theo loại
- Nguyễn Trung Hiếu:
    + review order code
    + nghiên cứu migration tool
    + nghiên cứu database

- Nguyễn Minh Quang:
    + update VietQR Payment API
    + Pooling Transaction Status

- Đỗ Gia Huy:

    + Làm Authorization
    + review code của cả nhóm
    + check cohension & coupling

Tuần 10:

Trần Phạm Minh Đức

Hoàn thiện UI/UX ProductList & ProductDetail: đồng bộ query param page/size lên URL, bổ sung filter nâng cao (giá min/max, sort) bám API mới.
Viết test/kiểm thử thủ công luồng xem chi tiết + thêm vào giỏ, bảo đảm mapping CD/DVD/Newspaper hiển thị đúng tất cả trường backend.
Nguyễn Trung Hiếu

Ổn định layer Order/Cart: rà soát Place Order + VietQR callback, viết migration script mẫu (schema + dữ liệu seed tối thiểu).
Thêm log/alert khi gọi thanh toán thất bại; cập nhật tài liệu DB/migration.
Nguyễn Minh Quang

Hoàn thiện PayPal & VietQR: bổ sung kiểm tra trạng thái giao dịch (polling/webhook), xử lý các edge case (expired, cancelled).
Viết hướng dẫn tích hợp thanh toán (các endpoint, request/response) và test các flow chính.
Đỗ Gia Huy

Hoàn thiện Authentication/Authorization: bảo vệ route nhạy cảm, refresh token/cookie flow, kiểm tra cohesion/coupling sau các thay đổi.
Review code toàn nhóm tuần 10, đảm bảo thống nhất style/logging/tên trường theo backend; cập nhật README/changelog ngắn cho release tuần.