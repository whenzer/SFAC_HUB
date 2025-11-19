# 🌌 SFAC_HUB



A modern, full-stack MERN application for SFAC (School of Future Academy of Cebu) that provides comprehensive stock management, reservation handling, user management, and a student lost & found posting system with premium UX/UI design.A full-stack MERN application for SFAC that provides stock management, reservation handling, and a student lost & found posting system.



------



## ✨ Features

- 📦 **Stock Management** — manage and track items in SFAC’s inventory

### 🎓 For Students & Teachers- 📝 **Reservation System** — students and staff can reserve items seamlessly

- 📦 **Stock Availability** — Browse and search available items across multiple categories- 🔍 **Lost & Found** — students can post and browse lost & found items

- 📝 **Reservation System** — Reserve items seamlessly with real-time availability tracking- 🔐 **User Authentication** — secure login & role-based access

- 🔍 **Lost & Found** — Post and browse lost & found items with image support- 🌐 **RESTful API (Express + MongoDB)** — backend handles stock, reservations, and posts

- 📊 **Personal Dashboard** — Track reservations, view popular items, and access quick actions- ⚡ **Frontend (React + Vite)** — fast, modern UI with responsive design

- 🎨 **Modern UI/UX** — Glassmorphism design with smooth animations and responsive layouts- 📊 **Real-time Updates** — reservations and inventory sync instantly

- 🚀 **Deployment Ready** — easily deployed via Vercel and Node servers

### 👨‍💼 For Staff

- 🎛️ **Staff Panel** — Dedicated control center for managing all reservations---

- ✅ **Reservation Management** — View, filter, search, and mark reservations as collected

- 📈 **Real-time Stats** — Dashboard showing total reservations, pending items, and collected items## 🛠️ Tech Stack

- 🔍 **Advanced Filtering** — Filter by status, sort by date/user/item, dual view modes (cards/table)- **MongoDB** — database

- 📋 **Detailed Views** — Comprehensive modal with user info, item details, and timeline- **Express.js** — backend framework

- **React** — frontend library

### 👑 For Administrators- **Node.js** — runtime

- 🛡️ **Admin Panel** — Complete user management and system administration- **TypeScript** — safer development

- 👥 **User Management** — View all users with verification status indicators- **CSS / Tailwind** — styling

- ✓ **User Verification** — Verify user emails and ID documents

- 🔐 **Security Controls** — Reset user passwords, delete accounts with confirmation---

- 🔍 **Advanced Search** — Filter by role, verification status, search by name/email

- 📊 **User Analytics** — Track verified, partially verified, and unverified users## 🎯 Roadmap

- ✅ Core stock + reservation system

### 🔐 Security & Authentication- ✅ Lost & found module

- 🔑 **JWT Authentication** — Secure token-based authentication with automatic refresh- ⏳ Admin dashboard for inventory analytics

- 🛡️ **Role-based Access Control** — Admin, Staff, Teacher, and Student roles- ⏳ Notification system for reservations

- 📧 **Email & ID Verification** — Two-factor verification system- ⏳ File upload support (lost item images)

- 🖼️ **Cloudinary Integration** — Secure image upload and storage for ID verification
- 🔒 **Protected Routes** — Middleware-based authentication for all sensitive endpoints

### ⚡ Technical Features
- 🌐 **RESTful API** — Clean, organized Express.js backend with MongoDB
- 🔄 **Real-time Updates** — Socket.io integration for live data synchronization
- 📱 **Responsive Design** — Mobile-first approach, works on all devices
- 🎭 **Modern CSS** — Glassmorphism, gradients, animations, and smooth transitions
- 🚀 **Performance Optimized** — Built-in performance monitoring and optimization
- 🌍 **Production Ready** — Deployed on Fly.io (backend) and Vercel (frontend)

---

## 🛠️ Tech Stack

### Backend
- **Node.js** — JavaScript runtime environment
- **Express.js** — Fast, unopinionated web framework
- **MongoDB** — NoSQL database with Mongoose ODM
- **Socket.io** — Real-time bidirectional communication
- **JWT** — JSON Web Tokens for authentication
- **bcrypt** — Password hashing and security
- **Cloudinary** — Cloud-based image management
- **CORS** — Cross-Origin Resource Sharing
- **Fly.io** — Backend deployment platform

