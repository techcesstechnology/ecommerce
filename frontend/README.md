# FreshRoute Frontend

Frontend web application for the FreshRoute e-commerce platform built with React.

## Features

- React 18
- React Router for navigation
- Redux Toolkit for state management
- Axios for API calls
- React Query for data fetching
- Styled Components for styling
- Formik & Yup for forms and validation
- React Toastify for notifications
- Responsive design

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Edit `.env.local` file with your configuration

### Running the Application

Development mode:
```bash
npm start
```

Build for production:
```bash
npm run build
```

### Testing

Run tests:
```bash
npm test
```

### Linting

Run linter:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

## Project Structure

```
frontend/
├── public/             # Static files
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable components
│   ├── context/        # React Context providers
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   ├── App.js          # Main App component
│   ├── index.js        # Entry point
│   └── index.css       # Global styles
├── .env.example        # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run lint` - Runs ESLint
- `npm run format` - Formats code with Prettier

## Environment Variables

See `.env.example` for all available configuration options.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

ISC
