# ADR-002: Database Layer Architecture (Prisma + Supabase)

**Status:** ACCEPTED ✅
**Date:** 2026-02-09
**Decision Maker:** @architect (Aria)
**Affected Components:** Backend, Database, Data Access Layer

---

## Context

Luxury Selet requires a persistent, scalable database layer to replace the current in-memory fallback. The application needs:
- **Multi-user data isolation** via RLS (Row-Level Security)
- **Type-safe database access** with TypeScript
- **Easy schema management** and migrations
- **Future-proof architecture** for multi-tenant growth

### Current State
- ✅ In-memory database works for MVP
- ⚠️ Zero persistence across restarts
- ⚠️ No multi-user isolation
- ⚠️ Manual schema management

### Requirements
1. **Data Persistence** — Data survives service restarts
2. **RLS Support** — Row-level security for multi-tenancy
3. **Type Safety** — Full TypeScript support
4. **Migration Management** — Version-controlled schema changes
5. **Developer Experience** — Easy to query and update

---

## Decision

**Use Prisma ORM + Supabase PostgreSQL for database layer**

### Architecture Layers

```
┌─────────────────────────────────────────┐
│   Express.js Routes (API Layer)         │
├─────────────────────────────────────────┤
│   Service Layer (Business Logic)        │
│   └─ User service                       │
│   └─ Product service                    │
│   └─ Order service                      │
├─────────────────────────────────────────┤
│   Prisma Client (Data Access Layer)     │
│   └─ Singleton instance in lib/prisma.ts
├─────────────────────────────────────────┤
│   Supabase PostgreSQL (Persistence)     │
│   └─ RLS policies for security          │
│   └─ Indexes for performance            │
└─────────────────────────────────────────┘
```

### Database Schema Design

```prisma
// User Management
model AdminUser {
  id       String  @id @default(uuid())
  username String  @unique
  password String  // Hashed in production
  name     String
  auth_id  String?
  user_id  String?
  products Product[]
  orders   Order[]
}

// Product Catalog
model Product {
  id            String   @id @default(uuid())
  name          String
  price         Float
  image         String?
  categoryId    String?
  category      String?
  availability  String   @default("pronta-entrega")
  inStock       Boolean  @default(true)
  isActive      Boolean  @default(true)
  isFeatured    Boolean  @default(false)
  userId        String?  @map("user_id")      // Owner
  admin         AdminUser? @relation(fields: [userId], references: [id])
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@index([userId])   // Index for RLS queries
  @@index([categoryId])
  @@map("products")
}

// Order Management
model Order {
  id            String   @id @default(uuid())
  adminId       String?
  admin         AdminUser? @relation(fields: [adminId], references: [id])
  items         String   // JSON array of order items
  total         Float
  status        String   @default("pending")
  userId        String?  @map("user_id")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@index([adminId])
  @@index([userId])
  @@map("orders")
}

// Category Management
model Category {
  id        String @id @default(uuid())
  name      String @unique
  imageUrl  String?
  createdAt DateTime @default(now()) @map("created_at")

  @@map("categories")
}

// Sales Analytics
model MonthlySales {
  id            String   @id @default(uuid())
  month         Int
  year          Int
  totalSales    Float
  orderCount    Int
  createdAt     DateTime @default(now()) @map("created_at")

  @@unique([month, year])
  @@map("monthly_sales")
}
```

### Configuration

**Environment Variables** (`.env`)
```bash
# Database Connection
DATABASE_URL="postgresql://user:password@host.supabase.co:5432/postgres"

# Prisma
NODE_ENV=development
```

**Prisma Configuration** (`prisma/schema.prisma`)
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

---

## Rationale

### ✅ Why Prisma?

1. **Type Safety**
   - Auto-generated TypeScript types from schema
   - Compile-time query validation
   - Eliminates runtime SQL injection risks

2. **Developer Experience**
   - Intuitive API: `prisma.product.findMany({ where: { userId } })`
   - No manual SQL writing (unless needed)
   - Built-in migration system

3. **Production Ready**
   - Connection pooling
   - Query optimization
   - Comprehensive error handling

4. **Ecosystem**
   - Works with any PostgreSQL database
   - Great documentation and community support
   - Easy to test with in-memory SQLite

### ✅ Why Supabase?

1. **PostgreSQL Foundation**
   - Battle-tested relational database
   - RLS (Row-Level Security) policies
   - JSONB support for flexible data

2. **Built-in RLS**
   - Enforce security at database level
   - Multi-tenant data isolation
   - Replaces application-level checks

3. **Developer Features**
   - Web dashboard
   - Real-time capabilities (future)
   - Managed backups and scaling

