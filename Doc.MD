## Tài liệu hướng dẫn (Full Documentation) cho Todo Master - Smart Task Manager

### 1. Tổng quan dự án

**Todo Master** là ứng dụng quản lý công việc cá nhân với giao diện hiện đại, responsive và các tính năng:

- Tạo, chỉnh sửa, xóa, đánh dấu hoàn thành và lưu trữ task.
- Đính kèm ảnh, chọn ngày hoàn thành và mức độ ưu tiên.
- Giao diện phân chia 2 vùng: Form nhập liệu và Danh sách Task (In Progress + Completed).
- Lưu trữ toàn bộ dữ liệu vào `localStorage` để giữ state khi reload.

### 2. Cấu trúc thư mục

```
todo-master/
│
├── index.html       # HTML chính, định nghĩa layout và thẻ semantic
├── style.css        # CSS design tokens, layout, responsive, hiệu ứng
├── script.js        # Logic JS đầy đủ (CRUD, localStorage, UI update)
└── img/             # Thư mục chứa ảnh mẫu nếu cần
```

### 3. Công nghệ sử dụng

- **HTML5 & ARIA**: Semantic tags (`<section>`, `<article>`, `aria-labelledby`) để tăng khả năng truy cập (accessibility).
- **CSS Custom Properties**: Biến màu, khoảng cách, typography, shadow, transition.
- **JavaScript (ES6+)**: Chức năng tạo, chỉnh sửa, xóa, hoàn thành task, event delegation, FileReader, Formatter, Date API.
- **LocalStorage**: Lưu trữ mảng `tasks` để giữ dữ liệu cục bộ.

### 4. Triển khai & Chạy ứng dụng

1. Clone repository về local:

   ```bash
   git clone <repo-url>
   ```

2. Mở file `index.html` bằng trình duyệt (Chrome/Firefox/Edge/Safari).
3. Hoặc chạy server local (optional):

   ```bash
   npx serve .
   ```

4. Sử dụng form bên trái để thêm/sửa task, thao tác ngay trên UI.

### 5. Mô tả chi tiết `script.js`

#### 5.1 Khởi tạo và load dữ liệu

- `let tasks = JSON.parse(localStorage.getItem('tasks')) || [];`
- `initApp()` gọi `renderTasks()` và `updateTaskCounts()`.

#### 5.2 Xử lý submit form

- `handleTaskSubmit(e)`: validate title, date, description.
- Nếu có file ảnh: sử dụng `FileReader` để convert sang Base64 rồi gọi `createTask()`.
- Không ảnh: trực tiếp `createTask(...)`.

#### 5.3 Hàm `createTask()`

Tạo object `newTask` với các thuộc tính:

```js
{
  id: generateUniqueId(),
  title,
  date,
  description,
  priority,
  image: imageData,
  status: 'progress',
  createdAt,
  completedAt: null
}
```

- Thêm vào `tasks.unshift()`, lưu `saveTasks()`, re-render, reset form.

#### 5.4 Event Delegation cho Task Actions

- Xử lý click trên `progressList` và `completedList`:

  - `.delete-btn`: xóa task, update LS, re-count.
  - `.complete-btn`: đổi `status` -> `'completed'`, gán `completedAt`, re-render.
  - `.edit-btn`: điền form, hoán đổi handler để update task hiện tại.
  - `.archive-btn`: đánh dấu `status='archived'`, (phần UI có thể bổ sung sau).

#### 5.5 Render & update UI

- `renderTasks()`: clear wrapper, lọc task theo `status`, tạo card bằng `createTaskCard()`.
- `createTaskCard(task)`: build HTML card:

  - Header (title + time)
  - Body (ảnh nếu có + mô tả + metadata)
  - Footer (action buttons)

- `updateTaskCounts()`: cập nhật số task In Progress/Completed hiển thị trên UI.

#### 5.6 Các utility functions

- `generateUniqueId()`: tạo ID duy nhất.
- `escapeHTML(str)`: ép thành string và replace để tránh XSS.
- `capitalize(str)`: viết hoa ký tự đầu.
- `showNotification(message, type)`: popup toast ở góc phải, fade in/out.
- `saveTasks()`: `localStorage.setItem('tasks', JSON.stringify(tasks));`

### 6. CSS Highlights

- **Design tokens**: màu, spacing, typography, shadow, border-radius, transition.
- **Responsive Grid**: `grid-template-columns` cho `.app-container` và `.tasks-container`.
- **Sticky Form**: phần form dùng `position: sticky; top: ...;` để luôn hiển thị.
- **Custom Scrollbar**: cho `.tasks-wrapper` trên WebKit và Firefox.
- **Hover/Focus**: hiệu ứng nâng card, focus input, hover button.

### 7. Hướng mở rộng

- Thêm chức năng **Filter/Sort** theo priority hoặc ngày.
- Tích hợp **API backend** thay cho LocalStorage.
- Phân quyền người dùng, đăng nhập bằng OAuth.
- Export/Import CSV, Calendar Sync.
- Tối ưu performance: Virtual scroll khi số lượng lớn.

---

_Đây là tài liệu đầy đủ cho phiên bản hiện tại. Mình có thể bổ sung sơ đồ luồng dữ liệu (flowchart), ERD, hoặc hướng dẫn CI/CD nếu bạn cần._
