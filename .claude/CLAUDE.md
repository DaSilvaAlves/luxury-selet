# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Luxury Selet is a fullstack e-commerce application for O Boticário reseller stores. It consists of a React frontend (`app/`) and a Node.js/Express backend (`backend/`) in a multi-package repository structure.

## Development Commands

### Frontend (app/)
```bash
cd app
npm run dev      # Start Vite dev server on http://localhost:5174
npm run build    # TypeScript check + Vite production build
npm run lint     # ESLint on TypeScript files
npm run preview  # Preview production build
```

### Backend (backend/)
```bash
cd backend
npm run dev                  # Run with ts-node (development)
npm run build                # TypeScript compilation to dist/
npm start                    # Run compiled dist/server.js
npm run prisma:migrate-dev   # Create database migration
npm run prisma:generate      # Generate Prisma Client types
```

### Running Both Services
```bash
# Terminal 1 - Frontend (port 5174)
cd app && npm run dev

# Terminal 2 - Backend (port 3001)
cd backend && npm run dev
```

## Architecture

### Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Shadcn/UI (Radix), React Hook Form + Zod
- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Database:** PostgreSQL via Supabase (currently using in-memory fallback)

### Key Directories
- `app/src/components/` - React components (Cart, Checkout, Header, ProductCard, ui/)
- `app/src/admin/` - Admin dashboard pages
- `app/src/hooks/` - Custom React hooks
- `backend/src/server.ts` - Express API with routes for products, orders, admin
- `backend/src/data/database.ts` - In-memory database (transitioning to Prisma)
- `backend/prisma/schema.prisma` - Database models (AdminUser, Product, Order, MonthlySales)

### API Endpoints (port 3001)
- `GET/POST /api/products` - Product catalog
- `POST /api/orders` - Create orders
- `POST /api/admin/login` - Admin authentication (JWT)
- `GET /api/admin/dashboard` - Dashboard stats
- `/api/admin/products`, `/api/admin/orders` - Admin CRUD

### Path Aliases
- Frontend: `@/` → `./src/` (configured in vite.config.ts and tsconfig)

---

## Synkra AIOS Framework

This project uses Synkra AIOS, an AI-Orchestrated System for Full Stack Development.

### Agent System
- Activate agents with `@agent-name`: @dev, @qa, @architect, @pm, @po, @sm, @analyst
- Master agent: @aios-master
- Agent commands use `*` prefix: *help, *create-story, *task, *exit

### Story-Driven Development
1. All development starts with a story in `docs/stories/`
2. Update progress by marking checkboxes: [ ] → [x]
3. Maintain the File List section in the story
4. Implement exactly what the acceptance criteria specify

### Git Conventions
- Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`
- Reference story ID: `feat: implement feature [Story 2.1]`

### AIOS Framework Structure
```
.aios-core/
├── agents/      # Agent persona definitions
├── tasks/       # Executable task workflows
├── workflows/   # Multi-step workflow definitions
├── templates/   # Document and code templates
└── checklists/  # Validation and review checklists

docs/
├── stories/     # Development stories
├── prd/         # Product requirements
└── architecture/# System architecture docs
```

### AIOS Commands
- `*help` - Show available commands
- `*create-story` - Create new story
- `*task {name}` - Execute specific task
- `*workflow {name}` - Run workflow

---

## Current State Notes

- Database connectivity to Supabase has P1001 error (connection blocked)
- Backend currently uses in-memory database as fallback
- Admin login is hardcoded: `admin` / `admin123` (development only)