### Frontend
- **React** — Component-based UI library
- **TypeScript** — Type-safe JavaScript
- **Vite** — Next-generation frontend build tool
- **React Router** — Client-side routing
- **Tailwind CSS** — Utility-first CSS framework
- **Custom CSS** — Glassmorphism and modern design patterns
- **Socket.io Client** — Real-time client integration
- **React Loading Indicators** — Elegant loading states
- **Vercel** — Frontend deployment platform

### Database Models
- **User Model** — Authentication, roles, verification, ID storage
- **Product Model** — Inventory items with categories and stock tracking
- **Reservation Model** — Booking system with status management
- **User Post Model** — Lost & found posts with images
- **User Token Model** — Refresh token management

---

## 📁 Project Structure

```
SFAC_HUB/
├── backend/
│   ├── config/
│   │   └── cloudinary.js         # Cloudinary configuration
│   ├── controllers/
│   │   ├── admin.controller.js   # Admin operations
│   │   ├── staff.controller.js   # Staff operations
│   │   ├── user.controller.js    # User authentication & profile
│   │   ├── product.controller.js # Product management
│   │   └── post.controller.js    # Lost & found posts
│   ├── middleware/
│   │   ├── auth.admin.js         # Admin authentication
│   │   ├── auth.staff.js         # Staff authentication
│   │   ├── auth.login.js         # Login middleware
│   │   └── auth.token.js         # Token verification
│   ├── models/
│   │   ├── user.model.js         # User schema
│   │   ├── product.model.js      # Product schema
│   │   ├── product.reservation.model.js  # Reservation schema
│   │   ├── user.post.model.js    # Post schema
│   │   └── user.token.model.js   # Token schema
│   ├── routes/
│   │   ├── admin.route.js        # Admin endpoints
│   │   ├── staff.route.js        # Staff endpoints
│   │   ├── user.route.js         # User endpoints
│   │   └── protected.route.js    # Protected endpoints
│   ├── server.js                 # Express server & Socket.io
│   ├── Dockerfile               # Container configuration
│   └── fly.toml                 # Fly.io deployment config
│
└── frontend/sfac-hub/
    ├── src/
    │   ├── components/
    │   │   ├── Header.tsx              # Reusable header with logout
    │   │   ├── Footer.tsx              # Reusable footer
    │   │   └── PerformanceDashboard.tsx # Performance monitoring
    │   ├── pages/
    │   │   ├── LandingPage.tsx         # Public landing page
    │   │   ├── Dashboard.tsx           # User dashboard
    │   │   ├── StockAvailability.tsx   # Browse items
    │   │   ├── MakeReservation.tsx     # Reserve items
    │   │   ├── Reservations.tsx        # User reservations
    │   │   ├── LostAndFound.tsx        # Lost & found
    │   │   ├── StaffPanel.tsx          # Staff control center
    │   │   ├── AdminPanel.tsx          # Admin control center
    │   │   ├── About.tsx               # About page
    │   │   └── login/
    │   │       ├── LoginLanding.tsx    # Login page
    │   │       └── RegistrationPage.tsx # Registration
    │   ├── utils/
    │   │   ├── apiService.ts           # API client with token refresh
    │   │   ├── ProtectedLayout.tsx     # Protected route wrapper
    │   │   ├── socket.ts               # Socket.io client
    │   │   ├── performanceMonitor.ts   # Performance tracking
    │   │   └── imageOptimization.ts    # Image optimization
    │   ├── App.tsx                     # Main app & routing
    │   └── main.tsx                    # React entry point
    ├── vite.config.ts               # Vite configuration
    ├── tailwind.config.js           # Tailwind configuration
    └── vercel.json                  # Vercel deployment config
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database
- Cloudinary account (for image uploads)

### Environment Variables

**Backend (.env)**
```env
PORT=5000
USERS_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/whenzer/SFAC_HUB.git
cd SFAC_HUB
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend/sfac-hub
npm install
```

4. **Start development servers**

Backend:
```bash
cd backend
npm start
```

Frontend:
```bash
cd frontend/sfac-hub
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 📊 API Endpoints

