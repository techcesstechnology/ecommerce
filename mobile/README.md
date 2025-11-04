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

Expo uses `EXPO_PUBLIC_` prefix for environment variables.

Set the API URL in your environment or create a `.env` file:

```bash
export EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

For production, update to your production API URL:
```bash
export EXPO_PUBLIC_API_URL=https://api.freshroute.zw/api
```

**Note:** On iOS simulator, use `http://localhost:5000/api`  
On Android emulator, use `http://10.0.2.2:5000/api` (Android emulator localhost)  
On physical device, use your computer's IP: `http://192.168.x.x:5000/api`

### Development

Start the Expo development server:

```bash
npm start
```

This opens Expo DevTools in your browser. From there:

- Press `i` to open iOS Simulator (macOS only)
- Press `a` to open Android Emulator
- Press `w` to open in web browser
- Scan QR code with **Expo Go** app on your physical device

**Development Features:**
- **Fast Refresh** - Instant updates without losing component state
- **Remote Debugging** - Debug with Chrome DevTools
- **Live Reload** - Automatic app reload on file changes
- **Error Overlay** - Clear error messages in the app

### Building

#### Development Build

For testing on physical devices without Expo Go:

```bash
# iOS (requires macOS)
npx expo run:ios

# Android
npx expo run:android
```

#### Production Build with EAS (Expo Application Services)

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure your project:**
   ```bash
   eas build:configure
   ```

4. **Build for iOS:**
   ```bash
   eas build --platform ios --profile production
   ```

5. **Build for Android:**
   ```bash
   eas build --platform android --profile production
   ```

### Publishing

#### Publish Updates (OTA - Over The Air)

For minor updates without rebuilding:

```bash
eas update --branch production
```

#### App Store Submission (iOS)

1. Build the app for iOS:
   ```bash
   eas build --platform ios --profile production
   ```

2. Download the `.ipa` file from EAS

3. Upload to App Store Connect using Xcode or Transporter

4. Fill in app metadata and submit for review

**Requirements:**
- Apple Developer Account ($99/year)
- App Store Connect account
- Privacy Policy URL
- App icons and screenshots

#### Google Play Store Submission (Android)

1. Build the app for Android:
   ```bash
   eas build --platform android --profile production
   ```

2. Download the `.aab` (Android App Bundle) file from EAS

3. Upload to Google Play Console

4. Fill in app metadata and submit for review

**Requirements:**
- Google Play Developer Account ($25 one-time fee)
- Google Play Console account
- Privacy Policy URL
- App icons and screenshots

### Configuration

#### App.json Configuration

Key configuration in `app.json`:

```json
{
  "expo": {
    "name": "FreshRoute",
    "slug": "freshroute",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "bundleIdentifier": "zw.freshroute.app",
      "buildNumber": "1"
    },
    "android": {
      "package": "zw.freshroute.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#00a651"
      }
    }
  }
}
```

## API Integration

### Making API Calls

Similar to the web app, use services for API calls:

```typescript
// src/services/api.ts
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
```

### Example Screen with API Call

```typescript
// src/screens/ProductsScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { productService } from '../services/product.service';
import { Product } from '@freshroute/shared';

export const ProductsScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Text>{item.name} - ${item.price}</Text>
          )}
        />
      )}
    </View>
  );
};
```

## Styling

React Native uses StyleSheet for styling:

```typescript
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00a651',
  },
});
```

## Testing on Physical Devices

### iOS (Expo Go)

1. Install **Expo Go** from the App Store
2. Run `npm start` on your computer
3. Scan the QR code with your iPhone camera
4. App opens in Expo Go

### Android (Expo Go)

1. Install **Expo Go** from Google Play Store
2. Run `npm start` on your computer
3. Scan the QR code with Expo Go app
4. App opens in Expo Go

### Testing on LAN

Ensure your mobile device and computer are on the same WiFi network. Expo will automatically detect and use your local IP address.

## Project Structure

```
mobile/
├── assets/              # Images, fonts, icons, and splash screens
│   ├── images/
│   ├── fonts/
│   └── icon.png
├── src/
│   ├── components/      # Reusable React Native components
│   │   ├── common/      # Common UI components (Button, Input, Card)
│   │   └── ...          # Feature-specific components
│   ├── navigation/      # Navigation configuration
│   │   ├── AppNavigator.tsx      # Main navigation stack
│   │   ├── AuthNavigator.tsx     # Authentication flow
│   │   └── TabNavigator.tsx      # Bottom tab navigation
│   ├── screens/         # Screen components (one per screen)
│   │   ├── HomeScreen.tsx
│   │   ├── ProductsScreen.tsx
│   │   ├── ProductDetailScreen.tsx
│   │   ├── CartScreen.tsx
│   │   └── ...
│   ├── services/        # API service layer
│   │   ├── api.ts       # Axios instance configuration
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   └── ...
│   ├── hooks/           # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   └── ...
│   └── utils/           # Utility functions
│       ├── formatters.ts
│       ├── validators.ts
│       └── ...
├── App.tsx              # Root component
├── app.json             # Expo configuration
├── babel.config.js      # Babel configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

### Screen Architecture

The mobile app follows a screen-based navigation architecture:

1. **Screens** - Full-screen components representing app screens
2. **Navigation** - React Navigation stack, tab, and drawer navigators
3. **Components** - Reusable UI components (similar to web components)
4. **Services** - API interaction layer (shared logic with web)
5. **Hooks** - Reusable stateful logic
6. **Utils** - Pure helper functions

### Navigation Structure

```
AppNavigator (Stack)
├── AuthNavigator (Stack)
│   ├── LoginScreen
│   └── RegisterScreen
└── MainNavigator (Tab)
    ├── HomeStack
    │   ├── HomeScreen
    │   └── ProductDetailScreen
    ├── ProductsStack
    │   ├── ProductsScreen
    │   └── ProductDetailScreen
    ├── CartStack
    │   └── CartScreen
    └── ProfileStack
        ├── ProfileScreen
        └── OrdersScreen
```

## Technologies

- **React Native** - Mobile framework
- **TypeScript** - Type safety
- **Expo** - Development platform
- **React Navigation** - Navigation library
- **Axios** - HTTP client
