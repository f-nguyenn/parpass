# ParPass Mobile

React Native mobile app for the ParPass golf membership platform, built with Expo.

## Tech Stack

- **Framework**: React Native 0.81
- **Platform**: Expo 54
- **Navigation**: Expo Router 6
- **Language**: TypeScript
- **Push Notifications**: Expo Notifications

## Quick Start

```bash
# Install dependencies
npm install

# Start Expo development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android
```

## Running on Device

1. Install **Expo Go** app on your phone
2. Run `npx expo start`
3. Scan the QR code with your phone

## Project Structure

```
parpass-mobile/
├── app/                  # Expo Router pages
│   ├── _layout.tsx       # Root layout
│   ├── index.tsx         # Login screen
│   ├── (tabs)/           # Tab navigation
│   │   ├── _layout.tsx   # Tab bar config
│   │   ├── index.tsx     # Home tab
│   │   ├── courses.tsx   # Courses tab
│   │   ├── history.tsx   # History tab
│   │   └── profile.tsx   # Profile tab
│   ├── course/           # Course detail pages
│   └── onboarding/       # Onboarding flow
│       ├── welcome.tsx
│       ├── skill-level.tsx
│       ├── goals.tsx
│       ├── preferences.tsx
│       ├── notifications.tsx
│       └── complete.tsx    # Cluster assignment reveal
├── components/           # Reusable components
├── lib/                  # Utilities
│   ├── api.ts            # API client
│   ├── AuthContext.tsx   # Auth state
│   └── notifications.ts  # Push notification helpers
└── assets/               # Images, fonts
```

## Features

### Authentication
- Login with ParPass member code
- Persistent session with AsyncStorage

### Core Features
- Browse participating golf courses
- View course details and reviews
- Check in at courses
- Track usage (rounds used/remaining)
- Save favorite courses

### Onboarding Survey
New members complete a survey capturing:
- Skill level (beginner, intermediate, advanced)
- Goals (improve skills, play new courses, etc.)
- Play frequency preferences
- Preferred tee times

### Push Notifications
- Register for push notifications
- Receive targeted notifications based on profile
- View notification history
- Mark notifications as read

### Personalized Recommendations
ML-powered features based on member clustering:

**Home Tab**
- Player Profile card showing assigned cluster (e.g., "Premium Seeker", "Course Explorer")
- "Recommended For You" horizontal carousel with personalized course suggestions
- Each recommendation includes a reason explaining why it matches the member's profile

**Courses Tab**
- "For You" section at the top with cluster-based recommendations
- Difficulty badges (easy, moderate, challenging, expert) with color coding
- Personalized recommendation reasons

**Onboarding Completion**
- After completing the onboarding survey, members see their assigned player profile
- Cluster-specific icon, color, and description
- Benefits overview for personalized recommendations

### Player Profile Clusters

| Cluster | Icon | Description |
|---------|------|-------------|
| Budget Conscious | 💰 | Values affordable options |
| Premium Seeker | 💎 | Appreciates quality experiences |
| Ambitious Improver | 📈 | Focused on getting better |
| Course Explorer | 🧭 | Loves variety and new experiences |
| Casual Social | 🤝 | Plays for fun and socializing |

## API Configuration

Update the API URL in `lib/api.ts`:

```typescript
const API_URL = 'http://YOUR_IP_ADDRESS:3001/api';
```

To find your IP address:
```bash
# macOS
ipconfig getifaddr en0

# Or use localhost for simulator
const API_URL = 'http://localhost:3001/api';
```

## Navigation

The app uses Expo Router with file-based routing:

| Route | Screen |
|-------|--------|
| `/` | Login |
| `/(tabs)` | Main tab navigator |
| `/(tabs)/` | Home |
| `/(tabs)/courses` | Course list |
| `/(tabs)/history` | Check-in history |
| `/(tabs)/profile` | Profile |
| `/course/[id]` | Course detail |
| `/onboarding/*` | Onboarding flow |
| `/onboarding/complete` | Cluster reveal |

## Push Notifications

### Registering for Notifications

```typescript
import { registerForPushNotifications } from './lib/notifications';

const token = await registerForPushNotifications();
// Save token to backend via preferences API
```

### Notification Permissions

The app requests notification permissions during onboarding. Users can enable/disable notifications in their profile settings.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo dev server |
| `npm run ios` | Start on iOS |
| `npm run android` | Start on Android |
| `npm run web` | Start on web |

## Troubleshooting

### Expo CLI Issues

```bash
# Clear Expo cache
rm -rf .expo
npx expo start -c
```

### Metro Bundler Issues

```bash
# Clear Metro cache
npx expo start --clear
```

### Dependency Conflicts

```bash
# Use legacy peer deps if needed
npm install --legacy-peer-deps
```

### Port Already in Use

```bash
# Kill process on port 8081
lsof -ti :8081 | xargs kill -9
```

## Building for Production

```bash
# Build for iOS
npx eas build --platform ios

# Build for Android
npx eas build --platform android
```

Note: Requires Expo EAS account and configuration.
