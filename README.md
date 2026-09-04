# TijarahJo Frontend

React and TypeScript marketplace client for TijarahJo. It supports English and
Arabic layouts, authenticated listing management, category browsing, profiles,
favorites, image galleries, and seller contact details.

## Requirements

- Node.js 20 or newer
- npm
- The TijarahJo API running locally or at a configured URL

## Configuration

Create a local `.env` file when the API is not available at the default URL:

```env
VITE_API_BASE_URL=http://localhost:5033/api
```

Local environment files are ignored by Git. Do not commit credentials or
production secrets to the frontend.

## Development

```bash
npm ci
npm run dev
```

Vite serves the application on `http://localhost:5173` by default.

## Verification

```bash
npm run lint
npm run build
npm audit --audit-level=low
```

The production bundle is written to `dist/`, which is intentionally ignored.

## API integration

The client uses the live API implementation in `services/api.ts`. Authentication
tokens are stored in local storage and sent as bearer tokens. The backend remains
the authority for account status, roles, post ownership, moderation state, and
profile data.

Main API areas:

- `/auth` for login, registration, logout, and the current user
- `/users` for public seller profiles and authenticated profile updates
- `/posts` for listing reads and owner-managed mutations
- `/posts/{postId}/images` for authorized, post-scoped image management
- `/categories` and `/roles` for reference/admin operations

Mock data under `data/` is presentation fallback data; it is not the persistence
layer for authenticated operations.
