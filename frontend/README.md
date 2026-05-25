# CashTrack — React Native / Expo Frontend

Mobile expense tracker app built with React Native and Expo.

## Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18+ installed
- [Expo Go](https://expo.dev/client) app on your phone (for quick testing)
- Android Studio (for emulator/APK builds) or Xcode (for iOS simulator)

### 2. Configure API URL

Edit `src/utils/constants.js` and set the `API_URL`:

```javascript
// For Android Emulator (default):
export const API_URL = 'http://10.0.2.2:5000/api';

// For physical device on same Wi-Fi (replace with your PC's IP):
export const API_URL = 'http://192.168.X.X:5000/api';

// For iOS Simulator:
export const API_URL = 'http://localhost:5000/api';
```

To find your PC's IP address:
```bash
# Windows
ipconfig
# Look for "IPv4 Address" under your Wi-Fi adapter
```

### 3. Install & Run

```bash
# Install dependencies (already done during build)
npm install

# Start Expo development server
npx expo start
```

Then:
- **Phone**: Scan the QR code with Expo Go app
- **Android Emulator**: Press `a` in the terminal
- **iOS Simulator**: Press `i` in the terminal (macOS only)

---

## Building APK (Android)

### Option 1: Local Build (No Expo Account Needed)

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Create a development build profile in eas.json
# (This file may already exist — if not, run:)
npx eas build:configure

# Build APK locally (requires Android SDK)
npx expo run:android
```

### Option 2: EAS Build (Cloud — Requires Free Expo Account)

1. Create a free account at [expo.dev](https://expo.dev)
2. Login: `npx eas login`
3. Add to `eas.json`:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

4. Build APK:
```bash
npx eas build --platform android --profile preview
```

5. Download the APK from the link provided when build completes.

### Option 3: Expo Prebuild + Gradle (Full Local)

```bash
# Generate native Android project
npx expo prebuild --platform android

# Build debug APK
cd android
./gradlew assembleDebug

# APK will be at: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Project Structure

```
frontend/
├── App.js                          # Root entry point
├── app.json                        # Expo configuration
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── GlassCard.js           # Glassmorphism container
│   │   ├── StatCard.js            # Animated stat display
│   │   ├── ExpenseCard.js         # Expense list item
│   │   ├── CategorySelector.js    # Category grid picker
│   │   ├── ChartCard.js           # Chart wrapper
│   │   ├── FloatingActionButton.js# FAB component
│   │   ├── FilterBar.js           # Horizontal filter chips
│   │   ├── LoadingSkeleton.js     # Shimmer placeholder
│   │   ├── Toast.js               # Toast notification system
│   │   └── EmptyState.js          # No-data placeholder
│   ├── context/                    # State management
│   │   ├── AuthContext.js         # Auth state + actions
│   │   └── ExpenseContext.js      # Expense state + CRUD
│   ├── hooks/                      # Custom hooks
│   │   ├── useExpenses.js         # Expense operations
│   │   └── useAnalytics.js        # Analytics data
│   ├── navigation/                 # Navigation structure
│   │   ├── AppNavigator.js        # Root: Auth ↔ Main
│   │   ├── AuthStack.js           # Login/Register stack
│   │   └── MainTabs.js           # Bottom tabs + nested stacks
│   ├── screens/                    # Screen components
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── AddExpenseScreen.js
│   │   ├── AllExpensesScreen.js
│   │   ├── AddMissingEntryScreen.js
│   │   ├── EditExpenseScreen.js
│   │   ├── AnalyticsScreen.js
│   │   └── ProfileScreen.js
│   ├── services/                   # API layer
│   │   ├── api.js                 # Axios instance
│   │   ├── authService.js         # Auth API calls
│   │   └── expenseService.js      # Expense API calls
│   └── utils/                      # Utilities
│       ├── constants.js           # Categories, colors, config
│       └── helpers.js             # Formatters, validators
```

---

## Theme

- **Background**: `#0A0E27` (deep navy)
- **Cards**: `rgba(255,255,255,0.05)` with `rgba(255,255,255,0.1)` borders
- **Primary**: `#6C63FF` (vibrant purple)
- **Secondary**: `#00D9FF` (cyan)
- **Accent**: `#FF6B9D` (pink)
- **Charts**: Dark gradient backgrounds matching the theme
