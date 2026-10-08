# 🍕 PIZZA HUB — Enterprise Full-Stack Pizza Ordering Platform

A complete, modern, aesthetic, and fully responsive commercial pizza restaurant ordering platform built with **Python + Django REST Framework** backend, **PostgreSQL/SQLite** database, and a high-performance **React + Vite** frontend.

---

## 🏗️ Architecture & Technology Stack

### Backend (Python & Django REST Framework)
- **Django 5.x & Django REST Framework (DRF)**
- **Relational Database:** SQLite (dev) / PostgreSQL (production-ready via `DATABASE_URL`)
- **Server-Side Financial & Business Logic:**
  - Strict price verification: prices submitted by client requests are ignored; item unit prices are queried directly from `ProductSizePrice` using `product_id` and `size_name`.
  - Server-calculated subtotals, delivery fees, minimum coupon thresholds, and percentage/fixed discounts.
  - Idempotency key tracking to eliminate accidental double-charges or duplicate order submissions.
  - 5-stage live status tracking with full order state audit trail (`OrderStatusHistory`).
  - Automated transactional email receipts (`django.core.mail`) and formatted WhatsApp customer/admin links.

### Frontend (React + Vite)
- **React 18** with functional components and hooks (`useState`, `useEffect`, `useContext`).
- **Vite 6** client build system with proxy to Django API.
- **Custom Design System:**
  - Modern aesthetic: Crimson Red (`#e11d48`), Deep Obsidian (`#09090b`), Gold/Orange accents (`#f59e0b`), and Crisp White.
  - Glassmorphic navigation, sticky header with dynamic scroll effects, animated floating pizza elements, and mobile drawer.
  - Lucide React icon suite.
  - Global shopping cart state with `localStorage` persistence and automatic synchronization with store settings.

---

## 🌟 Key Features

### 1. Customer-Facing Website
- **Sticky Header & Navigation:**
  - Brand logo routing to Home (`/`).
  - Active route indicators for `/`, `/menu`, `/offers`, `/about`, `/track-order`, `/contact`.
  - Search trigger opening real-time debounced search modal across menu items and ingredients.
  - Cart counter badge with live item count.
  - Mobile slide-out drawer with outside-click and ESC key closing.
- **Home Page (11 Rich Sections):**
  - Hero Section: Floating animated pizza, "Fresh Pizza, Fresh Moments", and 24 Hours Delivery Available badge.
  - Popular Pizzas with size-price selectors.
  - Special Offers with 1-click clipboard promo code copy.
  - Best Sellers & Chef's Recommendations.
  - Why Choose Pizza Hub (Fresh Dough, 100% Real Cheese, 30-Min Fast Delivery, Secret Sauce).
  - How It Works (Order Online -> Fresh Preparation -> Rapid Delivery).
  - Customer Reviews carousel + "Write a Review" submission form.
  - 24/7 Delivery spotlight banner with phone & WhatsApp actions.
  - Call to Action & Direct Helpline banner.
- **Menu System (`/menu`):**
  - Dynamic category filters (`Pizzas`, `Burgers`, `Sides & Appetizers`, `Drinks`, `Desserts`, `Deals`).
  - Search bar filtering products instantly.
  - Size pills (`Small`, `Medium`, `Large`, `Extra Large`) with instant price recalculation.
  - "Add to Cart" and "Buy Now" direct checkout flow.
- **Dedicated Product Details (`/menu/:slug`):**
  - High-res photography, detailed description, ingredient list, and allergen tags.
  - Size selection pill buttons updating price in real time.
  - Quantity stepper.
- **Offers & Coupons (`/offers`):**
  - Grid of available discount coupons (`PIZZAFIRST`, `HUB250`, `PARTY500`, `CHEESY15`).
  - Copy-to-clipboard button with visual feedback.
- **Shopping Cart (`/cart` & Slide-Over Drawer):**
  - Quantity increment/decrement, item removal, and subtotal calculation.
  - Dynamic delivery fee (waived if order exceeds free delivery threshold).
  - Promo code validation against backend `/api/coupons/validate/`.
- **Checkout (`/checkout`):**
  - Customer name, phone number, WhatsApp number (with 1-click "Same as Mobile" toggle), delivery address, and landmark.
  - Special kitchen instructions and order notes.
  - Payment method selection (Cash on Delivery, JazzCash / EasyPaisa, Credit / Debit Card).
  - Double-click prevention & UUID idempotency key.
- **Order Confirmation (`/order-confirmation/:id`):**
  - Celebratory confirmation screen with generated unique Order ID (e.g. `PH-20261007-XXXX`).
  - Order details recap, item breakdown, and delivery address.
  - Instant direct WhatsApp dispatch button and live "Track Order" button.
- **Live Order Tracking (`/track-order`):**
  - Lookup by Order ID or phone number.
  - 5-Stage visual progress timeline:
    1. *Order Received*
    2. *Order Confirmed*
    3. *Baking in Oven*
    4. *Out for Delivery*
    5. *Delivered*
- **Direct Contact & Floating WhatsApp:**
  - One-click phone dialer links.
  - Direct WhatsApp links with pre-filled message text.
  - Bottom-right floating animated WhatsApp quick-chat button.

---

### 2. Admin Dashboard & Operations Portal (`/admin`)
- **Staff Authentication (`/admin/login`):**
  - Secured staff login powered by Django user model.
  - Default credentials: `admin` / `admin123`.
- **Live KPI Dashboard:**
  - Total Orders count
  - Orders by status (Received, Confirmed, Baking, Out for Delivery, Delivered, Cancelled)
  - Gross sales revenue & today's sales revenue
