# FetchKart - Multi-Vendor E-commerce Platform

FetchKart is a functional e-commerce application supporting multi-vendor roles, payment integrations, and order tracking. It is designed for a local development environment using WAMP/XAMPP.

## Key Features

### User Roles
- **Customer**: Product browsing, coupon application, and order tracking.
- **Seller**: Inventory management (add/delete), order monitoring, and logistics configuration.

### Checkout & Payments
- **Multi-Step Checkout**: Optimized flow for order placement.
- **Payment Integration**: Supports Razorpay (test mode), UPI QR (static simulation), and Cash on Delivery.
- **Order Processing**: Automated calculation of platform fees and coupon discounts.

### Order Tracking
- **Intercity Logistics**: Visual progress indicator for long-distance shipments.
- **Local Logistics**: Map-based simulation for local delivery tracking.

### Seller Management
- **Dashboard**: Centralized control for product listings and order receipts.
- **Preferences**: Configuration for warehouse management, delivery methods, and storage types.

### Interface
- **Theme Management**: Integrated dark and light mode toggle.
- **Design**: Responsive layout using Vanilla CSS and Outfit typography.

## Technical Stack
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: PHP
- **Database**: MySQL
- **Integrations**: Razorpay SDK

## Installation

1. **Deployment**:
   Place the project directory in the `www` or `htdocs` folder of your local server.

2. **Database Configuration**:
   - Create a MySQL database named `fetchkart`.
   - Update `api/db.php` with local database credentials.
   - Run the migration script by navigating to:
     `http://localhost/Microtech_internship_ECOM/migrate.php`

## Credits
Rudra Sagar Gondhalekar — 2401225010053 — CE4A
