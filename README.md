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
    + src/services/productService.ts: Hàm listProducts map params sang page (0-based) và size cho backend; getProductById gọi /products/{id}. Mapping sản phẩm bổ sung đầy đủ detail cho từng loại (Book, CD, DVD, Newspaper) theo trường backend:
        + Book: authors, coverType, publisher, publishDate, pages, language, genre.
        + CD: artist, recordLabel, trackList/track count từ chuỗi tracks, discType (default Unknown), releaseDate, genre.
        + DVD: discType, director, runtimeMinutes/runtime, studio, language, subtitles, releaseDate, genre.
        + Newspaper: editorInChief, publisher, publishDate/issueDate, issueNumber, sections, frequency, ISSN, language, genre/sections.
        Thêm console log khi kết nối backend thành công và log lỗi khi call thất bại.
    + src/pages/ViewProductDetail.tsx: Trang chi tiết lấy id từ route, gọi getProductById backend; có loading/error. Phần “Product Details” render theo loại:
        + Book: Author(s), Cover Type, Publisher, Publication Date, Pages, Language, Genre.
        + Newspaper: Editor-in-chief, Publisher, Publication Date, Issue Number, Frequency, Sections, ISSN, Language, Genre/Section.
        + CD: Artist(s), Record Label, Disc Type, Tracks, Track List, Release Date, Genre.
        + DVD: Disc Type, Director, Runtime, Studio, Language, Subtitles, Release Date, Genre.