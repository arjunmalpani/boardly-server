# Boardly — Server

Lightweight Express + Socket.IO backend for Boardly — a collaborative board/space application.

This repository contains the server-side implementation: authentication, spaces (boards), real-time sockets, file uploads (Cloudinary), and MongoDB persistence.

## Why this repo

- Implements core multi-user real-time features (spaces/boards) with Socket.IO.
- Simple auth using JWT stored in an httpOnly cookie and a token blacklist for logout/invalidation.
- File upload pipeline using `multer` (temporary disk storage) + Cloudinary for permanent storage.
- Small, focused codebase that's easy to extend or reuse for similar collaborative apps.

## Features

- Registration / Login with username normalization and Joi validation
- JWT-based auth stored in a cookie named `token` (7d expiry)
- Token blacklisting on logout (persisted in MongoDB)
- Real-time events over Socket.IO (server wiring in `libs/socket.js` + `server_socket.js`)
- Spaces (boards) model with host, members and persisted board state
- Avatar uploads stored on Cloudinary (via `utils/uploadToCloudinary`)

## Quick start — developer

Prerequisites

- Node.js (v16+ recommended)
- MongoDB (URI for Atlas or local instance)
- Cloudinary account (API keys) if you want avatar uploads

1. Install

```bash
npm install
```

2. Create a `.env` file in the project root (server/) with these values:

```
MONGO_URI=<your-mongo-connection-string>
CLIENT_URL=http://localhost:3000
JWT_SECRET=<a-strong-secret>
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
PORT=3000
NODE_ENV=development
```

3. Start the development server

```bash
npm run dev
```

The dev script runs `nodemon server.js`. The app will attempt to connect to MongoDB (see `libs/db.js`) and start an HTTP + Socket.IO server (see `libs/socket.js`).

## API overview (high level)

Routes are mounted under `/api` in `server.js`.

- Auth — `/api/auth`

  - `POST /register` — register user (multipart/form-data, optional `avatar` file). See `routes/auth.route.js` and `controllers/auth.controller.js`.
  - `POST /login` — login (JSON body: `username`, `password`)
  - `GET /profile` — protected; returns user profile (requires token cookie)
  - `GET /logout` — invalidates token by adding it to `blacklist` collection and clears cookie
  - `GET /check` — protected; returns basic auth check

- Space — `/api/space`
  - `POST /createSpace` — create a space (protected)
  - `GET /:spaceId` — get specific space (protected)
  - `GET /` — list current user's spaces (protected)
  - `PUT /:id/invite` — invite user to space (protected)

For implementation details refer to `controllers/*.js` and `routes/*.route.js`.

## Architecture and conventions

- Entry: `server.js` wires middleware, CORS (uses `CLIENT_URL`), cookie parser, and mounts routers. It calls `connectDB()` from `libs/db.js` then starts the HTTP server exported by `libs/socket.js`.
- Socket wiring: `libs/socket.js` creates the `Server` and calls `setupSocketIO(io)` implemented in `server_socket.js` / `socket.js` for event handlers.
- Persistence: Mongoose models live in `models/` (key models: `User`, `Space`, `Blacklist`). `User.password` has `select: false` so controllers use `.select('+password')` when comparing credentials (follow that pattern).
- Validation: Joi schemas used in `libs/validators.js` — controllers call `.validate()` and return Joi messages joined by `, ` on errors.
- Response shape: Controllers return JSON objects with at least `success` and `message` fields (e.g. `{ success: true, message: '...' }`). Follow this pattern for consistency.
- Auth: JWTs are created with `utils/generateToken` which sets an httpOnly cookie named `token` (7d expiry). Logout inserts the token into the `blacklist` collection. Any auth middleware must check blacklist if modifying token logic.
- File uploads: `configs/multer.js` stores files to `uploads/` temporarily; `utils/uploadToCloudinary` reads the temp file, uploads to Cloudinary (webp output), then deletes the temp disk file.

## Notable files to inspect

- `server.js` — startup and middleware
- `libs/db.js` — MongoDB connection
- `libs/socket.js` & `server_socket.js` — Socket.IO setup and server event wiring
- `controllers/auth.controller.js` — canonical patterns for auth, cookie use, and file uploads
- `libs/validators.js` — Joi schemas for request validation
- `utils/index.js` — `generateToken` and `uploadToCloudinary`
- `configs/multer.js`, `configs/cloudinary.js` — upload config
- `models/*.model.js` — Mongoose schemas for `User`, `Space`, `Blacklist`

## Example requests

Register with avatar (multipart/form-data):

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -F "username=alice" \
  -F "password=supersecret" \
  -F "displayName=Alice Example" \
  -F "avatar=@/path/to/avatar.jpg"
```

Login (JSON):

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"supersecret"}' \
  -c cookies.txt
```

(The token cookie is httpOnly; use a client that preserves cookies or the saved `cookies.txt` when making further requests.)

## Testing & linting

- There are no automated tests or linter config present in this repository. Suggested first PRs: add a small Jest/Mocha test for `controllers/auth.controller.js` and a simple ESLint config.

## How to get help / contribute

- Open issues or submit pull requests to this repository.
- If you plan a larger change (e.g., change token storage, cookie name, or upload pipeline), open an issue first so we can discuss breaking changes.

## Maintainers

- Repository owner: `arjunmalpani` (see repository settings for contact details).

## Next steps / ideas for contributors

- Add integration tests around auth flow and socket events
- Add TypeScript typings or JSDoc annotations for better DX
- Add a CONTRIBUTING.md with branching and PR guidance
- Add CI (GitHub Actions) to run tests and lint on PRs

---

If you'd like, I can also:

- Generate a CONTRIBUTING.md draft
- Add a minimal GitHub Actions workflow to run tests and lint
- Add starter tests for auth controllers

Tell me which of these you'd like next.
