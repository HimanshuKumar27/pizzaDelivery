# 🍕 PizzaByte — Full-Stack Pizza Delivery Platform

A production-grade pizza ordering & inventory management platform with separate Admin and User roles, real-time order tracking, Razorpay payment integration, and automated stock notifications.

![Tech Stack](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=flat&logo=razorpay&logoColor=white)

---

## ✨ Features

### User Side
- ✅ User registration with welcome email
- ✅ JWT-based authentication
- ✅ Forgot password flow with email reset link
- ✅ Automated order confirmation email with full details
- ✅ Dashboard displaying order history and stats
- ✅ **Custom Pizza Builder** (4-step animated flow):
  - Step 1: Choose a pizza base (5 options)
  - Step 2: Choose a sauce (5 options)
  - Step 3: Choose a cheese type (3 options)
  - Step 4: Choose vegetables (6 options, multi-select)
- ✅ Order summary page with price breakdown
- ✅ Razorpay checkout integration (test mode)
- ✅ Real-time order status tracking via polling (10-second interval)

### Admin Side
- ✅ Separate admin login (not linked from user registration)
- ✅ Admin dashboard with overview stats
- ✅ Inventory management — view stock, manual update, add/delete items
- ✅ Stock auto-decremented after each order
- ✅ Automated low-stock email alerts via `node-cron` (every 30 minutes)
- ✅ Order management — view all orders, update status per order
- ✅ Status changes reflected in real-time on user dashboard via polling

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React.js + Vite                     |
| Backend    | Node.js + Express.js                |
| Database   | MongoDB Atlas                       |
| Payments   | Razorpay (test mode)                |
| Auth       | JWT (JSON Web Tokens) + bcrypt      |
| Email      | Nodemailer (Gmail / Ethereal)       |
| Scheduling | node-cron                           |
| Styling    | Vanilla CSS (dark theme, glassmorphism) |

---

## 📁 Project Structure

```
PizzaByte/
├── server/                    # Backend API
│   ├── config/db.js           # MongoDB connection
│   ├── controllers/           # Business logic
│   ├── middleware/auth.js     # JWT guards (user + admin)
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API route definitions
│   ├── utils/emailService.js  # Nodemailer setup
│   ├── jobs/inventoryCheck.js # Cron job for stock alerts
│   ├── scripts/seedAdmin.js   # DB seed script
│   └── server.js              # Entry point
├── client/                    # Frontend React app
│   └── src/
│       ├── context/           # Auth + Admin auth contexts
│       ├── components/        # Shared components
│       ├── pages/             # All pages (user + admin)
│       └── utils/             # API + Razorpay helpers
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** v18+ installed
- **npm** v9+ installed
- A **MongoDB Atlas** account (free tier works)
- A **Razorpay** account (for test mode keys)
- (Optional) A **Gmail** account with App Password for emails

---

### Step 1: Set Up MongoDB Atlas (Free Cluster)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Click **"Build a Database"** → Select **M0 Free Tier**
3. Choose a cloud provider & region (any is fine)
4. Create a **Database User**:
   - Username: `pizzaAdmin`
   - Password: choose a strong password (save it!)
5. Go to **Network Access** → Click **"Add IP Address"** → Select **"Allow Access from Anywhere"** (`0.0.0.0/0`)
6. Go to **Database** → Click **"Connect"** → Choose **"Connect your application"**
7. Copy the connection string. It looks like:
   ```
   mongodb+srv://pizzaAdmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
8. Replace `<password>` with your actual database user password
9. Add the database name to the URI:
   ```
   mongodb+srv://[EMAIL_ADDRESS]:[PASSWORD]@cluster0.xxxxx.mongodb.net/PizzaByte?retryWrites=true&w=majority
   ```

---

### Step 2: Get Razorpay Test Keys

