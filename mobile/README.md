# FreshRoute Mobile

Mobile application for the FreshRoute e-commerce platform built with React Native and Expo.

## Features

- React Native with Expo
- React Navigation for routing
- Axios for API calls
- AsyncStorage for local data
- Formik & Yup for forms and validation
- Cross-platform (iOS, Android, Web)
- Modern UI components

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` file with your configuration

### Running the Application

Start the development server:
```bash
npm start
```

Run on Android:
```bash
npm run android
```

Run on iOS:
```bash
npm run ios
```

Run on Web:
```bash
npm run web
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

## Project Structure

```
mobile/
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable components
│   ├── navigation/     # Navigation configuration
│   ├── screens/        # Screen components
│   ├── services/       # API services
│   └── utils/          # Utility functions
├── App.js              # Main App component
├── app.json            # Expo configuration
├── babel.config.js     # Babel configuration
├── .env.example        # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Building for Production

### Android

```bash
expo build:android
```

### iOS

```bash
expo build:ios
```

## Environment Variables

See `.env.example` for all available configuration options.

## Platform Support

- iOS 13+
- Android 5.0+ (API 21+)
- Web (modern browsers)

## Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)

## License

ISC
