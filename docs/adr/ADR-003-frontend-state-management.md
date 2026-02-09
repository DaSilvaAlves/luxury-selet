# ADR-003: Frontend State Management (React Hooks + localStorage)

**Status:** ACCEPTED ✅
**Date:** 2026-02-09
**Decision Maker:** @architect (Aria)
**Affected Components:** Frontend, State, Authentication, Data Fetching

---

## Context

The Luxury Selet frontend requires a state management strategy that:
- **Manages authentication state** (login, logout, token storage)
- **Caches product data** to reduce API calls
- **Handles form state** for product creation/editing
- **Persists state** across page reloads
- **Remains simple and maintainable** during MVP

### Current State
- ✅ React Hooks (useState, useEffect) used throughout
- ✅ Custom hooks for auth (`useAdminAuth`)
- ✅ Custom hooks for data (`useProducts`, `useCategories`)
- ✅ localStorage for token persistence
- ⚠️ No global state management (Redux, Zustand, etc.)
- ⚠️ Potential prop drilling in deep component trees

### Requirements
1. **Auth Persistence** — Survive page reloads
2. **Minimal Boilerplate** — MVP-friendly, not over-engineered
3. **Type Safety** — Full TypeScript support
4. **Offline Capability** — Graceful fallbacks when API unavailable
5. **Easy Testing** — Mockable hooks and services

---

## Decision

**Use React Hooks + Custom Hooks + localStorage (No Redux/Zustand for MVP)**

### Architecture

```
┌─────────────────────────────────────────────────┐
│          React Components (UI Layer)            │
├─────────────────────────────────────────────────┤
│        Custom Hooks (State Management)          │
│  ┌──────────────────────────────────────────┐  │
│  │ useAdminAuth     (Authentication)         │  │
│  │ useProducts      (Product catalog)        │  │
│  │ useCategories    (Categories)             │  │
│  │ useCart          (Shopping cart)          │  │
│  │ useOrders        (Order management)       │  │
│  └──────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│          Services (API Integration)             │
│  ┌──────────────────────────────────────────┐  │
│  │ authService      (Login/logout)           │  │
│  │ productService   (CRUD operations)        │  │
│  │ orderService     (Order submission)       │  │
│  └──────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│        Storage Layer (Persistence)              │
│  ┌──────────────────────────────────────────┐  │
│  │ localStorage     (Token + user context)   │  │
│  │ sessionStorage   (Temporary session data) │  │
│  └──────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│           Backend API (Express.js)              │
└─────────────────────────────────────────────────┘
```

### Implementation Pattern

**Custom Hook Example:** `useAdminAuth.ts`
```typescript
export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEYS.ADMIN_USER);
    const storedToken = localStorage.getItem(AUTH_STORAGE_KEYS.ADMIN_TOKEN);

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login
  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error('Login failed');

      const { token, user: apiUser } = await response.json();

      // Store unified user context
      const unifiedUser = {
        id: apiUser.id,
        username: apiUser.username,
        name: apiUser.name,
        auth_id: apiUser.auth_id || apiUser.id,
        user_id: apiUser.user_id || apiUser.id,
      };

      localStorage.setItem(AUTH_STORAGE_KEYS.ADMIN_TOKEN, token);
      localStorage.setItem(AUTH_STORAGE_KEYS.ADMIN_USER, JSON.stringify(unifiedUser));

      setUser(unifiedUser);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.ADMIN_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.ADMIN_USER);
    setUser(null);
  };

  return { user, loading, error, login, logout };
}
```

