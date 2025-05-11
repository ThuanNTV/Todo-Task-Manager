## Tài Liệu Kiểm Thử Thủ Công (Manual Testing) – Todo Master

### 1. Mục tiêu

- Xác minh toàn bộ chức năng CRUD: Tạo, đọc, cập nhật (edit), xóa, hoàn thành (complete), lưu trữ (archive).
- Đảm bảo tính năng đính kèm ảnh, lựa chọn ngày, chọn priority hoạt động chính xác.
- Kiểm tra hiển thị UI, responsive, sticky form, custom scrollbar, notification toast.
- Đảm bảo dữ liệu lưu và phục hồi đúng trong `localStorage`.
- Xác thực bảo mật cơ bản: escape HTML (XSS), validate input.

### 2. Phạm vi kiểm thử

- Form nhập liệu (`todo-form`)
- Danh sách In Progress & Completed
- Notification system
- LocalStorage persistence
- Responsive trên các kích thước và trình duyệt
- Accessibility: ARIA attributes, keyboard

### 3. Môi trường kiểm thử

- **Trình duyệt**: Chrome, Firefox, Edge, Safari (phiên bản mới nhất)
- **Thiết bị**: Desktop (Win/Mac), Mobile (Android Chrome, iOS Safari)
- **Công cụ**: DevTools (Console, Network, Application→LocalStorage)
- **Dữ liệu thử**: ảnh JPEG/PNG \~<500KB, nội dung text có chuỗi HTML

---

### 4. Test Case Chi Tiết

| Mã   | Tên Test Case            | Tiền điều kiện                     | Các bước thực hiện                                                            | Kết quả mong đợi | Pass/Fail | Ghi chú |
| ---- | ------------------------ | ---------------------------------- | ----------------------------------------------------------------------------- | ---------------- | --------- | ------- |
| TC01 | Tạo Task mới (không ảnh) | Trang load xong, LocalStorage rỗng | 1. Nhập `Title`, `Date` (mặc định = hôm nay), `Description`, chọn `priority`. |                  |           |         |

2. Bấm `Create Task`. | - Task xuất hiện trong `In Progress`.

- Hiển thị đúng title, due date, mô tả, tag priority.
- LocalStorage cập nhật với object mới. | | |
  \| TC02 | Tạo Task có ảnh | TC01 thành công | 1. Lặp TC01, nhưng chọn file image. | - Task hiển thị preview ảnh.
- LocalStorage chứa trường `image` dạng Base64. | | |
  \| TC03 | Validate input rỗng | Trang load xong | 1. Để trống `Title` hoặc `Description`.

2. Bấm `Create Task`. | - Hiển thị notification Error `Please fill in all required fields`.

- Task không được tạo. | | |
  \| TC04 | Escape XSS input | Trang load xong | 1. Nhập `<script>alert(1)</script>` vào title/desription.

2. Tạo Task. | - Không có alert pop-up.

- Nội dung hiển thị nguyên văn `<script>...` trong card (escaped). | | |
  \| TC05 | Edit Task | TC01 có ít nhất 1 task In Progress | 1. Nhấn `Edit` trên task.

2. Thay đổi title, mô tả, priority, optional đặt ảnh mới.
3. Bấm `Update Task`. | - Card cập nhật đúng nội dung mới.

- LocalStorage phản ánh thay đổi. | | |
  \| TC06 | Complete Task | Có task In Progress | 1. Nhấn `Complete` trên card in progress. | - Task chuyển qua `Completed` section.
- Hiển thị nhãn `Completed: <date>`.
- LocalStorage cập nhật `status`, `completedAt`. | | |
  \| TC07 | Archive Task | Có task Completed | 1. Nhấn `Archive` trên card completed. | - Task biến mất khỏi UI (hoặc ẩn).
- LocalStorage `status` = `archived`. | | |
  \| TC08 | Delete Task | Có task In Progress & Completed | 1. Nhấn `Delete` trên mỗi card cả 2 section. | - Task bị xóa khỏi UI và LocalStorage. | | |
  \| TC09 | Notification Toast | Thực hiện TC01 → TC08 | 1. Mỗi thao tác `Create/Update/Delete/Complete/Archive` xem toast hiện

2. Quan sát animation fade in/out, disappear sau 3s. | - Notification hiển thị đúng nội dung, màu tương ứng success/error.

- Fade in/out mượt. | | |
  \| TC10 | Persistence sau reload | Làm xong TC01, TC02, … TC08 | 1. Refresh trang

2. Quan sát UI và LocalStorage. | - Danh sách In Progress & Completed giữ nguyên sau reload.

- tasks load từ LocalStorage. | | |
  \| TC11 | Sticky Form | Trang có nhiều content → scroll xuống | 1. Scroll trang đủ dài.

2. Quan sát form sidebar. | - Form luôn dính (sticky) phía trên khi scroll. | | |
   \| TC12 | Responsive – Mobile | Mở Chrome DevTools (Device mode), chọn iPhone8 | 1. Chuyển viewport <768px
3. Kiểm tra layout form & danh sách.
4. Thử tạo, complete, delete. | - Giao diện hiển thị 1 cột dọc.

- Tất cả chức năng trên mobile hoạt động mượt. | | |
  \| TC13 | Cross-browser | Mở trang trên Chrome/Firefox/Edge/Safari | 1. Thực hiện TC01 → TC08 trên từng browser. | - Không lỗi JS trong Console.
- Các tính năng hoạt động giống nhau. | | |
  \| TC14 | Scrollbar Custom | Tạo nhiều task cho overflow | 1. Thêm > 20 task.

2. Kiểm tra scrollbar của `.tasks-wrapper`. | - Scrollbar hiện trên WebKit + Firefox.

- Thumb di chuyển mượt, track màu đúng. | | |
  \| TC15 | Accessibility – Keyboard & ARIA | Trang load xong | 1. Tab qua các input/button.

2. Kiểm tra ARIA labels (`aria-required`, `aria-live`). | - Tab focus đúng thứ tự.

- Screen reader có thể đọc label/notification. | | |

---

### 5. Ghi chú chung

- Ghi kết quả Pass/Fail và lưu ảnh chụp màn hình nếu có lỗi.
- Kiểm tra Console log (F12) để bắt JS error.
- Đảm bảo reset LocalStorage giữa các lượt test hoặc dùng profile/test environment riêng.
- Lưu tập tin test report kèm timestamp.