1. Go to [https://dashboard.razorpay.com](https://dashboard.razorpay.com) and create a free account
2. After login, navigate to **Settings** → **API Keys**
3. Click **"Generate Test Key"**
4. Copy both:
   - **Key ID**: starts with `rzp_test_`
   - **Key Secret**: a long alphanumeric string
5. **Important**: Save both values — the Key Secret is only shown once!

> 💡 **Test Mode**: With test keys, you can simulate payments using the "Success" button in the Razorpay checkout dialog without real money.

---

### Step 3: Configure Environment Variables

1. Navigate to the server folder:
   ```bash
   cd server
   ```

2. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` with your actual values:
   ```env
   PORT=5000
   MONGO_URI=`[MONGODB_URI]`
   JWT_SECRET=your-super-secret-random-string
   JWT_EXPIRES_IN=7d

   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_gmail_app_password
   EMAIL_FROM=your_gmail@gmail.com
   ADMIN_EMAIL=your_gmail@gmail.com

   FRONTEND_URL=http://localhost:5173
   INVENTORY_THRESHOLD=20
   ```

> 💡 **Email Setup**: Supports Ethereal (fake SMTP), Gmail (using an App Password), or Resend (using Resend SMTP). See `server/utils/emailService.js` for details.

---

### Step 4: Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

---

### Step 5: Seed the Database

Run the seed script to create the default admin account and initial inventory:

```bash
cd server
npm run seed
```

This creates:
- **Admin Account**: `[EMAIL_ADDRESS]` / `[PASSWORD]`
- **19 inventory items**: 5 bases, 5 sauces, 3 cheeses, 6 vegetables (100 units each)

> ⚠️ **Change the admin password** after first login in production!

---

### Step 6: Run the Application

Open **two terminal windows**:

**Terminal 1 — Start Backend:**
```bash
cd server
npm run dev
```
Server will start on `http://localhost:5000`

**Terminal 2 — Start Frontend:**
```bash
cd client
npm run dev
```
Client will start on `http://localhost:5173`

---

## 📡 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint                 | Auth   | Description                |
|--------|--------------------------|--------|----------------------------|
| POST   | `/register`              | Public | Register new user          |
| POST   | `/login`                 | Public | Login, get JWT             |
| POST   | `/forgot-password`       | Public | Send password reset email  |
| POST   | `/reset-password/:token` | Public | Reset password             |
| GET    | `/me`                    | User   | Get current user profile   |

### Admin Auth (`/api/admin`)
| Method | Endpoint | Auth  | Description           |
|--------|----------|-------|-----------------------|
| POST   | `/login` | Public| Admin login            |
| GET    | `/me`    | Admin | Get admin profile      |

### Inventory (`/api/inventory`)
| Method | Endpoint             | Auth  | Description              |
|--------|----------------------|-------|--------------------------|
| GET    | `/`                  | Public| Get available items      |
| GET    | `/category/:category`| Public| Get items by category    |
| GET    | `/admin/all`         | Admin | Get all items with stats |
| POST   | `/`                  | Admin | Add new item             |
| PUT    | `/:id`               | Admin | Update item              |
| DELETE | `/:id`               | Admin | Delete item              |

### Orders (`/api/orders`)
| Method | Endpoint        | Auth  | Description              |
|--------|-----------------|-------|--------------------------|
| POST   | `/`             | User  | Create order             |
| GET    | `/my-orders`    | User  | Get user's orders        |
| GET    | `/:id`          | User  | Get single order         |
| GET    | `/admin/all`    | Admin | Get all orders           |
| PUT    | `/:id/status`   | Admin | Update order status      |

### Payment (`/api/payment`)
| Method | Endpoint        | Auth   | Description              |
|--------|-----------------|--------|--------------------------|
| GET    | `/key`          | Public | Get Razorpay key ID      |
| POST   | `/create-order` | User   | Create Razorpay order    |
| POST   | `/verify`       | User   | Verify payment signature |

---

## 🔄 Order Flow

1. **User builds pizza** → selects base, sauce, cheese, veggies
2. **Reviews order summary** → sees price breakdown
3. **Clicks "Pay with Razorpay"** → backend creates Razorpay order
4. **Razorpay checkout opens** → user clicks "Success" (test mode)
5. **Payment verified** → HMAC signature checked on backend
6. **Order created** → stock auto-decremented for each ingredient
7. **User sees order status** → polls every 10 seconds for updates
8. **Admin updates status** → `Order Received` → `In Kitchen` → `Sent to Delivery` → `Delivered`
9. **User sees update** → reflected in real-time via polling

---

## 📧 Email Notifications

| Email Type          | When Sent                           |
|---------------------|-------------------------------------|
| Welcome             | On user registration                |
| Order Confirmation  | On successful order placement       |
| Password Reset      | On forgot password request          |
| Low Stock Alert     | Every 30 min (if items below threshold) |

> Without real email credentials, the app uses **Ethereal** (fake SMTP). Check the server console for preview URLs to see the emails.

---

## 🧪 Testing Payment (Razorpay Test Mode)

When the Razorpay checkout modal opens in test mode:
1. Click **"Success"** to simulate a successful payment
2. Click **"Failure"** to simulate a failed payment
3. No real money is involved — it's all simulated!

---

## 📝 Author

Built with 🍕 and ❤️ by Himanshu Kumar
