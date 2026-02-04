# ParPass

A golf membership platform that connects health plan members with participating golf courses. Members can discover courses, check in for rounds, track their usage, and receive personalized recommendations.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   parpass-web   │────▶│   parpass-api   │────▶│   PostgreSQL    │
│   (Next.js 16)  │     │   (Express 5)   │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
┌─────────────────┐            │
│ parpass-mobile  │────────────┘
│ (React Native)  │
└─────────────────┘
                               │
┌─────────────────┐            │
│  parpass-data   │────────────┘
│    (Python)     │
└─────────────────┘
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Web App** | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| **Mobile App** | React Native, Expo 54, Expo Router |
| **API** | Express.js 5, Node.js |
| **Database** | PostgreSQL |
| **ML/Analytics** | Python, scikit-learn, pandas |
| **Push Notifications** | Expo Push Service |

## Project Structure

```
parpass/
├── parpass-web/          # Next.js web application
├── parpass-api/          # Express.js REST API
├── parpass-mobile/       # React Native mobile app (Expo)
└── parpass-data/         # Python ML models & analytics
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Python 3.9+ (for ML features)
- Expo CLI (for mobile development)

### 1. Database Setup

```bash
# Create database
createdb parpass

# Run seed data (from parpass-api)
cd parpass-api
psql -d parpass -f seed.sql

# Run migrations
psql -d parpass -f migrations/001_add_reviews.sql
psql -d parpass -f migrations/002_seed_reviews.sql
psql -d parpass -f migrations/003_add_member_preferences.sql
psql -d parpass -f migrations/004_add_notification_log.sql
psql -d parpass -f migrations/005_add_member_notifications.sql
```

### 2. Start the API

```bash
cd parpass-api
npm install
npm start
# API runs on http://localhost:3001
# Swagger docs at http://localhost:3001/docs
```

### 3. Start the Web App

```bash
cd parpass-web
npm install
npm run dev
# Web app runs on http://localhost:3000
```

### 4. Start the Mobile App

```bash
cd parpass-mobile
npm install
npx expo start
# Scan QR code with Expo Go app
```

## Features

### Member Features
- **Course Discovery** - Browse participating golf courses
- **Check-in System** - Check in at courses using member code
- **Usage Tracking** - Track rounds used vs. available
- **Favorites** - Save favorite courses
- **Reviews & Ratings** - Rate and review courses
- **Personalized Recommendations** - ML-powered course suggestions

### Mobile-Specific Features
- **Onboarding Survey** - Capture skill level, goals, preferences
- **Push Notifications** - Event-driven notifications
- **Offline Support** - View saved data offline

### Admin Features
- **Push Notifications**
  - Broadcast to all members
  - Targeted notifications by criteria (tier, skill level, activity)
  - Individual member notifications
  - Notification history & analytics

## API Endpoints

### Members
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/members/:id` | Get member details |
| GET | `/api/members/code/:code` | Look up member by ParPass code |
| GET | `/api/members/:id/usage` | Get member's round usage |
| GET | `/api/members/:id/preferences` | Get member preferences |
| PUT | `/api/members/:id/preferences` | Update member preferences |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | List all courses |
| GET | `/api/courses/:id` | Get course details |
| GET | `/api/courses/:id/reviews` | Get course reviews |
| POST | `/api/courses/:id/reviews` | Submit a review |
| POST | `/api/courses/:id/check-in` | Check in at a course |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notifications/broadcast` | Send to all members |
| POST | `/api/notifications/targeted` | Send by criteria |
| POST | `/api/notifications/member/:id` | Send to specific member |
| GET | `/api/notifications/history` | View sent notifications |
| GET | `/api/notifications/stats` | Get notification statistics |
| GET | `/api/members/:id/notifications` | Get member's notifications |

### Favorites
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/members/:id/favorites` | Get member's favorites |
| POST | `/api/members/:id/favorites` | Add favorite |
| DELETE | `/api/members/:id/favorites/:courseId` | Remove favorite |

## Database Schema

### Core Tables
- `health_plans` - Insurance/health plan partners
- `plan_tiers` - Membership tiers (core, premium)
- `members` - Member accounts
- `golf_courses` - Participating courses
- `golf_utilization` - Check-in history

### Feature Tables
- `favorites` - Member's saved courses
- `reviews` - Course reviews and ratings
- `member_preferences` - Survey data, push tokens
- `notification_log` - System notification history
- `member_notifications` - Per-member notification tracking

## Environment Variables

### parpass-api/.env
```
DATABASE_URL=postgresql://localhost:5432/parpass
PORT=3001
```

### parpass-web/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Testing

```bash
# API tests
cd parpass-api
npm test

# Web tests
cd parpass-web
npm test

# With coverage
npm run test:coverage
```

## Development Cheat Sheet

```bash
# Start everything
cd parpass-api && npm start &    # API on :3001
cd parpass-web && npm run dev &  # Web on :3000
cd parpass-mobile && npx expo start  # Mobile

# Database
psql -d parpass                  # Connect to database
\dt                              # List tables
\d tablename                     # Describe table

# Kill processes
lsof -ti :3001 | xargs kill -9   # Kill API
lsof -ti :3000 | xargs kill -9   # Kill Web

# Clear caches
rm -rf parpass-web/.next         # Clear Next.js cache
rm -rf parpass-mobile/.expo      # Clear Expo cache
```

## Push Notification Targeting

When sending targeted notifications, you can filter by:

| Criteria | Description | Example |
|----------|-------------|---------|
| `tier` | Membership tier | `"premium"` |
| `skillLevel` | Player skill | `"beginner"` |
| `playFrequency` | How often they play | `"weekly"` |
| `inactiveDays` | No rounds in X days | `14` |
| `activeDays` | Played within X days | `7` |
| `hasRoundsRemaining` | Has rounds left | `true` |
| `goals` | Matches any goal | `["improve_skills"]` |

Example:
```bash
curl -X POST http://localhost:3001/api/notifications/targeted \
  -H "Content-Type: application/json" \
  -d '{
    "title": "We miss you!",
    "body": "Come back and play",
    "criteria": {"inactiveDays": 14, "tier": "premium"}
  }'
```

## License

Private - All rights reserved
