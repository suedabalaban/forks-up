# Forks Up 🍽️

Forks Up is a modern web application that enables users to discover, share, and receive personalized recipe recommendations. It enhances users' culinary experiences by providing customized recipe suggestions based on their dietary restrictions and preferences.

## 🚀 Features

- **User Management**
  - Google Sign-in
  - Password reset and account recovery
  - User profile management

- **Recipe Management**
  - Recipe search and filtering
  - Detailed recipe viewing
  - Save favorite recipes
  - Recipe sharing

- **Personalization**
  - Set dietary restrictions and preferences
  - Personalized recipe recommendations
  - Pantry management

- **Search and Filtering**
  - Advanced recipe search
  - Tag-based filtering
  - Ingredient-based search

## 🛠️ Technology Stack

### Backend
- Java Spring Boot 3.3.4
- MongoDB
- Firebase Authentication
- RESTful API
- Spring Security

### Frontend
- React with TypeScript
- Firebase Integration
- Responsive design

## 🏗️ Project Structure

```
forks-up/
├── backend/                 # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com.example.forksup/
│   │   │   │       ├── config/         # Application configurations
│   │   │   │       ├── controller/     # REST endpoints
│   │   │   │       ├── model/          # Data models
│   │   │   │       ├── repository/     # MongoDB repositories
│   │   │   │       └── service/        # Business logic services
│   │   └── test/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── api/           # Backend API integration
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── model/        # TypeScript models
│   │   └── layout/       # Page layouts
└── db/                    # Database configuration
```

## 🚦 Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- MongoDB
- Firebase account and configuration

### Running Backend
```bash
cd backend
./gradlew bootRun
```

### Running Frontend
```bash
cd frontend
npm install
npm start
```

## 🔒 Security

- Secure user management with Firebase Authentication
- API security with Spring Security
- CORS configuration
