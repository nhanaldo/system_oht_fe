# Kiến trúc Dự án: Warehouse System Banana FE

Dự án này được xây dựng dựa trên **Next.js App Router**, sử dụng TypeScript. Dưới đây là phân tích chi tiết về cấu trúc thư mục và tổ chức mã nguồn của toàn bộ dự án dựa trên quá trình đọc mã nguồn.

## 1. Thư mục `app/` (App Router)

Thư mục cốt lõi chứa các route (đường dẫn URL) của ứng dụng. Dự án sử dụng tính năng **Route Groups** (những thư mục có dấu ngoặc đơn `()`) để tổ chức layout mà không làm ảnh hưởng đến cấu trúc URL.

### 1.1. `app/(auth)/`
Chứa các trang dành cho việc xác thực người dùng (không yêu cầu đăng nhập trước).
- `login/`: Trang đăng nhập (`/login`).
- `register/`: Trang đăng ký (`/register`).

### 1.2. `app/(app)/`
Đây là khu vực chính của ứng dụng, chứa các tính năng quản trị kho hàng. Các trang trong này sẽ dùng chung một `layout.tsx` (như Sidebar, Header) và yêu cầu người dùng đã đăng nhập.
Gồm các phân hệ (modules) chính:
- `(warehouse)/`: Quản lý kho tổng quan (Route group). Có thể chứa `/warehouse/[id]` để xem chi tiết và cấu hình một kho cụ thể.
- `system/`: Phân hệ quản trị hệ thống (Quản lý tài khoản `accounts`, phân quyền `permissions`, vai trò `roles`, `menus`, `actions`).
- `inventory/`: Quản lý hàng tồn kho, danh sách các thùng hàng (`containers`, `list`).
- `product/`: Quản lý danh mục hàng hoá (`categories`, danh sách `list`, `box-types`, `unit-types`).
- `jobs/`: Quản lý luồng công việc/phiếu (`import` - nhập kho, `export` - xuất kho).
- `devices/`: Quản lý thiết bị phần cứng, băng chuyền, xe AGV trong kho.
- `monitors/`: Màn hình giám sát theo thời gian thực (hiển thị hoạt động, log).
- `workflows/`: Quản lý quy trình hoạt động (luồng làm việc).
- `realtime/`: Chứa các logic liên quan đến Socket.IO để đồng bộ dữ liệu di chuyển, trạng thái theo thời gian thực (`RealtimeProvider.tsx`, `realtimeAction.ts`).
- `dashboard/`, `home/`, `infoUser/`: Các trang tổng quan và thông tin cá nhân.

### 1.3. `app/api/`
Chứa **Route Handlers** (các API backend nhỏ gọn của Next.js). Dùng để làm proxy gọi đến backend chính, xử lý Webhook, hoặc các tác vụ không muốn expose (lộ) ra Client.

---

## 2. Thư mục `components/` (UI Components)

Chứa các thành phần giao diện dùng chung (reusable components) trên toàn dự án. Việc đặt ngoài `app/` giúp code sạch sẽ và tách biệt view với logic route.
- **`ui/`**: Các component tùy chỉnh dựa trên thư viện UI cốt lõi.
  - `CustomTable.tsx`: Bảng dữ liệu tùy chỉnh dùng chung cho các màn hình danh sách (phân trang, filter).
  - `CustomInput.tsx`, `CustomSelect.tsx`: Form components đã được bọc lại chuẩn hoá.
  - `ModalConfirmDelete.tsx`: Popup xác nhận thao tác nguy hiểm.
  - `HeaderComponent.tsx`: Thanh điều hướng Header.
  - `DynamicIcon.tsx`: Render icon động từ text lưu trong DB.
  - `Toast.tsx`: Hiển thị thông báo (Notification/Snackbar).

---

## 3. Thư mục `lib/` (Libraries & Utilities)

Chứa các hàm tiện ích, cấu hình và logic dùng chung không liên quan trực tiếp đến React UI.
- `serverFetch.ts`: Rất quan trọng. Đây là file wrapper bọc lại hàm `fetch` mặc định, chuyên dùng để gọi API từ phía Next.js Server (Server Components / Server Actions) sang Backend Server chính (Java/Go/Python backend đang chạy ở `10.14.82.11:8888`). File này thường chứa logic gắn Bearer token, xử lý timeout và bắt lỗi chung.
- `data/`: Chứa các biến hằng số (constants), mã lỗi, hoặc dữ liệu tĩnh mock (fake data).

---

## 4. Thư mục `types/` (TypeScript Types)

Trung tâm định nghĩa kiểu dữ liệu (Interfaces/Types) cho toàn bộ ứng dụng, giúp TypeScript kiểm tra lỗi chặt chẽ từ đầu đến cuối.
Các file ở đây thường phản ánh (mapping) đúng cấu trúc Database hoặc JSON response từ API Backend trả về:
- `account.ts`: Kiểu dữ liệu User, Profile.
- `warehouse.ts`: Cấu trúc dữ liệu phân tầng của kho bãi (Kho -> Khu vực (Zone) -> Tòa (Tower) -> Vị trí (Location)).
- `product.ts`, `category.ts`: Dữ liệu hàng hoá.
- `workflow.ts`, `role.ts`, `container.ts`, `device-type.ts`...

---

## 5. Các File Cấu hình Gốc (Root)

- `next.config.ts`: Cấu hình lõi của Next.js framework (định tuyến, proxy, tối ưu hóa).
- `postcss.config.mjs` & `globals.css`: Cấu hình xử lý CSS (nhiều khả năng dự án có dùng Tailwind CSS hoặc PostCSS plugins).
- `eslint.config.mjs`: Cấu hình chuẩn code giúp team code đồng nhất.
- `tsconfig.json`: Cấu hình TypeScript cho dự án.
- `.env.local`: File chứa biến môi trường cục bộ (URL backend, API key, Secret key...).
