# Hướng dẫn cấu hình Cloudinary

## 1. Tạo tài khoản Cloudinary (nếu chưa có)

1. Truy cập: https://cloudinary.com/
2. Đăng ký tài khoản miễn phí
3. Sau khi đăng nhập, vào Dashboard

## 2. Lấy thông tin cần thiết

Từ Dashboard của Cloudinary, lấy các thông tin sau:

- **Cloud Name**: Tên cloud của bạn
- **Upload Preset**: Cần tạo mới (xem bước 3)

## 3. Tạo Upload Preset

1. Vào **Settings** → **Upload**
2. Scroll xuống phần **Upload presets**
3. Click **Add upload preset**
4. Cấu hình:
   - **Preset name**: Đặt tên (ví dụ: `itss1_upload`)
   - **Signing mode**: Chọn **Unsigned**
   - **Folder**: (tùy chọn) Đặt tên folder để lưu ảnh (ví dụ: `day-plans`)
5. Click **Save**

## 4. Cập nhật code

Mở file `schedule.create.jsx` và thay đổi:

```javascript
const CLOUDINARY_UPLOAD_PRESET = "your_upload_preset"; // Thay bằng preset name vừa tạo
const CLOUDINARY_CLOUD_NAME = "your_cloud_name"; // Thay bằng Cloud Name từ Dashboard
```

Ví dụ:

```javascript
const CLOUDINARY_UPLOAD_PRESET = "itss1_upload";
const CLOUDINARY_CLOUD_NAME = "dxyz123abc";
```

## 5. Cập nhật user_id

Trong hàm `handleSubmit`, thay đổi:

```javascript
user_id: '693791edb4a4ce2737d360d7', // Thay bằng ID thực của user đang đăng nhập
```

Hoặc lấy từ cookies/localStorage/context nếu có authentication system.

## Lưu ý:

- Tài khoản miễn phí Cloudinary có giới hạn: 25 credits/tháng
- Mỗi lần upload ảnh tốn ~0.01 credits
- Có thể upload ảnh tối đa 10MB
