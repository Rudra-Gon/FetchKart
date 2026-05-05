# FetchKart E-Commerce Barebones Platform

This is a functional, barebones E-Commerce website built in a local XAMPP environment using pure PHP, HTML, and CSS. The site features a premium modern glassmorphism design.

## Features

- **Product Listing:** A clean layout for browsing items.
- **Cart System:** Add items to cart with PHP Session state tracking.
- **Cart Management:** View current total, quantities, and remove items.
- **Checkout:** Finalize order and simulate checkout success.

## Requirements

- **PHP** (Tested on version 7.x/8.x)
- **Local Server Environment:** XAMPP, WAMP, or similar (this was built on XAMPP).

## How to Run

1. Clone or copy this repository into your XAMPP `htdocs` directory (e.g., `c:\xampp\htdocs\Microtech_internship_ECOM`).
2. Open your XAMPP Control Panel and start the **Apache** server.
3. Open your web browser and navigate to `http://localhost/Microtech_internship_ECOM/index.php`.

## GitHub Instructions for Rudra-Gon

To push this repository to your GitHub account:

1. Open your terminal or Git Bash inside `c:\xampp\htdocs\Microtech_internship_ECOM`.
2. Initialize the local repository (if not already done):
   ```bash
   git init
   ```
3. Add all files to staging:
   ```bash
   git add .
   ```
4. Commit the changes:
   ```bash
   git commit -m "Initial commit: Added barebones E-commerce site with premium UI"
   ```
5. Create a new empty repository on your GitHub account (named e.g., `FetchCart` or `Microtech_internship_ECOM`).
6. Link your local repo to the GitHub repo:
   ```bash
   git remote add origin https://github./Rudra-Gon/YOUR_REPO_NAME.git
   ```
7. Push to the main branch:
   ```bash
   git branch -M main
   git push -u origin main
   ```
