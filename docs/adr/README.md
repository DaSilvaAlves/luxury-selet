# Architecture Decision Records (ADRs)

**Status:** 4/4 ADRs Complete ✅
**Last Updated:** 2026-02-09
**Location:** `docs/adr/`

This directory contains all architectural decisions made for the Luxury Selet application. Each ADR documents:
- The problem being solved
- The decision made
- Rationale and alternatives
- Implementation details
- Sign-off status

---

## ADR Index

### ✅ ADR-001: Token Unification Strategy (auth_id + user_id)

**Status:** ACCEPTED & IMPLEMENTED

**Quick Summary:**
- Unified user context across JWT tokens, backend middleware, database, and frontend
- Both `auth_id` (OAuth provider) and `user_id` (system user) included in all layers
- Enables multi-user data isolation and future SSO integration
- Zero performance impact, fully backward compatible

**Key Decision:**
```typescript
JWT Token {
  id: 'admin-1',
  auth_id: 'admin-1',    // For OAuth providers
  user_id: 'admin-1'     // For RLS policies
}
```

**Impact Areas:**
- ✅ Backend authentication (server.ts)
- ✅ Frontend storage (useAdminAuth.ts)
- ✅ Database schema (userId field in products)
- ✅ API contracts (token includes both fields)

**File:** `ADR-001-token-unification.md`

---

### ✅ ADR-002: Database Layer Architecture (Prisma + Supabase)

**Status:** ACCEPTED & CONFIGURED

**Quick Summary:**
- Prisma ORM for type-safe database access
- Supabase PostgreSQL for persistent storage
- In-memory fallback during MVP (before Supabase connectivity)
- RLS (Row-Level Security) policies for multi-tenant data isolation

**Key Decision:**
```
Express.js Routes
    ↓
Prisma Client (Singleton)
    ↓
Supabase PostgreSQL
```

**Database Schema:**
- `AdminUser` — User accounts
- `Product` — Product catalog with userId ownership
- `Order` — Order management
- `Category` — Product categories
- `MonthlySales` — Analytics

**Impact Areas:**
- ✅ Data layer architecture
- ✅ Prisma schema definition
- ✅ Migration strategy
- ✅ Performance indexing
- ⏳ RLS policies (pending DB connectivity)

**File:** `ADR-002-database-layer-architecture.md`

---

### ✅ ADR-003: Frontend State Management (React Hooks + localStorage)

**Status:** ACCEPTED & IMPLEMENTED

**Quick Summary:**
- React Hooks + custom hooks (no Redux/Zustand for MVP)
- localStorage for JWT token and user context persistence
- Separate hooks for each domain (auth, products, categories, cart, orders)
- Clear migration path to Redux/Zustand if complexity grows

**Key Decision:**
```
React Components
    ↓
Custom Hooks (useState + useEffect)
    ↓
localStorage (Token + User Context)
```

**Custom Hooks:**
- `useAdminAuth()` — Authentication state
- `useProducts()` — Product catalog
- `useCategories()` — Categories
- `useCart()` — Shopping cart
- `useOrders()` — Order management

**Impact Areas:**
- ✅ Authentication flow (login/logout)
- ✅ Data fetching and caching
- ✅ Form state management
- ✅ Component testing strategy

**File:** `ADR-003-frontend-state-management.md`

---

### ✅ ADR-004: API Design (REST with JWT Authentication)

**Status:** ACCEPTED & IMPLEMENTED

**Quick Summary:**
- RESTful API design (GET, POST, PUT, DELETE)
- JWT Bearer token authentication (no sessions)
- Standard HTTP status codes
- JSON request/response format
- CORS configured for frontend integration

**Key Decision:**
```
REST Endpoints (HTTP methods)
    ↓
JWT Bearer Token (Authorization header)
    ↓
JSON Response (with standard error format)
```

**API Endpoints:**
- **Auth:** `POST /api/admin/login`, `GET /api/admin/profile`
- **Products:** `GET /api/products`, `POST/PUT/DELETE /api/admin/products/:id`
- **Orders:** `GET /api/admin/orders`, `POST /api/orders`
- **Categories:** `GET /api/categories`, `POST /api/admin/categories`
- **Dashboard:** `GET /api/admin/dashboard`

**Impact Areas:**
- ✅ API endpoint design
- ✅ JWT authentication middleware
- ✅ Error handling strategy
- ✅ Input validation
- ✅ CORS configuration

**File:** `ADR-004-api-design-rest-jwt.md`

---

## Decision Timeline

| Date | ADR | Title | Status |
|------|-----|-------|--------|
| 2026-02-09 | 001 | Token Unification Strategy | ✅ IMPLEMENTED |
| 2026-02-09 | 002 | Database Layer Architecture | ✅ CONFIGURED |
| 2026-02-09 | 003 | Frontend State Management | ✅ IMPLEMENTED |
| 2026-02-09 | 004 | API Design (REST + JWT) | ✅ IMPLEMENTED |

---

## Key Architectural Decisions Summary

### ✅ Authentication & Authorization
- **ADR-001:** Unified user context (auth_id + user_id)
- **ADR-004:** JWT Bearer tokens, stateless authentication

### ✅ Data Layer
- **ADR-002:** Prisma ORM + Supabase PostgreSQL
- **ADR-002:** RLS policies for data isolation

### ✅ Frontend
- **ADR-003:** React Hooks + localStorage
- **ADR-003:** Custom hooks per domain

### ✅ API Communication
- **ADR-004:** REST design with standard HTTP
- **ADR-004:** JSON request/response format

---

