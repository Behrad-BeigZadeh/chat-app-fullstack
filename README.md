# 💬 Fullstack Chat App

A modern, real-time chat application built with the **MERN** stack, **Prisma**, and **PostgreSQL**. Designed with scalability, performance, and clean architecture in mind. 🌐

---

## ✨ Features

- 🔐 User Authentication (JWT + Cookie-based)
- 💬 Real-time Messaging using Socket.IO
- 🗂️ Chatroom support (1-on-1 and group ready structure)
- 📦 Backend powered by **Express**, **Prisma**, and **PostgreSQL**
- ⚛️ Frontend built with **React**, **Zustand**, and **React Query**
- 🌈 Different themes using Daisy Ui
- ☁️ Cloudinary support for image upload (optional feature)
- 🔒 Secure password hashing with bcrypt
- 🧼 Clean and modular codebase

---

## 📸 Screenshots

### 🖥️ Chat Interface

![Chat UI](./assets/chat.png)
![Chat UI](./assets/chatpage.png)

### 🔐 Login Page

![Login](./assets/signin.png)



---

## 🛠️ Tech Stack

### 🔙 Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL (via Neon)
- Socket.IO
- JWT Auth
- Cloudinary (optional image storage)

### 🔜 Frontend

- React
- React Query
- Zustand (global state)
- TailwindCSS
- Axios

---

## 🚀 Getting Started

### 🧰 Backend

1. Go to the `backend/` folder
2. Install dependencies:
   ```bash
   npm install

  ### 🧰 Frontend

1. Go to the `frontend/` folder
2. Install dependencies:
   ```bash
   npm install

 ### Set up environment variables

 - DATABASE_URL=your_postgresql_url
 - JWT_SECRET=your_jwt_secret
 - CLOUDINARY_CLOUD_NAME=your_cloud_name
 - CLOUDINARY_API_KEY=your_api_key
 - CLOUDINARY_API_SECRET=your_api_secret

 ### Run database migrations using Prisma
    npx prisma migrate dev


    

