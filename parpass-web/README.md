# ParPass Web

Next.js web application for the ParPass golf membership platform.

## Tech Stack

- **Framework**: Next.js 16
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Testing**: Jest, React Testing Library

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Project Structure

```
parpass-web/
├── app/                  # Next.js App Router
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   ├── globals.css       # Global styles (Tailwind)
│   ├── courses/          # Course pages
│   ├── favorites/        # Favorites page
│   └── history/          # Usage history page
├── components/           # React components
├── lib/                  # Utilities & API client
├── public/               # Static assets
└── __tests__/            # Test files
```

## Features

- **Course Discovery** - Browse and search courses
- **Course Details** - View course info, reviews, ratings
- **Favorites** - Save and manage favorite courses
- **Usage History** - Track check-ins and rounds used
- **Member Profile** - View membership details

## Tailwind CSS v4

This project uses Tailwind CSS v4 with the new import syntax:

```css
/* app/globals.css */
@import "tailwindcss";
```

Note: Do not use the v3 `@tailwind` directives.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

## Troubleshooting

### UI Not Rendering / Styles Missing

Clear the Next.js cache:

```bash
rm -rf .next
npm run dev
```

### Internal Server Error

If you see internal server errors, try:

1. Clear the cache: `rm -rf .next`
2. Kill any orphaned processes: `lsof -ti :3000 | xargs kill -9`
3. Restart: `npm run dev`