## Architecture Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                        LUXURY SELET                           │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  Frontend (React)                  Backend (Node.js)          │
│  ┌──────────────────────┐         ┌──────────────────────┐   │
│  │ Components           │         │ Express.js Routes    │   │
│  │                      │         │                      │   │
│  │ Custom Hooks         │         │ Auth Middleware      │   │
│  │ ├─ useAdminAuth      │         │ ├─ JWT Validation    │   │
│  │ ├─ useProducts       │────────→│ ├─ User Context      │   │
│  │ ├─ useCategories     │         │ └─ RLS Check         │   │
│  │ ├─ useCart           │         │                      │   │
│  │ └─ useOrders         │         │ Prisma Client        │   │
│  │                      │         │ (Singleton)          │   │
│  │ localStorage         │         │                      │   │
│  │ ├─ JWT Token         │         │ Services             │   │
│  │ └─ User Context      │         │ ├─ authService       │   │
│  └──────────────────────┘         │ ├─ productService    │   │
│          ↓ REST/JWT                │ ├─ orderService      │   │
│  ┌──────────────────────┐         │ └─ categoryService   │   │
│  │ Endpoints:           │         └──────────┬───────────┘   │
│  │ /api/products        │                    │               │
│  │ /api/orders          │                    ↓               │
│  │ /api/admin/login     │         ┌──────────────────────┐   │
│  │ /api/categories      │         │ Supabase PostgreSQL  │   │
│  └──────────────────────┘         │                      │   │
│                                   │ Tables:              │   │
│                                   │ ├─ AdminUser         │   │
│                                   │ ├─ Product           │   │
│                                   │ ├─ Order             │   │
│                                   │ ├─ Category          │   │
│                                   │ └─ MonthlySales      │   │
│                                   │                      │   │
│                                   │ RLS Policies         │   │
│                                   │ ├─ Row-level security│   │
│                                   │ └─ Multi-tenant      │   │
│                                   └──────────────────────┘   │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## Dependencies Between ADRs

```
ADR-001 (Token Unification)
    ↓
    ├─→ ADR-002 (Database) — Need userId for RLS
    ├─→ ADR-003 (Frontend) — Store unified context
    └─→ ADR-004 (API) — JWT includes both fields

ADR-002 (Database)
    ↓
    ├─→ ADR-001 (Token) — Needs userId field
    └─→ ADR-004 (API) — Data persisted via API

ADR-003 (Frontend)
    ↓
    ├─→ ADR-001 (Token) — Store JWT token
    └─→ ADR-004 (API) — Call REST endpoints

ADR-004 (API)
    ↓
    ├─→ ADR-001 (Token) — JWT auth
    ├─→ ADR-002 (Database) — Data source
    └─→ ADR-003 (Frontend) — Client integration
```

---

## Future ADRs to Consider

### Phase 2: Growth
- [ ] **ADR-005:** Caching Strategy (Redis/SWR/React Query)
- [ ] **ADR-006:** Real-time Updates (WebSockets/Server-Sent Events)
- [ ] **ADR-007:** OAuth/SSO Integration (using auth_id field)
- [ ] **ADR-008:** API Versioning Strategy (/v2, /v3, etc.)

### Phase 3: Scale
- [ ] **ADR-009:** Microservices Decomposition
- [ ] **ADR-010:** Message Queue Architecture (events)
- [ ] **ADR-011:** Search Strategy (Elasticsearch/TypeSearch)
- [ ] **ADR-012:** File Storage Strategy (S3/Supabase Storage)

### Phase 4: Enterprise
- [ ] **ADR-013:** Multi-tenancy Strategy
- [ ] **ADR-014:** Audit Logging Architecture
- [ ] **ADR-015:** Disaster Recovery & Backup

---

## How to Read an ADR

Each ADR follows this structure:

1. **Status** — PROPOSED, ACCEPTED, DEPRECATED
2. **Context** — Why we're making this decision
3. **Decision** — What we decided
4. **Rationale** — Why this choice is best
5. **Alternatives** — What we considered
6. **Implementation** — How we built it
7. **Consequences** — Benefits and obligations
8. **Sign-Off** — When implemented and by whom

---

## How to Create a New ADR

```markdown
# ADR-NNN: Title of Decision

**Status:** PROPOSED
**Date:** YYYY-MM-DD
**Decision Maker:** @role-name
**Affected Components:** Component1, Component2

## Context
Why are we making this decision?

## Decision
What did we decide?

## Rationale
Why is this the best choice?

## Alternatives
What else did we consider?

## Related ADRs
- ADR-001: ...
- ADR-002: ...

## Sign-Off
Who approved this and when?
```

---

## How to Update an ADR

1. **Rationale changes?** → Update Rationale section
2. **Implementation complete?** → Update Status to ACCEPTED
3. **Decision superseded?** → Create new ADR, mark old as DEPRECATED

**Never delete ADRs** — Keep them for historical reference.

---

## Resources

- [ADR Template](https://github.com/adr/madr)
- [Lightweight ADRs](https://adr.github.io/)
- [Joel Spolsky on Architecture Decisions](https://www.joelonsoftware.com)

---

## Navigation

- **For Developers:** Start with ADR-003 (Frontend) and ADR-004 (API)
- **For DevOps:** See ADR-002 (Database migration strategy)
- **For Security Review:** See ADR-001 (Token structure) and ADR-004 (Authentication)
- **For Future Planning:** See "Future ADRs to Consider" section

---

**Maintained by:** @architect (Aria)
**Last Review:** 2026-02-09
**Status:** 4/4 ADRs Complete ✅
