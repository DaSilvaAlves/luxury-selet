# ADR-004: API Design (REST with JWT Authentication)

**Status:** ACCEPTED ✅
**Date:** 2026-02-09
**Decision Maker:** @architect (Aria)
**Affected Components:** Backend API, Frontend Integration, Authentication

---

## Context

The Luxury Selet backend API must support:
- **Product Management** (CRUD operations for admin)
- **Order Processing** (Checkout and order history)
- **Admin Authentication** (Login and protected routes)
- **User Context** (Track product ownership)
- **Scalability** (Support future features like real-time updates)

### Requirements
1. **Predictable URL structure** for developers
2. **Standard HTTP methods** (GET, POST, PUT, DELETE)
3. **JWT-based authentication** for stateless API
4. **Proper HTTP status codes** for error handling
5. **JSON request/response** format
6. **CORS support** for frontend integration
7. **API versioning** strategy for future growth

---

## Decision

**Use REST API with JWT Bearer Token Authentication**

### API Design Principles

```
Base URL: http://localhost:3001/api
  or: https://api.luxury-selet.com/api (Production)

Authentication: Bearer JWT in Authorization header
Content-Type: application/json
Response Format: JSON
Versioning: None for MVP (add /v2 later if needed)
```

### REST Endpoints Structure

#### 1. Authentication Endpoints

```http
POST /api/admin/login
  Request:  { username: "admin", password: "admin123" }
  Response: { token: "jwt...", user: { id, username, name, auth_id, user_id } }
  Status:   200 OK

POST /api/admin/logout
  Headers:  Authorization: Bearer {token}
  Response: { message: "Logged out successfully" }
  Status:   200 OK

GET /api/admin/profile
  Headers:  Authorization: Bearer {token}
  Response: { id, username, name, auth_id, user_id }
  Status:   200 OK
  Errors:   401 Unauthorized, 404 Not Found
```

#### 2. Product Endpoints

```http
GET /api/products
  Query:    ?category=beauty&inStock=true&page=1&limit=20
  Response: { products: [...], total: 100 }
  Status:   200 OK

GET /api/products/:id
  Response: { id, name, price, category, userId, ... }
  Status:   200 OK
  Errors:   404 Not Found

POST /api/admin/products
  Headers:  Authorization: Bearer {token}
  Request:  { name, price, category, image, availability, ... }
  Response: { id, name, price, userId, createdAt, ... }
  Status:   201 Created
  Errors:   401 Unauthorized, 400 Bad Request, 422 Unprocessable Entity

PUT /api/admin/products/:id
  Headers:  Authorization: Bearer {token}
  Request:  { name?, price?, category?, ... }
  Response: { id, name, price, userId, updatedAt, ... }
  Status:   200 OK
  Errors:   401 Unauthorized, 403 Forbidden, 404 Not Found

DELETE /api/admin/products/:id
  Headers:  Authorization: Bearer {token}
  Response: { message: "Product deleted" }
  Status:   204 No Content
  Errors:   401 Unauthorized, 403 Forbidden, 404 Not Found
```

#### 3. Order Endpoints

```http
GET /api/admin/orders
  Headers:  Authorization: Bearer {token}
  Query:    ?status=pending&page=1&limit=20
  Response: { orders: [...], total: 50 }
  Status:   200 OK

POST /api/orders
  Request:  { items: [...], total, userEmail, ... }
  Response: { orderId, status: "pending", total, ... }
  Status:   201 Created
  Errors:   400 Bad Request, 422 Unprocessable Entity

GET /api/orders/:id
  Response: { id, items, total, status, createdAt, ... }
  Status:   200 OK
  Errors:   404 Not Found

POST /api/admin/orders/:id/process
  Headers:  Authorization: Bearer {token}
  Request:  { status: "processing" | "shipped" | "delivered" | "cancelled" }
  Response: { id, status, updatedAt, ... }
  Status:   200 OK
  Errors:   401 Unauthorized, 404 Not Found
```

#### 4. Category Endpoints

```http
GET /api/categories
  Response: { categories: [...] }
  Status:   200 OK

POST /api/admin/categories
  Headers:  Authorization: Bearer {token}
  Request:  { name, imageUrl }
  Response: { id, name, imageUrl, createdAt }
  Status:   201 Created
  Errors:   401 Unauthorized, 400 Bad Request
```

