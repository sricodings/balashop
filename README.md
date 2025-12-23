# Striker Shop Management System

A high-professional, full-stack Inventory Management and Point of Sale (POS) system for "Striker" shoe shop.

## Tech Stack
- **Frontend**: React (Vite), Bootstrap, Chart.js
- **Backend**: Node.js, Express
- **Database**: MySQL

## Prerequisites
- Node.js installed
- MySQL Server installed and running

## Setup Instructions

### 1. Database Setup
1. Open `server/.env` and update the `DB_PASSWORD` with your MySQL root password.
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password_here
   DB_NAME=striker_shop
   ```
2. Initialize the database:
   ```bash
   cd server
   npm run db:init
   ```
   This will create the `striker_shop` database and all necessary tables.

### 2. Backend Server
Start the backend server:
```bash
cd server
npm start
```
The server will run on `http://localhost:3001`.

### 3. Frontend Application
Start the React frontend:
```bash
cd client
npm run dev
```
Open your browser to the URL shown (usually `http://localhost:5173`).

## Login Credentials
- **Username**: strikeradmin
- **Password**: bala

## Features
- **Dashboard**: Real-time analytics of Stock, Revenue, Profit, and Sales Trends.
- **Inventory**: Add, Edit, Delete products with detailed specs (Size, Color, Gender, Image, Location).
- **POS / Sales**: Add items to cart, handle checkout, and automatically update stock and calculate profit.
- **Charts**: Visual representation of sales and inventory distribution.
