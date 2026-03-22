# Event-Driven Notification System

A scalable event-driven notification system built with Node.js, Express, TypeScript, PostgreSQL, and Redis.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Cache/Queue**: Redis + BullMQ
- **Container**: Docker

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- Docker & Docker Compose

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Start development server:
```bash
pnpm dev
```

### Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors

## Project Structure

```
src/
├── api/          # API routes and controllers
├── services/     # Business logic
├── db/           # Database models and migrations
├── workers/      # Background job workers
├── config/       # Configuration files
└── app.ts        # Application entry point
```

## Development Phases

See `script.sh` for the complete development roadmap across 8 phases:
- Phase 0: Setup
- Phase 1: Core Event System
- Phase 2: Queue + Workers
- Phase 3: Caching
- Phase 4: Rate Limiting
- Phase 5: Load Testing
- Phase 6: Failure Handling
- Phase 7: Production Hardening

## License

ISC
