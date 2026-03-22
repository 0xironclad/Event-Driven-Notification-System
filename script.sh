#!/bin/bash

# ==============================
# CONFIG
# ==============================
REPO_URL="https://github.com/0xironclad/Event-Driven-Notification-System.git"

# ==============================
# LABELS (TAGS)
# ==============================
gh label create "phase-0" --repo $REPO_URL --color "0e8a16" 2>/dev/null
gh label create "phase-1" --repo $REPO_URL --color "1d76db" 2>/dev/null
gh label create "phase-2" --repo $REPO_URL --color "5319e7" 2>/dev/null
gh label create "phase-3" --repo $REPO_URL --color "fbca04" 2>/dev/null
gh label create "phase-4" --repo $REPO_URL --color "d93f0b" 2>/dev/null
gh label create "phase-5" --repo $REPO_URL --color "c5def5" 2>/dev/null
gh label create "phase-6" --repo $REPO_URL --color "b60205" 2>/dev/null
gh label create "phase-7" --repo $REPO_URL --color "5319e7" 2>/dev/null

gh label create "infra" --repo $REPO_URL --color "ededed" 2>/dev/null
gh label create "backend" --repo $REPO_URL --color "0052cc" 2>/dev/null
gh label create "system-design" --repo $REPO_URL --color "5319e7" 2>/dev/null
gh label create "performance" --repo $REPO_URL --color "fbca04" 2>/dev/null
gh label create "reliability" --repo $REPO_URL --color "d93f0b" 2>/dev/null

# ==============================
# PHASE 0: SETUP
# ==============================

gh issue create --repo $REPO_URL \
--title "Phase 0: Setup Node + Express project structure" \
--body "Initialize Node.js project with clean folder structure (api, services, db, workers, config). Prepare for scalability." \
--label "phase-0,backend"

gh issue create --repo $REPO_URL \
--title "Phase 0: Dockerize application (Node, Postgres, Redis)" \
--body "Set up docker-compose with services: app, postgres, redis. Ensure services communicate via internal network." \
--label "phase-0,infra"

gh issue create --repo $REPO_URL \
--title "Phase 0: Environment configuration setup" \
--body "Implement centralized config using .env and config loader. Avoid scattered process.env usage." \
--label "phase-0,backend"

gh issue create --repo $REPO_URL \
--title "Phase 0: Health check endpoint" \
--body "Implement /health endpoint. Later extend to check DB and Redis connectivity." \
--label "phase-0,backend"

gh issue create --repo $REPO_URL \
--title "Phase 0: Basic logging + error handling middleware" \
--body "Set up structured logging and global error handler middleware." \
--label "phase-0,backend"

# ==============================
# PHASE 1: CORE EVENT SYSTEM
# ==============================

gh issue create --repo $REPO_URL \
--title "Phase 1: Design database schema (events, notifications)" \
--body "Create tables for events and notifications. Include timestamps and indexes for future scalability." \
--label "phase-1,backend,system-design"

gh issue create --repo $REPO_URL \
--title "Phase 1: Implement POST /events endpoint" \
--body "Accept event payload and persist in DB. This is the entry point for the system." \
--label "phase-1,backend"

gh issue create --repo $REPO_URL \
--title "Phase 1: Synchronous event processing" \
--body "Process events immediately after insertion. Generate notifications directly (temporary approach before queues)." \
--label "phase-1,backend"

# ==============================
# PHASE 2: QUEUE + WORKERS
# ==============================

gh issue create --repo $REPO_URL \
--title "Phase 2: Integrate BullMQ queue" \
--body "Introduce queue system for async processing. API should enqueue jobs instead of processing directly." \
--label "phase-2,backend,system-design"

gh issue create --repo $REPO_URL \
--title "Phase 2: Implement worker service" \
--body "Create separate worker process to consume jobs and process events." \
--label "phase-2,backend"

gh issue create --repo $REPO_URL \
--title "Phase 2: Add retry logic for failed jobs" \
--body "Configure retry strategies and failure handling in queue jobs." \
--label "phase-2,reliability"

# ==============================
# PHASE 3: CACHING
# ==============================

gh issue create --repo $REPO_URL \
--title "Phase 3: Cache user notification preferences" \
--body "Use Redis to cache frequently accessed user preferences to reduce DB load." \
--label "phase-3,performance,system-design"

gh issue create --repo $REPO_URL \
--title "Phase 3: Cache recent notifications" \
--body "Cache recent notifications per user. Implement TTL and invalidation strategy." \
--label "phase-3,performance"

# ==============================
# PHASE 4: RATE LIMITING
# ==============================

gh issue create --repo $REPO_URL \
--title "Phase 4: Implement per-user rate limiting" \
--body "Prevent notification spam using Redis-based rate limiting (sliding window or token bucket)." \
--label "phase-4,system-design,reliability"

# ==============================
# PHASE 5: LOAD TESTING
# ==============================

gh issue create --repo $REPO_URL \
--title "Phase 5: Load testing with k6" \
--body "Simulate high traffic (1000 events/sec). Measure latency, queue lag, and throughput." \
--label "phase-5,performance"

gh issue create --repo $REPO_URL \
--title "Phase 5: Optimize DB queries and indexing" \
--body "Identify slow queries and optimize using indexes and query tuning." \
--label "phase-5,performance"

# ==============================
# PHASE 6: FAILURE HANDLING
# ==============================

gh issue create --repo $REPO_URL \
--title "Phase 6: Implement retries with exponential backoff" \
--body "Ensure failed jobs retry gracefully with backoff strategy." \
--label "phase-6,reliability"

gh issue create --repo $REPO_URL \
--title "Phase 6: Dead-letter queue implementation" \
--body "Capture failed jobs permanently for later inspection and debugging." \
--label "phase-6,reliability,system-design"

gh issue create --repo $REPO_URL \
--title "Phase 6: Simulate failures (Redis, DB, workers)" \
--body "Intentionally break components and observe system behavior. Improve resilience." \
--label "phase-6,reliability"

# ==============================
# PHASE 7: PRODUCTION HARDENING
# ==============================

gh issue create --repo $REPO_URL \
--title "Phase 7: Structured logging and monitoring" \
--body "Add structured logs and track metrics like queue size, failures, latency." \
--label "phase-7,reliability"

gh issue create --repo $REPO_URL \
--title "Phase 7: Dockerize workers separately" \
--body "Run API and workers as separate services. Simulate horizontal scaling." \
--label "phase-7,infra,system-design"

gh issue create --repo $REPO_URL \
--title "Phase 7: Config and environment hardening" \
--body "Improve config handling for different environments (dev, staging, prod)." \
--label "phase-7,infra"

echo "✅ All issues created successfully"