- **Order Management & Kitchen Queue:**
  - Real-time order list with status badges.
  - Search by Order ID, customer name, or phone.
  - Filter by order status.
  - Order details modal showing customer contact, line items, sizes, prices, and special instructions.
  - One-click order status progression (Received -> Confirmed -> Preparing -> Out for Delivery -> Delivered).
  - **Printable Thermal/Slip Receipts:** Formatted printable order invoice for kitchen dispatchers and delivery riders.
- **Menu & Price Editor (CRUD):**
  - Add new products and update existing items.
  - Edit prices per size (`Small`, `Medium`, `Large`, `Extra Large`) without editing code!
  - Upload product images or assign image URLs.
- **Offers & Coupons Manager:**
  - Create promo codes with percentage or fixed discounts, minimum spend limits, and expiry dates.
  - Toggle coupon status or delete expired codes.
- **Customer Review Moderation:**
  - Approve or hide customer reviews.
- **Store Settings Management:**
  - Update restaurant name, phone helpline, WhatsApp number, email, address, delivery fee, free delivery threshold, and 24/7 delivery status.

---

## 📂 Project Directory Structure

```
C:\Users\User\Desktop\3287\
├── backend/                              # Django REST Framework Backend
│   ├── manage.py                         # Django CLI management script
│   ├── test_system.py                    # 11-step E2E verification test suite
│   ├── pizzahub.sqlite3                  # Seeded database with products, coupons, settings
│   ├── pizzahub_backend/                 # Project configuration
│   │   ├── settings.py                   # Apps, database, static & CORS settings
│   │   ├── urls.py                       # Root routes, API dispatch & React SPA serving
│   │   └── wsgi.py
│   └── api/                              # REST API Application
│       ├── models.py                     # Category, Product, SizePrice, Order, Coupon, Review
│       ├── serializers.py                # DRF Serializers with nested relationships
│       ├── views.py                      # ViewSets, Order recalculation, Tracking & Auth
│       ├── urls.py                       # API endpoints
│       └── management/commands/
│           └── seed_pizzahub.py          # Data seeder for demo menu & coupons
│
├── frontend/                             # React + Vite Frontend
│   ├── package.json
│   ├── vite.config.js                    # Vite configuration with /api proxy
│   ├── dist/                             # Compiled production bundle
│   └── src/
│       ├── main.jsx                      # React 18 root entry point
│       ├── App.jsx                       # Client-side router & layout controller
│       ├── context/
│       │   └── CartContext.jsx           # Global cart state, calculations & coupons
│       ├── styles/
│       │   └── index.css                 # Premium Pizza Hub dark theme stylesheet
│       ├── components/
│       │   ├── Header.jsx                # Responsive sticky header & mobile drawer
│       │   ├── Footer.jsx                # Responsive footer with contact info
│       │   ├── CartDrawer.jsx            # Slide-over cart preview drawer
│       │   ├── SearchModal.jsx           # Live search popup modal
│       │   └── FloatingWhatsApp.jsx      # Pulsing quick WhatsApp button
│       └── pages/
│           ├── HomePage.jsx              # 11-section home page
│           ├── MenuPage.jsx              # Categorized menu with live size pricing
│           ├── ProductDetailsPage.jsx    # /menu/:slug product page
│           ├── OffersPage.jsx            # Promo codes & deals
│           ├── CartPage.jsx              # Full shopping cart page
│           ├── CheckoutPage.jsx          # Checkout form with double-click guard
│           ├── OrderConfirmationPage.jsx # Order confirmed celebratory screen
│           ├── TrackOrderPage.jsx        # 5-stage animated tracking timeline
│           ├── AboutPage.jsx             # Story & heritage
│           ├── ContactPage.jsx           # Direct contact & feedback form
│           ├── PrivacyPolicyPage.jsx     # Privacy policy
│           ├── TermsPage.jsx             # Terms & conditions
│           ├── AdminLoginPage.jsx        # Staff login screen
│           └── AdminDashboardPage.jsx    # Real-time ops portal & kitchen queue
│
├── run_pizzahub.bat                      # One-click production server runner
├── start_dev.bat                         # One-click dev environment runner (Vite + Django)
└── README.md
```

---

## 🚀 Running the Project

### Option A: One-Click Production Server (Recommended)
Double-click `run_pizzahub.bat` or run in PowerShell:

```powershell
.\run_pizzahub.bat
```
This runs the Django backend on `http://127.0.0.1:8000`, which **automatically serves the full React frontend and the REST APIs simultaneously**!

### Option B: Full Development Environment (Hot Module Replacement)
Double-click `start_dev.bat` or run:

```powershell
.\start_dev.bat
```
This launches:
1. **Django REST API:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
2. **Vite React Dev Server (with HMR):** [http://localhost:5173](http://localhost:5173)

---

## 🔑 Default Credentials & Access URLs

- **Customer Website:** [http://127.0.0.1:8000](http://127.0.0.1:8000) (or `http://localhost:5173`)
- **Admin Operations Dashboard:** [http://127.0.0.1:8000/admin](http://127.0.0.1:8000/admin)
- **Django Superuser Admin:** [http://127.0.0.1:8000/django-admin](http://127.0.0.1:8000/django-admin)
- **Staff Username:** `admin`
- **Staff Password:** `admin123`

---

## 🧪 Automated Verification Suite

To verify all 11 backend subsystems, models, calculations, and static SPA serving:

```powershell
cd C:\Users\User\Desktop\3287\backend
python test_system.py
```

All 11 tests will execute and confirm:
- Root HTML SPA serving
- JS and CSS asset serving
- Category API
- Product API with size tiers
- Slug-based product lookup
- Active coupons listing
- Store settings configuration
- Staff authentication
- Coupon code calculation
- Server-side order total recalculation & idempotency
- 5-Stage order tracking & administrative status progression
