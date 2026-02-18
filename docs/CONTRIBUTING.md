# Contributing Guide

Thanks for your interest in contributing to **Huellas Vivas**. This repository contains:

- **Frontend**: Next.js (root folder)
- **Backend**: NestJS (in `backend/`)

This guide explains how to set up your environment, run the apps locally, and open high-quality pull requests.

## Prerequisites

- **Node.js**: 18.18+ (recommended: 20+)
- **pnpm**: enabled via Corepack (recommended) or installed globally
- **Git**

### pnpm (recommended via Corepack)

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

## Repository Structure (high level)

- `app/`: Next.js App Router pages/routes
- `components/`: UI components (includes shadcn/ui setup)
- `hooks/`: React hooks
- `lib/`: Shared utilities and data (e.g. mock data)
- `public/`: Static assets
- `backend/`: NestJS API
  - `backend/src/`: application source
  - `backend/test/`: tests

## Initial Setup

### 1. Clone the repository

```bash
git clone https://github.com/Huellas-Vivas
cd huellas-vivas
```

### 2. Install dependencies (frontend)

From the repository root:

```bash
pnpm install
```

### 3. Install dependencies (backend)

The backend is a separate project under `backend/`:

```bash
pnpm -C backend install
```

## Run the Project Locally

You will typically run the frontend and backend in **two terminals**.

### Frontend (Next.js)

```bash
pnpm dev
```

Then open `http://localhost:3000`.

### Backend (NestJS)

By default, the backend listens on `PORT` (and falls back to `3000`). Since the frontend also uses port 3000, you should run the backend on a different port (for example, **4000**).

#### PowerShell (Windows)

```powershell
$env:PORT=4000
pnpm -C backend start:dev
```

#### CMD (Windows)

```bat
set PORT=4000&& pnpm -C backend start:dev
```

#### macOS/Linux

```bash
PORT=4000 pnpm -C backend start:dev
```

## Environment Variables

At the moment, the backend only relies on:

- `PORT`: Port to bind the NestJS server to.

If you introduce new environment variables, prefer:

- Adding an `.env.example` (tracked)
- Keeping real `.env` files untracked (do **not** commit secrets)

## Development Workflow

### Branching

- Create a feature branch from your default branch:

```bash
git checkout -b feature/short-description
```

Examples:
- `feature/add-home-hero`
- `fix/navbar-overflow`
- `chore/update-deps`

### Code Style & UI Conventions (Frontend)

- UI is built with Tailwind CSS and shadcn/ui conventions.
- Prefer reusing components in `components/` before adding new ones.
- Keep UI components small and composable; colocate domain-specific components near their feature when appropriate.

### Code Quality

#### Frontend

```bash
pnpm lint
pnpm build
```

#### Backend

```bash
pnpm -C backend lint
pnpm -C backend test
```

Optional formatting (backend):

```bash
pnpm -C backend format
```

## Pull Request Process

1. **Keep PRs focused**: one feature/fix per PR when possible.
2. **Run checks locally** (see the commands above).
3. **Include a clear description**:
   - What changed and why
   - How to test it
   - Screenshots for UI changes (before/after)
4. **Write a descriptive commit message** (recommended: Conventional Commits style):
   - `feat: ...`
   - `fix: ...`
   - `chore: ...`
   - `docs: ...`

## Common Issues

### Port already in use

- Frontend uses `http://localhost:3000` by default.
- Backend also defaults to 3000, so set `PORT=4000` (examples above).

### Node.js version issues

If you see errors related to Next.js/TypeScript tooling, verify Node is 18.18+:

```bash
node -v
```

### pnpm install/build problems

Try a clean reinstall:

```bash
pnpm install --force
```

## Getting Help

- Open an issue with:
  - Steps to reproduce
  - Expected vs actual behavior
  - Logs/screenshots if relevant

