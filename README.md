# FetchKart — Multi-Vendor E-Commerce Platform

FetchKart is a modern multi-vendor e-commerce platform built for local deployment environments using WAMP/XAMPP. The project focuses on providing a complete online shopping ecosystem with dedicated customer and seller workflows, integrated payment processing, logistics tracking, and responsive UI design.

---

## Features

### Multi-Role System

#### Customer Features

- Browse and search products across multiple categories
- Add products to cart and manage orders
- Apply discount coupons during checkout
- Track order and delivery progress
- Razorpay and Cash on Delivery payment support

#### Seller Features

- Seller dashboard for inventory management
- Add, edit, and remove products
- Monitor incoming orders
- Configure warehouse and logistics preferences
- Manage storage and delivery options

---

## Checkout & Payments

- Multi-step checkout flow
- Razorpay integration for secure online payments
- UPI, card, net banking, and wallet support
- Cash on Delivery (COD)
- Automatic coupon and platform fee calculations

---

## Order Tracking System

### Intercity Logistics

- Shipment progress visualization
- Delivery stage indicators for long-distance orders

### Local Logistics

- Simulated map-based local delivery tracking
- Dynamic delivery progress updates

---

## User Experience & Interface

- Fully responsive layout
- Dark and light theme support
- Modern UI built with Vanilla CSS
- Clean typography and mobile-friendly design

---

## Technical Stack

| Technology   | Usage                       |
| ------------ | --------------------------- |
| HTML5        | Frontend structure          |
| CSS3         | Styling & responsiveness    |
| JavaScript   | Frontend functionality      |
| PHP          | Backend logic               |
| MySQL        | Database management         |
| Razorpay SDK | Payment gateway integration |

---

## Installation & Setup

### 1. Clone or Download the Project

Place the project folder inside your local server directory.

#### XAMPP

```bash
htdocs/
```

#### WAMP

```bash
www/
```

---

### 2. Create Database

Create a MySQL database named:

```sql
fetchkart
```

---

### 3. Configure Database Connection

Open:

```bash
api/db.php
```

Update the database credentials according to your local environment.

---

### 4. Run Database Migration

Start Apache and MySQL from XAMPP/WAMP and open:

```bash
http://localhost/Microtech_internship_ECOM/migrate.php
```

This will initialize the required database tables.

---

## Project Highlights

- Multi-vendor marketplace architecture
- Integrated payment gateway support
- Logistics simulation system
- Role-based access management
- Responsive and modern UI/UX
- Real-world ecommerce workflow implementation
- CAPTCHA and Two-Factor Authentication (2FA)

---

## Future Improvements

- Real-time order notifications
- Advanced analytics dashboard
- Product reviews and ratings
- Wishlist functionality
- AI-powered product recommendations

---

## Credits

**Rudra Sagar Gondhalekar**  
CE4A — 2401225010053

Developed as part of an internship-focused e-commerce platform project.
