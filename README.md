# FreshRoute E-Commerce Platform

A modern, scalable e-commerce platform for fresh produce with separate backend API, web frontend, and mobile applications.

## Project Overview

FreshRoute is a full-stack e-commerce solution designed for fresh produce delivery. The platform consists of three main components:

- **Backend API**: RESTful API built with Express.js and Node.js
- **Web Frontend**: React-based web application
- **Mobile App**: React Native mobile application (iOS & Android)

## Project Structure

```
freshroute/
├── backend/            # Express.js API server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── app.js          # Express app setup
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
├── frontend/           # React web application
│   ├── public/
│   ├── src/
│   │   ├── assets/         # Static assets
│   │   ├── components/     # React components
│   │   ├── context/        # Context providers
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   ├── App.js
│   │   └── index.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
├── mobile/             # React Native mobile app
│   ├── src/
│   │   ├── assets/         # Mobile assets
│   │   ├── components/     # React Native components
│   │   ├── navigation/     # Navigation setup
│   │   ├── screens/        # Screen components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   ├── App.js
│   ├── app.json
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
└── README.md           # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (for backend)
- Expo CLI (for mobile development)

### Setup

Each component (backend, frontend, mobile) has its own setup instructions in their respective README files:

1. **Backend Setup**: See [backend/README.md](./backend/README.md)
2. **Frontend Setup**: See [frontend/README.md](./frontend/README.md)
3. **Mobile Setup**: See [mobile/README.md](./mobile/README.md)

### Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd freshroute
```

2. Set up the backend:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. Set up the frontend (in a new terminal):
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your configuration
npm start
```

4. Set up the mobile app (in a new terminal):
```bash
cd mobile
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

## Features

### Backend API
- RESTful API architecture
- Express.js framework
- Security middleware (Helmet, CORS, Rate Limiting)
- JWT authentication ready
- MongoDB integration ready
- Error handling and logging

### Web Frontend
- React 18
- React Router for navigation
- Redux Toolkit for state management
- Responsive design
- Form validation with Formik & Yup

### Mobile App
- React Native with Expo
- Cross-platform (iOS, Android, Web)
- React Navigation
- AsyncStorage for local data

## Technology Stack

### Backend
- Node.js
- Express.js
- MongoDB (ready for integration)
- JWT for authentication
- Helmet, CORS for security

### Frontend
- React 18
- React Router
- Redux Toolkit
- Axios
- Styled Components

### Mobile
- React Native
- Expo
- React Navigation
- AsyncStorage

## Development

### Running Tests

Backend:
```bash
cd backend && npm test
```

Frontend:
```bash
cd frontend && npm test
```

Mobile:
```bash
cd mobile && npm test
```

### Linting

Backend:
```bash
cd backend && npm run lint
```

Frontend:
```bash
cd frontend && npm run lint
```

Mobile:
```bash
cd mobile && npm run lint
```

## Contributing

Please read each component's README for specific contribution guidelines.

## License

ISC