4. **Cost Effective**
   - Free tier for MVP
   - Pay-as-you-go for growth
   - No infrastructure management

### ✅ Fallback Mechanism

**During MVP (Current)**
```typescript
if (DATABASE_URL_MISSING) {
  // Use in-memory database
  return inMemoryFallback.product.create(data);
}
```

**When Supabase Connected**
```typescript
// Automatically uses Prisma + Supabase
const product = await prisma.product.create({ data });
```

---

## Implementation Details

### Migration Strategy

**Phase 1: Schema Creation** (When Supabase connects)
```bash
npm run prisma:migrate-dev -- --name init
```

**Phase 2: RLS Policies** (Security layer)
```sql
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all products
CREATE POLICY "Users can view all products"
  ON products FOR SELECT
  USING (true);

-- Policy: Users can only manage their own products
CREATE POLICY "Users can manage their own products"
  ON products FOR INSERT, UPDATE, DELETE
  WITH CHECK (auth.uid()::text = user_id);
```

**Phase 3: Indexing** (Performance)
```sql
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_orders_admin_id ON orders(admin_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

---

## Alternatives Considered

### Option A: MongoDB (Rejected)
- **Schema flexibility** ✓ but breaks type safety
- **Horizontal scaling** ✓ but overkill for MVP
- **No RLS** ✗ requires app-level security
- **Extra complexity** ✗ for relational data (orders → products)

### Option B: SQLite (Rejected)
- **Good for testing** ✓
- **Single file** ✓
- **No RLS** ✗ security must be in app
- **No scaling** ✗ not suitable for production

### Option C: Firebase/Firestore (Rejected)
- **Vendor lock-in** ✗ expensive to migrate
- **Limited querying** ✗ complex joins
- **Built-in security** ✓ but less flexible
- **Cost at scale** ✗ unpredictable bills

### Option D: Prisma + Supabase (SELECTED) ✅
- **Type safety** ✅ with generated types
- **RLS ready** ✅ database-level security
- **Relational** ✅ perfect for products/orders
- **Developer friendly** ✅ excellent DX
- **Cost effective** ✅ free to paid scaling

---

## Data Access Patterns

### 1. Singleton Prisma Client

**File:** `backend/src/lib/prisma.ts`
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

### 2. Query Examples

```typescript
// Read
const products = await prisma.product.findMany({
  where: { userId: 'admin-1', isActive: true },
  include: { admin: true },
  orderBy: { createdAt: 'desc' }
});

// Create
const newProduct = await prisma.product.create({
  data: {
    name: 'Product Name',
    price: 99.90,
    userId: 'admin-1'
  }
});

// Update
const updated = await prisma.product.update({
  where: { id: 'prod-123' },
  data: { price: 89.90 }
});

// Delete
await prisma.product.delete({
  where: { id: 'prod-123' }
});
```

---

## Security Considerations

### ✅ Input Validation
- Prisma prevents SQL injection
- TypeScript enforces field types
- Use Zod/validation library for API input

### ✅ Row-Level Security
- RLS policies enforce user isolation at database
- Users can only access their own data
- Bypass protection: if app-level auth fails, DB still protects

### ✅ Password Security
- Never store plaintext passwords
- Use bcrypt in future auth implementation
- Current MVP: hardcoded credentials OK for dev

### ✅ API Security
- JWT tokens validated before DB queries
- User context injected from middleware
- All write operations check ownership

---

## Performance Considerations

### Indexing Strategy
```
✅ userId — Most frequent filter
✅ categoryId — Browse by category
✅ createdAt — Sort by date
✅ isActive — Filter active products
```

### Query Optimization
```typescript
// ✅ Good: Single query with includes
const products = await prisma.product.findMany({
  where: { isActive: true },
  include: { admin: true }
});

// ❌ Bad: N+1 problem
const products = await prisma.product.findMany();
for (const product of products) {
  product.admin = await prisma.adminUser.findUnique({
    where: { id: product.userId }
  });
}
```

---

## Related ADRs
- ADR-001: Token Unification Strategy
- ADR-003: Frontend State Management
- ADR-004: API Design (REST with JWT)

---

## Sign-Off

- ✅ **Schema Designed:** 2026-01-30
- ✅ **Prisma Configured:** 2026-02-09
- ✅ **Fallback Implemented:** 2026-02-09
- ⏳ **Supabase Migration:** Pending DB connectivity
- ⏳ **RLS Policies:** Pending migration
- ✅ **Documented:** This ADR

---

## References
- `backend/prisma/schema.prisma` — Database schema definition
- `backend/src/data/database.ts` — Current implementation with fallback
- `docs/architecture.md` — High-level architecture document
