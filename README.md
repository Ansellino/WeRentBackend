# 🧥 WeRent Backend API

**WeRent Backend** adalah layanan REST API yang dikembangkan sebagai bagian dari project tim Werent dalam bootcamp, berdasarkan **Product Requirement Document (PRD)** yang telah disediakan.

Backend ini bertanggung jawab dalam menangani autentikasi, pengelolaan data, serta implementasi logika bisnis utama, sekaligus mendukung integrasi dengan frontend sesuai desain Figma yang telah ditentukan.

---

## 🚀 Live API

- **Base URL**  
  https://werentbackend.onrender.com/api

- **API Documentation (Swagger)**  
  https://werentbackend.onrender.com/api/docs

---

## 🛠️ Tech Stack

- **Framework**: NestJS  
- **Language**: TypeScript  
- **ORM**: Prisma  
- **Database**: PostgreSQL  
- **Authentication**: JWT  
- **Storage**: Supabase Storage  

---

## 📦 Features

- 🔐 Authentication (Register & Login)
- 👤 User Management
- 🛍️ Product Management
- 🛒 Cart System
- 📦 Order / Transaction Handling
- 🖼️ Image Upload (Supabase Storage)
- 📄 API Documentation (Swagger)

---

## 📁 Project Structure

```bash
src/
├── auth/        # Authentication module
├── users/       # User management
├── products/    # Product module
├── cart/        # Cart logic
├── orders/      # Order & transaction
├── prisma/      # Prisma service & schema
├── common/      # Shared utilities
└── main.ts      # Entry point
```
---

## ⚙️ Environment Variables

Buat file `.env` di root project:
```
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SUPABASE_STORAGE_BUCKET=review-media
PORT=3001
FRONTEND_URL=http://localhost:3000
```
---

## ▶️ Installation & Run

```bash
# install dependencies
npm install

# generate prisma client
npx prisma generate

# run migration
npx prisma migrate dev

# run development server
npm run start:dev
```
---
## 🔑 Authentication

Gunakan Bearer Token untuk endpoint yang membutuhkan autentikasi:

```http
Authorization: Bearer <access_token>
```
---
## 📌 API Overview

Lihat dokumentasi lengkap di Swagger:  
https://werentbackend.onrender.com/api/docs

Contoh endpoint utama:

| Method | Endpoint        | Description        |
|--------|----------------|--------------------|
| POST   | /auth/register | Register user      |
| POST   | /auth/login    | Login user         |
| GET    | /products      | Get all products   |
| POST   | /products      | Create product     |
| GET    | /cart          | Get user cart      |
| POST   | /orders        | Create order       |

---

## 🧪 Testing

- Postman  
- Swagger UI  

---

## 📤 Deployment

Backend di-deploy menggunakan Render.

---

## 🤝 Contributing

1. Fork repository  
2. Buat branch baru (`feature/...`)  
3. Commit perubahan  
4. Push ke branch  
5. Buat Pull Request  

---

## 📄 License

Project ini digunakan untuk kebutuhan internal / pembelajaran tim.