**Data Hook Example:** `useProducts.ts`
```typescript
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/products`);
      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create product
  const addProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.ADMIN_TOKEN);

    try {
      const response = await fetch(`${API_BASE}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(product),
      });

      if (!response.ok) throw new Error('Failed to create product');

      const newProduct = await response.json();
      setProducts([...products, newProduct]);
      return newProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  }, [products]);

  // Initialize on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, addProduct, fetchProducts };
}
```

---

## Rationale

### ✅ Why React Hooks Only?

1. **Simplicity** (MVP-focused)
   - No Redux boilerplate (actions, reducers, selectors)
   - No Zustand setup complexity
   - Straightforward useState/useEffect patterns

2. **Sufficient for MVP**
   - Authentication state (user, token)
   - Product catalog cache
   - Shopping cart state
   - Form state (create/edit product)
   - No deeply nested prop drilling yet

3. **Easy to Test**
   - Mock hooks in Jest
   - Test individual hook behavior
   - No store/provider complexity

4. **Type Safety**
   - Full TypeScript support
   - Compile-time type checking
   - IntelliSense works great

5. **Easy Migration Path**
   - Can migrate to Redux/Zustand later if needed
   - Hooks can be wrapped in context providers
   - No locked-in patterns

### ✅ Why localStorage for Persistence?

1. **Simple Authentication**
   - Store JWT token for API calls
   - Store user context (id, username, name)
   - Survives page reloads

2. **Security Adequate for MVP**
   - httpOnly cookies better for production
   - localStorage is XSS-vulnerable but OK for internal admin
   - Future: migrate to httpOnly with backend-rendered pages

3. **Offline Support**
   - Cached products available offline
   - User can view data without API
   - Mutations fail gracefully when offline

### ✅ Why Custom Hooks over Context API?

**Context API Issues for Data:**
```typescript
// ❌ Context creates re-render cascades
// Every value change re-renders entire tree
<ProductContext.Provider value={{ products, loading, error }}>
  {children}
</ProductContext.Provider>
```

**Custom Hooks Are Better:**
```typescript
// ✅ Component only re-renders when its state changes
// Cleaner separation of concerns
const { products, loading } = useProducts();
```

---

## State Management Patterns

### 1. Authentication State

```typescript
interface AuthState {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Stored in localStorage:
// - AUTH_STORAGE_KEYS.ADMIN_TOKEN (JWT)
// - AUTH_STORAGE_KEYS.ADMIN_USER (user object)
```

### 2. Data Caching

**Strategy:** Cache with manual refresh
```typescript
const { products, loading, error, fetchProducts } = useProducts();

// Data cached until:
// - Component unmounts
// - User manually calls fetchProducts()
// - User clicks refresh button
```

**Alternative (Future):** SWR or React Query
```typescript
// When caching becomes complex:
import useSWR from 'swr';

const { data: products } = useSWR('/api/products', fetcher);
```

### 3. Form State

**Local useState for forms** (not global)
```typescript
const [formData, setFormData] = useState({
  name: '',
  price: 0,
  category: '',
  // ...
});

// Keep form state local unless shared across multiple routes
```

### 4. Shopping Cart State

**localStorage for persistence:**
```typescript
const [cart, setCart] = useState<CartItem[]>([]);

useEffect(() => {
  // Load from localStorage on mount
  const saved = localStorage.getItem('cart');
  if (saved) setCart(JSON.parse(saved));
}, []);

useEffect(() => {
  // Save to localStorage on change
  localStorage.setItem('cart', JSON.stringify(cart));
}, [cart]);
```

---

## Fallback Strategy (Offline)

### When API Unavailable

```typescript
const fetchProducts = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/products`);
    if (!response.ok) throw new Error('API error');
    return await response.json();
  } catch (error) {
    // Fallback: Try sessionStorage cache
    const cached = sessionStorage.getItem('products_cache');
    if (cached) {
      setError('Using cached data');
      return JSON.parse(cached);
    }

    // Last resort: Empty array
    setError('No data available offline');
    return [];
  }
};
```

---

## Alternatives Considered

### Option A: Redux (Rejected)
- **Enterprise-ready** ✓ but overkill for MVP
- **Boilerplate heavy** ✗ slows development
- **DevTools** ✓ but not needed yet
- **Learning curve** ✗ for new developers

### Option B: Zustand (Partially considered)
- **Minimal boilerplate** ✓
- **Good performance** ✓
- **Still over-engineered** ✗ for MVP
- **Future option** if complexity grows

### Option C: Context API (Partially considered)
- **Built-in to React** ✓
- **Re-render cascades** ✗ performance issues
- **Not ideal for data** ✗ better for theme/settings

### Option D: React Hooks + Custom Hooks (SELECTED) ✅
- **Minimal setup** ✅
- **MVP-perfect** ✅
- **Easy to test** ✅
- **Clear migration path** ✅ to Redux/Zustand if needed

---

## Code Organization

```
app/src/
├── hooks/
│   ├── useAdminAuth.ts      # Authentication
│   ├── useProducts.ts       # Product catalog
│   ├── useCategories.ts     # Categories
│   ├── useCart.tsx          # Shopping cart
│   ├── useOrders.ts         # Orders
│   └── index.ts             # Export all hooks
├── services/
│   ├── auth.ts              # API auth calls
│   ├── products.ts          # API product calls
│   ├── orders.ts            # API order calls
│   └── api.ts               # Common API setup
├── types/
│   └── index.ts             # TypeScript interfaces
└── components/
    ├── admin/
    │   ├── AdminLogin.tsx   # Login page
    │   ├── ProductForm.tsx  # Create/edit product
    │   └── Dashboard.tsx    # Admin dashboard
    └── ...