### Authentication
- `POST /api/user/register` — Register new user
- `POST /api/user/login` — User login
- `POST /api/user/logout` — User logout
- `POST /api/user/refresh` — Refresh access token

### Protected Routes
- `GET /protected/dashboard` — Get dashboard data
- `GET /protected/user` — Get user profile

### Staff Routes (Staff & Admin only)
- `GET /api/staff/reservations` — Get all reservations
- `PUT /api/staff/reservations/:id/collect` — Mark as collected

### Admin Routes (Admin only)
- `GET /api/admin/users` — Get all users
- `PUT /api/admin/users/verify/:userId` — Verify user
- `PUT /api/admin/users/reset-password/:userId` — Reset password
- `DELETE /api/admin/users/delete/:userId` — Delete user
- `POST /api/admin/createproduct` — Create new product

---

## 🎨 Design System

### Color Palette
- **Admin Panel**: Pink/Purple gradient (#f093fb → #f5576c)
- **Staff Panel**: Blue/Purple gradient (#667eea → #764ba2)
- **Success**: #10b981
- **Warning**: #f59e0b
- **Error**: #ef4444
- **Info**: #3b82f6

### UI Patterns
- **Glassmorphism**: Frosted glass effect with backdrop blur
- **Card-based Layout**: Elevated cards with hover animations
- **Gradient Backgrounds**: Dynamic multi-layer gradients
- **Smooth Transitions**: Cubic-bezier easing for all animations
- **Responsive Grid**: Auto-fit grid layouts for all screen sizes

---

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Access tokens (15min) + Refresh tokens (7 days)
- **Automatic Token Refresh**: Seamless token renewal
- **Role-based Middleware**: Endpoint protection by role
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Whitelisted origins only
- **Secure Image Upload**: Cloudinary with transformation

---

## 🌐 Deployment

### Backend (Fly.io)
```bash
cd backend
fly deploy
```

### Frontend (Vercel)
```bash
cd frontend/sfac-hub
vercel --prod
```

**Live URLs:**
- Frontend: https://sfac-hub-bq7y.vercel.app
- Backend: https://sfac-hub.fly.dev

---

## 📝 User Roles & Permissions

| Feature | Student | Teacher | Staff | Admin |
|---------|---------|---------|-------|-------|
| Browse Stock | ✅ | ✅ | ✅ | ✅ |
| Make Reservations | ✅ | ✅ | ✅ | ✅ |
| Lost & Found | ✅ | ✅ | ✅ | ✅ |
| View Reservations | Own | Own | All | All |
| Collect Items | ❌ | ❌ | ✅ | ✅ |
| Staff Panel | ❌ | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ❌ | ✅ |
| Create Products | ❌ | ❌ | ❌ | ✅ |
| Admin Panel | ❌ | ❌ | ❌ | ✅ |

---

## 🎯 Completed Features

- ✅ Full authentication system with JWT
- ✅ Role-based access control
- ✅ Stock management and browsing
- ✅ Reservation system with status tracking
- ✅ Lost & found module with image uploads
- ✅ Staff panel with reservation management
- ✅ Admin panel with user management
- ✅ Real-time updates with Socket.io
- ✅ Responsive design for all devices
- ✅ Performance monitoring dashboard
- ✅ Automatic token refresh
- ✅ Cloudinary image integration
- ✅ Production deployment (Fly.io + Vercel)

---

## 🚧 Future Enhancements

- 📧 Email notifications for reservations
- 📱 Push notifications for item availability
- 📊 Advanced analytics and reporting
- 📦 Bulk operations for admin
- 🔔 Real-time notification system
- 🌙 Dark mode toggle
- 📥 Export data to CSV/PDF
- 🔍 Advanced search with filters
- 🎫 QR code generation for reservations
- 📈 Inventory forecasting

---

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- SFAC (School of Future Academy of Cebu)
- React & Vite communities
- MongoDB & Express.js documentation
- Tailwind CSS team
- Cloudinary for image hosting

---

**Built with ❤️ for SFAC**
