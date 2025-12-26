#  AIMS System

## Giới thiệu
Tài liệu này mô tả **phần công việc vẽ Sequence Diagram** của nhóm trong dự án **AIMS** – một hệ thống thương mại điện tử cho phép khách hàng đặt hàng, thanh toán trực tuyến qua phương thức VietQR.

Mục tiêu của phần này là:
- Phân tích luồng tương tác giữa **các tác nhân (Actors)** và **các đối tượng trong hệ thống (Objects)**.
- Minh họa **các bước trao đổi thông điệp (Messages)** trong từng **Use Case chính**.


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