```

---

## Testing Strategy

**Mock Hooks:**
```typescript
jest.mock('../hooks/useProducts', () => ({
  useProducts: jest.fn(() => ({
    products: [{ id: '1', name: 'Test' }],
    loading: false,
    error: null,
    addProduct: jest.fn(),
  })),
}));
```

**Test Hook Behavior:**
```typescript
test('login updates user state', async () => {
  const { result } = renderHook(() => useAdminAuth());

  await act(async () => {
    await result.current.login('admin', 'admin123');
  });

  expect(result.current.user).toBeDefined();
  expect(localStorage.getItem(AUTH_STORAGE_KEYS.ADMIN_TOKEN)).toBeTruthy();
});
```

---

## Migration Path

### Phase 1: MVP (Current)
- React Hooks + localStorage ✅
- Custom hooks for each domain
- No global state management

### Phase 2: Growth (When needed)
```
If prop drilling becomes painful → Use Context API for themes/settings
If data fetching complexity grows → Use React Query or SWR
If state management complex → Consider Zustand or Redux
```

### Phase 3: Scale (Production)
```
Consider full migration to:
- React Query for server state
- Zustand for client state
- Context API for themes/settings
```

---

## Performance Considerations

### ✅ Optimization Strategies

1. **useCallback for memoized functions**
   ```typescript
   const addProduct = useCallback(async (data) => {
     // Only recreated when dependencies change
   }, [dependencies]);
   ```

2. **useMemo for expensive computations**
   ```typescript
   const expensiveValue = useMemo(() => {
     return products.filter(...).sort(...);
   }, [products]);
   ```

3. **Code splitting for admin routes**
   ```typescript
   const AdminDashboard = lazy(() => import('./AdminDashboard'));
   ```

4. **Lazy loading for images**
   ```typescript
   <img loading="lazy" src={url} alt={name} />
   ```

---

## Related ADRs
- ADR-001: Token Unification Strategy
- ADR-002: Database Layer Architecture
- ADR-004: API Design (REST with JWT)

---

## Sign-Off

- ✅ **Pattern Established:** 2026-01-28
- ✅ **useAdminAuth Implemented:** 2026-02-09
- ✅ **useProducts Implemented:** 2026-02-09
- ✅ **useCart Implemented:** 2026-02-09
- ✅ **Documented:** This ADR

---

## References
- `app/src/hooks/` — Custom hook implementations
- `app/src/services/` — API service layer
- [React Hooks Documentation](https://react.dev/reference/react)
- [localStorage vs sessionStorage Guide](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
