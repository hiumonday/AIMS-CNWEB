#  Sequence Diagram – AIMS System

## Giới thiệu
Tài liệu này mô tả **phần công việc vẽ Sequence Diagram** của nhóm trong dự án **AIMS ** – một hệ thống thương mại điện tử cho phép khách hàng đặt hàng, thanh toán trực tuyến qua các phương thức khác nhau (PayPal, VietQR...).

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
