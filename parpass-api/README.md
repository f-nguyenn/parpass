# ParPass API

Express.js REST API for the ParPass golf membership platform.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5
- **Database**: PostgreSQL 14+
- **Documentation**: Swagger/OpenAPI
- **Push Notifications**: Expo Server SDK
- **Testing**: Jest, Supertest

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Start the server
npm start

# Run tests
npm test
```

## Environment Variables

```
DATABASE_URL=postgresql://localhost:5432/parpass
PORT=3001
```

## API Documentation

Swagger UI is available at `http://localhost:3001/docs` when the server is running.

## Project Structure

```
parpass-api/
├── index.js              # Main application entry
├── db.js                 # Database connection
├── swagger.js            # Swagger configuration
├── seed.sql              # Initial database schema & data
├── migrations/           # Database migrations
│   ├── 001_add_reviews.sql
│   ├── 002_seed_reviews.sql
│   ├── 003_add_member_preferences.sql
│   ├── 004_add_notification_log.sql
│   ├── 005_add_member_notifications.sql
│   ├── 006_add_course_attributes.sql
│   ├── 007_add_member_skill_data.sql
│   ├── 008_seed_course_attributes.sql
│   ├── 009_seed_member_skill_data.sql
│   └── 010_seed_more_member_preferences.sql
├── services/
│   └── notifications.js  # Push notification service
└── __tests__/            # Test files
```

## Database Setup

```bash
# Create database
createdb parpass

# Run seed data
psql -d parpass -f seed.sql

# Run all migrations
for f in migrations/*.sql; do psql -d parpass -f "$f"; done
```

## API Endpoints

### Health Check
- `GET /` - API status

### Members
- `GET /api/members/:id` - Get member by ID
- `GET /api/members/code/:code` - Get member by ParPass code
- `GET /api/members/:id/usage` - Get usage statistics
- `GET /api/members/:id/favorites` - Get favorites
- `POST /api/members/:id/favorites` - Add favorite
- `DELETE /api/members/:id/favorites/:courseId` - Remove favorite
- `GET /api/members/:id/preferences` - Get preferences
- `PUT /api/members/:id/preferences` - Update preferences
- `GET /api/members/:id/notifications` - Get notification history
- `GET /api/members/:id/notifications/unread-count` - Get unread count

### Courses
- `GET /api/courses` - List courses (with filters)
- `GET /api/courses/:id` - Get course details
- `GET /api/courses/:id/reviews` - Get reviews
- `POST /api/courses/:id/reviews` - Submit review
- `POST /api/courses/:id/check-in` - Check in

### Notifications
- `POST /api/notifications/broadcast` - Send to all
- `POST /api/notifications/targeted` - Send by criteria
- `POST /api/notifications/member/:id` - Send to one member
- `GET /api/notifications/history` - View history
- `GET /api/notifications/stats` - Get statistics
- `POST /api/notifications/:id/read` - Mark as read

### Health Plans
- `GET /api/health-plans` - List health plans
- `GET /api/health-plans/:id` - Get health plan details

### Recommendations & Clustering
- `GET /api/members/:id/cluster` - Get member's cluster info
- `GET /api/members/:id/recommendations` - Basic recommendations
- `GET /api/members/:id/recommendations/cluster` - ML-powered recommendations
- `GET /api/members/:id/similar` - Find similar members
- `GET /api/clusters/stats` - Cluster statistics

## Notification Service

The notification service (`services/notifications.js`) provides:

```javascript
// Send to single member
await notifications.sendToMember(memberId, title, body, data);

// Send to all members
await notifications.sendToAllMembers(title, body, data);

// Send by criteria
await notifications.sendByCriteria({
  tier: 'premium',
  skillLevel: 'beginner',
  inactiveDays: 14
}, title, body, data);
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the server |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |

## Course Attributes

Courses now include detailed attributes for recommendations:

| Attribute | Description |
|-----------|-------------|
| `difficulty` | easy, moderate, challenging, expert |
| `course_type` | public, semi-private, resort, links, parkland, desert |
| `price_range` | budget, moderate, premium, luxury |
| `course_rating` | USGA course rating |
| `slope_rating` | USGA slope rating (55-155) |
| `has_driving_range` | Practice facilities |
| `has_restaurant` | Dining on-site |
| `walking_friendly` | Suitable for walking |

## Member Clusters

Members are assigned to behavioral clusters:

| Cluster ID | Name | Description |
|------------|------|-------------|
| 0 | Budget Conscious | Values affordable options |
| 1 | Premium Seeker | Appreciates quality experiences |
| 2 | Ambitious Improver | Focused on getting better |
| 3 | Course Explorer | Loves variety |
| 4 | Casual Social | Plays for fun/social |
