# 🧥 WeRent Backend API

**WeRent Backend** adalah layanan REST API yang dikembangkan sebagai bagian dari project tim Werent dalam bootcamp, berdasarkan **Product Requirement Document (PRD)** yang telah disediakan.

Backend ini bertanggung jawab dalam menangani autentikasi, pengelolaan data, serta implementasi logika bisnis utama, sekaligus mendukung integrasi dengan frontend sesuai desain Figma yang telah ditentukan.

---

## 📖 Table of Contents

* [🚀 Live API](#-live-api)
* [📊 Database Schema](#-database-schema)
* [🛠️ Tech Stack](#️-tech-stack)
* [📦 Features](#-features)
* [📁 Project Structure](#-project-structure)
* [⚙️ Environment Variables](#️-environment-variables)
* [▶️ Installation & Run](#️-installation--run)
* [🔑 Authentication](#-authentication)
* [📌 API Overview](#-api-overview)

---

## 🚀 Live API

- **Base URL**  
  https://werentbackend.onrender.com/api

- **API Documentation (Swagger)**  
  https://werentbackend.onrender.com/api/docs

---

## 📊 Database Schema

* **ER Diagram (dbdiagram.io)**: [View ER Diagram](https://dbdiagram.io/d/WeRent-69e77629d80a958d1c9b73ee)

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
# ── Database Configuration ────────────────────────────────────
# Replace with your actual database connection string
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME?schema=public"

# ── Authentication ────────────────────────────────────────────
# A long, random string for JWT signing
JWT_SECRET="your_jwt_secret_here"
JWT_EXPIRES_IN="7d"

# ── Client Configuration ──────────────────────────────────────
FRONTEND_URL="http://localhost:3000"

# ── Supabase (File Storage/Auth) ─────────────────────────────
# Get these from your Supabase Project Settings > API
SUPABASE_URL="your_supabase_project_url"
SUPABASE_SERVICE_KEY="your_supabase_service_role_key"
SUPABASE_STORAGE_BUCKET="review-media"
```
---

## ▶️ Installation & Run

### Prerequisites
* Node.js (v18 or higher)
* npm or yarn
* PostgreSQL instance

### Setup Steps
```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Run migrations to create database tables
npx prisma migrate dev

# 4. (Optional) Seed the database with initial products
npx prisma db seed

# 5. Run development server
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

Ringkasan endpoint:

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | POST | `/auth/register` | Register a new user |
| | POST | `/auth/login` | Login and receive JWT |
| | GET | `/auth/me` | Get current user profile |
| | POST | `/auth/refresh` | Refresh access token |
| | POST | `/auth/logout` | Logout and revoke refresh token |
| **Products** | GET | `/products` | List all products (filter & search) |
| | GET | `/products/{id}` | Get product details |
| | GET | `/products/{id}/availability` | Check date & size availability |
| | GET | `/products/{id}/reviews/summary` | Get rating & fit scale summary |
| **Cart** | GET | `/cart` | Get current user's shopping cart |
| | POST | `/cart/items` | Add or increment item in cart |
| | PATCH | `/cart/items/{id}` | Update quantity or dates |
| | DELETE | `/cart/items/{id}` | Remove item from cart |
| **Orders** | POST | `/orders/checkout` | Finalize cart into an order |
| | GET | `/orders` | Get user order history |
| | GET | `/orders/{id}` | Get detailed order information |
| **Reviews** | GET | `/reviews/product/{pid}` | List reviews for a product |
| | POST | `/reviews/product/{pid}` | Create a new product review |
| | PATCH | `/reviews/{id}` | Edit own review |
| | DELETE | `/reviews/{id}` | Delete own review |
| | POST | `/reviews/{id}/helpful` | Toggle helpful status on a review |
| | GET | `/reviews/{id}/helpful` | Check if user liked a review |
| **Wishlist** | GET | `/wishlist` | Get user's saved wishlist |
| | POST | `/wishlist` | Add product to wishlist |
| | DELETE | `/wishlist/{pid}` | Remove product from wishlist |
| **Misc** | POST | `/upload/review-media` | Upload review images to Supabase |
| | GET | `/shipment/options` | Get shipping options by destination |
| | POST | `/shipment/estimate` | Estimate shipping cost |
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