#### 5. Dashboard/Analytics Endpoints

```http
GET /api/admin/dashboard
  Headers:  Authorization: Bearer {token}
  Response: {
    totalProducts: 150,
    totalOrders: 420,
    totalRevenue: 50000,
    monthlySales: [...],
    topProducts: [...],
    recentOrders: [...]
  }
  Status:   200 OK
  Errors:   401 Unauthorized
```

---

## Request/Response Format

### Authentication Header

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Standard Response Format

**Success (2xx)**
```json
{
  "data": { ... },
  "success": true,
  "timestamp": "2026-02-09T12:30:00Z"
}
```

**Error (4xx, 5xx)**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid token",
    "details": { ... }
  },
  "success": false,
  "timestamp": "2026-02-09T12:30:00Z"
}
```

### Pagination

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| **200** | OK | Successful GET/PUT/PATCH |
| **201** | Created | Successful POST resource creation |
| **204** | No Content | Successful DELETE |
| **400** | Bad Request | Invalid request format/validation |
| **401** | Unauthorized | Missing/invalid JWT token |
| **403** | Forbidden | User lacks permission (not their product) |
| **404** | Not Found | Resource doesn't exist |
| **409** | Conflict | Resource conflict (duplicate) |
| **422** | Unprocessable Entity | Semantic error (valid format, invalid data) |
| **500** | Server Error | Unexpected server error |
| **503** | Service Unavailable | Database unavailable |

---

## Implementation Details

### Express.js Route Structure

```typescript
// backend/src/server.ts

import express from 'express';
import { authenticateToken } from './middleware/auth';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Public Routes
app.post('/api/admin/login', async (req, res) => {
  // Login implementation
});

app.get('/api/products', async (req, res) => {
  // Get products (public)
});

// Protected Routes (require JWT)
app.post('/api/admin/products', authenticateToken, async (req, res) => {
  // Create product (admin only)
});

app.put('/api/admin/products/:id', authenticateToken, async (req, res) => {
  // Update product (admin only)
});

app.delete('/api/admin/products/:id', authenticateToken, async (req, res) => {
  // Delete product (admin only)
});

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message
    },
    success: false
  });
});
```

### JWT Token Payload

```typescript
interface JWTPayload {
  id: string;              // Primary user ID
  username: string;
  name: string;
  auth_id: string;         // OAuth provider ID (for future SSO)
  user_id: string;         // System user ID (for RLS)
  iat: number;             // Issued at
  exp: number;             // Expiration (24 hours)
}
```

### Authentication Middleware

```typescript
// backend/src/middleware/auth.ts

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing authorization token'
      },
      success: false
    });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token'
      },
      success: false
    });
  }
}
```

---

## API Client Integration (Frontend)

### Fetch Wrapper

```typescript
// app/src/services/api.ts

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('admin_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API error');
  }

  return response.json();
}

