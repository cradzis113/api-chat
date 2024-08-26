# Sử dụng hình ảnh Node.js
FROM node:22

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Sao chép các tệp cấu hình phụ thuộc vào container
COPY package*.json ./

# Cài đặt các phụ thuộc
RUN npm install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Khai báo cổng mà ứng dụng sẽ lắng nghe
EXPOSE 3000

# Lệnh để chạy ứng dụng
CMD ["npm", "start"]
