# Frontend - FreshRoute Web Application

React web application for the FreshRoute e-commerce platform.

## Features

- React 18 with TypeScript
- Vite for fast development and building
- React Router for navigation
- Styled Components for styling
- Axios for API calls

## Getting Started

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### Development

```bash
npm run dev
```

The app will start on `http://localhost:3000`

### Production Build

```bash
npm run build
```

The build output will be in the `build/` directory.

## Project Structure

```
frontend/
├── public/           # Static assets
├── src/
│   ├── assets/       # Images, fonts, etc.
│   ├── components/   # Reusable components
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Page components
│   ├── services/     # API services
│   ├── styles/       # Global styles
│   ├── utils/        # Utility functions
│   ├── App.tsx       # Root component
│   └── main.tsx      # Application entry point
└── package.json
```

## Technologies

- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Styled Components** - CSS-in-JS
- **Axios** - HTTP client