// Usage
const products = await apiCall<Product[]>('/products');
const newProduct = await apiCall<Product>('/admin/products', {
  method: 'POST',
  body: JSON.stringify(productData),
});
```

---

## Error Handling Strategy

### Client-Side Error Handling

```typescript
try {
  const product = await apiCall<Product>('/products/123');
  setProduct(product.data);
} catch (error) {
  if (error instanceof TypeError) {
    // Network error
    setError('Network connection failed');
  } else if (error.message.includes('Unauthorized')) {
    // Auth error - redirect to login
    navigate('/login');
  } else {
    // Other API error
    setError(error.message);
  }
}
```

### Server-Side Error Handling

```typescript
app.post('/api/admin/products', authenticateToken, async (req, res) => {
  try {
    // Validate input
    if (!req.body.name) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Product name is required'
        },
        success: false
      });
    }

    // Check ownership (RLS)
    const userId = (req as any).user.user_id;
    if (req.body.userId && req.body.userId !== userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Cannot create product for another user'
        },
        success: false
      });
    }

    // Create product
    const product = await addProduct({
      ...req.body,
      userId
    });

    res.status(201).json({
      data: product,
      success: true
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create product'
      },
      success: false
    });
  }
});
```

---

## Rationale

### ✅ Why REST?

1. **Simplicity**
   - Standard HTTP methods (GET, POST, PUT, DELETE)
   - Developers already understand REST
   - No learning curve for GraphQL or tRPC

2. **Caching**
   - Browser can cache GET requests
   - CDN can cache public endpoints
   - Reduces API load

3. **Debugging**
   - Easy to test with curl/Postman
   - Browser DevTools show requests clearly
   - Logs are human-readable

4. **Maturity**
   - Battle-tested pattern
   - Excellent tooling
   - Wide ecosystem

### ✅ Why JWT?

1. **Stateless**
   - No session storage needed
   - Scales horizontally
   - Works with distributed systems

2. **Standards-Based**
   - RFC 7519 specification
   - Works across domains
   - Widely supported

3. **Self-Contained**
   - Token contains all needed info (user_id, auth_id)
   - No need to query database on every request
   - Can verify offline

4. **Flexible**
   - Works with REST, GraphQL, WebSockets
   - Easy to add scopes/permissions later
   - Perfect for mobile apps

### ✅ Why Not GraphQL?

- **Overkill for MVP** ✗ (adds complexity)
- **Query complexity** ✗ (N+1 problem)
- **Caching harder** ✗ (HTTP caching doesn't work well)
- **Future consideration** ✓ (can add later)

### ✅ Why Not tRPC?

- **Monorepo required** ✗ (frontend/backend coupled)
- **Not REST** ✗ (breaks standards)
- **Future consideration** ✓ (good for fullstack projects)

---

## Security Considerations

### ✅ Input Validation

```typescript
// Validate before processing
if (!req.body.name || req.body.name.length === 0) {
  return res.status(400).json({ error: 'Name required' });
}

if (req.body.price <= 0) {
  return res.status(400).json({ error: 'Price must be positive' });
}
```

### ✅ CORS Configuration

```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5176',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### ✅ Rate Limiting (Future)

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100                    // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### ✅ HTTPS (Production)

- All production APIs must use HTTPS
- Redirect HTTP to HTTPS
- Set `Strict-Transport-Security` header

### ✅ Token Expiration

- JWT expires in 24 hours
- Frontend redirects to login on 401
- Future: implement refresh tokens

---

## Alternatives Considered

### Option A: GraphQL (Rejected)
- **Flexible queries** ✓ but adds complexity
- **Single endpoint** ✓ but harder to debug
- **Overkill for MVP** ✗

### Option B: gRPC (Rejected)
- **Performance** ✓ but requires protobuf
- **Learning curve** ✗ for JavaScript team
- **Web support** ✗ poor browser integration

### Option C: REST + Session (Rejected)
- **Traditional** ✓
- **Stateful** ✗ doesn't scale
- **Server storage needed** ✗

### Option D: REST + JWT (SELECTED) ✅
- **Simple** ✅
- **Stateless** ✅
- **Scalable** ✅
- **Standard** ✅

---

## API Versioning Strategy

### Current (MVP): No Versioning
- Endpoints: `/api/products`, `/api/orders`
- All clients on latest version

### Future (V2+): URL Versioning
```
/api/v1/products  → Legacy API
/api/v2/products  → New API with breaking changes
```

**When to version:**
- Breaking changes (rename fields, remove endpoints)
- New features can be added without versioning
- Deprecate old versions after 1 year

---

## Monitoring & Analytics

### Logging

```typescript
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});
```

### Error Tracking (Future)

```typescript
import Sentry from '@sentry/node';

Sentry.init({ dsn: process.env.SENTRY_DSN });

app.use(Sentry.Handlers.errorHandler());
```

---

## Related ADRs
- ADR-001: Token Unification Strategy
- ADR-002: Database Layer Architecture
- ADR-003: Frontend State Management

---

## Sign-Off

- ✅ **API Implemented:** 2026-02-09
- ✅ **JWT Authentication:** 2026-02-09
- ✅ **CORS Configured:** 2026-02-09
- ✅ **Error Handling:** 2026-02-09
- ✅ **Documented:** This ADR

---

## References
- `backend/src/server.ts` — API implementation
- `app/src/services/api.ts` — Frontend API client
- [REST API Best Practices](https://restfulapi.net)
- [JWT.io Documentation](https://jwt.io)
- [Express.js Guide](https://expressjs.com)
