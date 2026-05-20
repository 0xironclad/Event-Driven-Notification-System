# Phases 3 & 4 — Recent Notifications Cache + Per-User Rate Limiting

**Date:** 2026-05-20
**Issues:** [#13](https://github.com/0xironclad/ED-Notif-Sys/issues/13), [#14](https://github.com/0xironclad/ED-Notif-Sys/issues/14)
**Status:** Approved, ready for planning

## Summary

Two related additions to the notification system:

1. **Phase 3 — Recent notifications cache:** Add a public `GET /api/notifications` endpoint that returns a user's recent notifications, served from a Redis cache with TTL and invalidate-on-write semantics.
2. **Phase 4 — Rate limiting:** Add per-user sliding-window rate limiting to `POST /api/events` to prevent ingestion floods.

Both reuse the existing Redis client (`src/cache/redisClient.ts`) and follow the conventions already established by `src/cache/userPreferencesCache.ts`.

## Phase 3 — Recent Notifications Cache

### Endpoint

`GET /api/notifications?userId=<uuid>&limit=<n>`

- `userId` — required, UUID format. 400 if missing/invalid.
- `limit` — optional, default `20`, max `100`. 400 if out of range.
- Response: `200 { notifications: Notification[] }`, newest first.

### Read flow

1. Controller calls `notificationsCache.getRecent(userId)`.
2. **Hit** → slice to requested `limit`, return.
3. **Miss** → `NotificationService.getRecentNotifications(userId, 100)` from Postgres, write to cache via `setRecent()`, slice to `limit`, return.

### Cache shape

- **Key:** `notifications:recent:{userId}`
- **Value:** JSON array of up to 100 notification rows, newest first.
- **TTL:** `NOTIFICATIONS_CACHE_TTL_SECONDS` (default `300` / 5 min).
- The `limit` query param does not key the cache — we always cache 100 and slice on read. Prevents cache fragmentation.

### Invalidation

After `NotificationService.createNotification()` in `eventWorker.ts`, call `notificationsCache.invalidate(userId)`. Next read repopulates from DB.

### Failure mode

All Redis ops wrapped in try/catch. On error: log and return `null` (read path) or no-op (write/invalidate). DB serves as the fallback. Cache outage never breaks the API. Mirrors `userPreferencesCache.ts`.

### Files touched

| File | Change |
|---|---|
| `src/cache/notificationsCache.ts` | **new** — `getRecent / setRecent / invalidate` |
| `src/services/notification.service.ts` | add `getRecentNotifications(userId, limit)` |
| `src/api/controllers/notification.controller.ts` | **new** — validate query, orchestrate cache + service |
| `src/api/routes/notification.routes.ts` | **new** — `GET /` |
| `src/api/routes/index.ts` | mount `/api/notifications` |
| `src/workers/eventWorker.ts` | call `notificationsCache.invalidate(userId)` after `createNotification` |
| `src/config/env.ts` | add `NOTIFICATIONS_CACHE_TTL_SECONDS` (default 300) |
| `.env.example` | document new var |

## Phase 4 — Per-User Rate Limiting on POST /api/events

### Algorithm

Sliding window via Redis sorted set.

### Identifier

`userId` from request body. If missing or not a string, fall back to `req.ip`. Key: `ratelimit:events:{identifier}`.

### Limits (env-configurable)

| Var | Default | Meaning |
|---|---|---|
| `RATE_LIMIT_MAX` | `60` | Max requests per window |
| `RATE_LIMIT_WINDOW_SECONDS` | `60` | Window size |

So: 60 events/minute/user by default.

### Middleware flow (`src/middleware/rateLimiter.ts`)

1. Resolve identifier (`userId` from body, else `req.ip`).
2. `now = Date.now()`, `windowStart = now - WINDOW * 1000`.
3. Redis pipeline (atomic per key):
   - `ZREMRANGEBYSCORE key 0 windowStart` — evict expired
   - `ZCARD key` — count remaining
   - `ZADD key now "${now}-${randomBytes(4).toString('hex')}"` — record this request (unique member avoids ZADD collisions on same-ms requests)
   - `EXPIRE key WINDOW` — TTL so idle keys clean up
4. If `ZCARD` ≥ `RATE_LIMIT_MAX`:
   - Compute `retryAfter` = seconds until the oldest in-window entry expires (`ZRANGE key 0 0 WITHSCORES`).
   - Respond **429**:
     - Header: `Retry-After: <seconds>`
     - Body: `{ error: "Rate limit exceeded", retryAfter, limit, window }`
5. Otherwise `next()`.

### Failure mode

If Redis is unreachable, **fail-open**: log the error and call `next()`. A Redis outage must not take down event ingestion. Document this choice in code comments.

### Wiring

Attach middleware **only** to `POST /api/events` in `event.routes.ts`. Health, preferences, notifications routes are unaffected.

### Out of scope (explicit YAGNI)

- No per-event-type limits.
- No tiered limits (free vs. paid).
- No admin bypass header.
- No worker-side notification cap (Phase 6 territory).

### Files touched

| File | Change |
|---|---|
| `src/middleware/rateLimiter.ts` | **new** — sliding-window middleware |
| `src/api/routes/event.routes.ts` | attach middleware to POST |
| `src/config/env.ts` | add `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_SECONDS` |
| `.env.example` | document new vars |

## Testing Approach

No formal test suite exists yet (planned later phase). Manual verification:

**Phase 3:**
- POST an event for a user → wait for worker → `GET /api/notifications?userId=...` returns it.
- Second GET shows cache-hit log line; DB query log absent.
- POST another event → cache-invalidated log line; next GET shows miss then refill.
- TTL: wait 5 min → next GET is a miss.

**Phase 4:**
- Loop POST /api/events 70 times for same userId in < 1 min → first 60 return 201, rest return 429 with `Retry-After`.
- Wait window + 1s → next POST succeeds.
- Stop Redis → POST still succeeds (fail-open), error logged.

## Non-Goals

- Authentication/authorization on the new endpoint. `userId` is trusted from the query string for now, consistent with how `POST /api/events` trusts `userId` from the body. Auth is a separate concern.
- Pagination beyond `limit` (no cursor, no offset). Phase 3 is "recent", not "browse all".
- Metrics/Prometheus instrumentation — covered by Phase 7 (#20).
