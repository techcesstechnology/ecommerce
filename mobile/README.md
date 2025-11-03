# Mobile - FreshRoute Mobile Application

React Native mobile application for the FreshRoute e-commerce platform.

## Features

- React Native with TypeScript
- Expo for development and building
- React Navigation for navigation
- Axios for API calls

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
cd mobile
npm install
```

### Environment Variables

Set the API URL in your environment:

```bash
export EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

### Development

```bash
npm start
```

Then:

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser
- Scan QR code with Expo Go app on your phone

### Building

#### iOS

```bash
npm run ios
```

#### Android

```bash
npm run android
```

## Project Structure

```
mobile/
├── assets/           # Images, fonts, etc.
├── src/
│   ├── components/   # Reusable components
│   ├── navigation/   # Navigation configuration
│   ├── screens/      # Screen components
│   ├── services/     # API services
│   └── utils/        # Utility functions
├── App.tsx           # Root component
└── package.json
```

## Technologies

- **React Native** - Mobile framework
- **TypeScript** - Type safety
- **Expo** - Development platform
- **React Navigation** - Navigation library
- **Axios** - HTTP client
