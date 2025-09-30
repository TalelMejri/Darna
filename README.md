# 🏠 DARNA - Student Housing Platform

![RentalApp](https://img.shields.io/badge/RentalApp-Student%20Housing-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6)
![Laravel](https://img.shields.io/badge/Laravel-10.0-ff2d20)

A modern web application designed to help students find rental properties near universities with intelligent route planning and real-time notifications.

## ✨ Features

### 🎯 Core Functionality
- **Smart Property Search** - Find properties based on university proximity
- **Interactive Maps** - Visualize properties and routes using Leaflet
- **Route Planning** - Calculate driving/walking routes from universities to properties
- **Real-time Notifications** - Stay updated with instant notifications
- **Favorites System** - Save and manage favorite properties
- **Messaging System** - Communicate with property owners
- **Reservation Management** - Book and manage property reservations

### 🗺️ Map & Routing Features
- **University-based Search** - Filter properties by distance from selected universities
- **Multi-mode Routing** - Driving and walking route calculations
- **Real Route Data** - Integration with OpenRouteService API
- **Interactive Markers** - Property and university locations with detailed popups
- **Radius Filtering** - Visual search radius around universities

### 👤 User Experience
- **Responsive Design** - Optimized for desktop and mobile devices
- **Modern UI/UX** - Clean interface with intuitive navigation
- **Role-based Access** - Separate interfaces for students and administrators
- **Real-time Updates** - Live notifications and status changes

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Leaflet** - Interactive maps
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client for API calls

### Backend
- **Laravel 10** - PHP framework for API
- **MySQL** - Database management
- **Sanctum** - API authentication
- **Eloquent ORM** - Database operations

### APIs & Services
- **OpenRouteService** - Route calculation and mapping
- **OSRM** - Fallback routing service
- **Custom REST API** - Backend communication

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- PHP 8.1+
- Composer
- MySQL 8.0+

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/rentalapp.git
cd rentalapp

cd backend
composer install
cp .env.example .env
php artisan key:generate

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rentalapp
DB_USERNAME=your_username
DB_PASSWORD=your_password

php artisan migrate --seed
php artisan serve

cd frontend
npm install
cp .env.example .env


VITE_API_URL=http://localhost:8000/api
VITE_OPENROUTE_SERVICE_API_KEY=your_openroute_api_key

npm run dev
