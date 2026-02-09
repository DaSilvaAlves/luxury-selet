# Security Configuration Guide - Luxury Selet

**Updated:** 2026-02-09
**Status:** 4 Critical Security Fixes Implemented ✅

---

## Overview

This document explains the security improvements made to Luxury Selet backend and how to configure them.

### Security Fixes Implemented

1. ✅ **Helmet Security Headers** — Added via helmet middleware
2. ✅ **CORS Configuration** — Whitelist specific origins instead of allowing all
3. ✅ **Rate Limiting** — Protect login endpoint from brute force
4. ✅ **Bcrypt Password Hashing** — Secure password comparison

---

## 1. Helmet Security Headers

### What It Does

Helmet automatically sets HTTP security headers that protect against common vulnerabilities:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0
Strict-Transport-Security: max-age=15552000; includeSubDomains
```

### Configuration

```typescript
import helmet from 'helmet';

app.use(helmet());
```

### Environment

- **Development:** Works automatically ✅
- **Production:** Works automatically ✅

---

## 2. CORS Configuration

### What Changed

**Before (Insecure):**
```typescript
app.use(cors());  // Allows ANY origin
```

**After (Secure):**
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5176',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Environment Variables

Add to your `.env` file:

```bash
# CORS Configuration
FRONTEND_URL=http://localhost:5176  # For development
# In production: FRONTEND_URL=https://yourdomain.com
```

### Testing CORS

**Allowed:**
```bash
curl -H "Origin: http://localhost:5176" \
     -H "Access-Control-Request-Method: POST" \
     http://localhost:3001/api/admin/login
```

**Rejected (different origin):**
```bash
curl -H "Origin: https://attacker.com" \
     http://localhost:3001/api/admin/login
# Returns: No 'Access-Control-Allow-Origin' header
```

---

## 3. Rate Limiting (Login Endpoint)

### What It Does

Prevents brute force attacks by limiting login attempts:
- **Max attempts:** 5 per IP address
- **Window:** 15 minutes
- **Disabled:** In development mode

### Configuration

```typescript
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 attempts per IP
  message: 'Too many login attempts, please try again later',
  skip: (req) => process.env.NODE_ENV === 'development'
});

app.post('/api/admin/login', loginLimiter, async (req, res) => {
  // Login handler
});
```

### Testing Rate Limiting

**Test 1: Multiple failed attempts**
```bash
# Attempt 1-4: Should work
for i in {1..4}; do
  curl -X POST http://localhost:3001/api/admin/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"wrong"}'
done

# Attempt 5: Blocked
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrong"}'
# Returns: 429 Too Many Requests
```

### Environment

- **Development:** Rate limiting disabled (all attempts allowed)
- **Production:** Rate limiting enabled (5 attempts per 15 min)

**To disable in production (not recommended):**
```typescript
skip: (req) => true  // Never skip
```

---

## 4. Bcrypt Password Hashing

### What Changed

**Before (Insecure):**
```typescript
if (username === 'admin' && password === 'admin123') {
  // Plaintext password comparison ❌
}
```

**After (Secure):**
```typescript
const expectedHash = process.env.ADMIN_PASSWORD_HASH;
const passwordMatches = await bcrypt.compare(password, expectedHash);

if (username === ADMIN_USERNAME && passwordMatches) {
  // Secure bcrypt comparison ✅
}
```

### How to Configure

#### Option 1: Use Default (For Development)

For MVP development, a default hash of 'admin123' is included:

```bash
npm run dev  # Uses default hash for 'admin123'
```

#### Option 2: Set Custom Password (Recommended for Production)

**Step 1: Generate hash**

```bash
# Generate bcrypt hash for your password
node backend/scripts/generate-password-hash.js "YourSecurePassword123!"
```

**Output:**
```
✅ Password hash generated successfully!

Add this to your .env file:
ADMIN_PASSWORD_HASH="$2b$10$..."
ADMIN_USERNAME="admin"
```

**Step 2: Add to `.env`**

```bash
# backend/.env
ADMIN_PASSWORD_HASH="$2b$10$j7d.4C8zXvMWaFR9dV5MmuAKIUjxJJEPPrxbzMXhMUzAmhFkGKKGa"
ADMIN_USERNAME="admin"
```

**Step 3: Restart server**

```bash
npm run dev
```

**Step 4: Test login**

```bash
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "YourSecurePassword123!"
  }'

# Returns: { token: "...", user: {...} }
```

### Security Best Practices

1. **Never hardcode passwords** ✅ (using bcrypt hashes instead)
2. **Strong passwords** — At least 12 characters, mixed case, numbers, symbols
3. **Rotate passwords regularly** — Every 90 days in production
4. **Environment variables** — Store hashes in `.env`, not source code

### Bcrypt Verification

Bcrypt hashes are one-way and cannot be reversed:

```typescript
// ✅ Safe: Can only verify, not reverse
const isValid = await bcrypt.compare('password', '$2b$10$...');

// ❌ Wrong: Cannot reverse a hash
const password = bcrypt.decrypt(hash);  // Does not exist!
```

---

## Environment Variables Summary

### Development Setup

```bash
# backend/.env (Development)
PORT=3001
NODE_ENV=development
JWT_SECRET=dev-secret-key-change-in-production
FRONTEND_URL=http://localhost:5176

# Optional (uses defaults if not set):
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$j7d.4C8zXvMWaFR9dV5MmuAKIUjxJJEPPrxbzMXhMUzAmhFkGKKGa
```

### Production Setup

```bash
# backend/.env (Production - use strong values!)
PORT=3001
NODE_ENV=production
JWT_SECRET=<generate-strong-random-secret>
FRONTEND_URL=https://yourdomain.com

# Generate strong password hash:
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<bcrypt-hash-of-strong-password>

# Database (Supabase)
DATABASE_URL=postgresql://user:pass@host:5432/db
```

**Generate strong JWT_SECRET:**
```bash
# Using Node.js crypto
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 32
```

---

## Testing All Security Features

### 1. Test Helmet Headers

```bash
curl -i http://localhost:3001/api/products

# Look for headers:
# X-Content-Type-Options: nosniff ✅
# X-Frame-Options: DENY ✅
# Strict-Transport-Security: ... ✅
```

### 2. Test CORS

```bash
# Allowed origin
curl -H "Origin: http://localhost:5176" \
     http://localhost:3001/api/products
# Returns: Access-Control-Allow-Origin: http://localhost:5176 ✅

# Rejected origin
curl -H "Origin: https://attacker.com" \
     http://localhost:3001/api/products
# Returns: No Access-Control-Allow-Origin header ✅
```

### 3. Test Rate Limiting

```bash
# 5 attempts should work
for i in {1..5}; do
  curl -X POST http://localhost:3001/api/admin/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"wrong"}' -s \
    | head -1
  echo "Attempt $i"
done

# 6th attempt should be blocked (development has it disabled, but production enables it)
```

### 4. Test Bcrypt Password

```bash
# Correct password
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# Returns: { token: "...", user: {...} } ✅

# Wrong password
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrong"}'
# Returns: 401 Unauthorized ✅
```

---

## Migration from Old Setup

If you have existing code using the old setup:

### Before

```typescript
if (username === 'admin' && password === 'admin123') {
  // Login allowed
}
```

### After

```typescript
const passwordMatches = await bcrypt.compare(password, expectedHash);
if (username === ADMIN_USERNAME && passwordMatches) {
  // Login allowed
}
```

### No Frontend Changes Needed! ✅

The API contract remains the same:
```typescript
POST /api/admin/login
Request: { username, password }
Response: { token, user }
```

Frontend code doesn't change, only backend security improves.

---

## Troubleshooting

### Issue: "JWT_SECRET not configured" error

**Solution:**
Add to `.env`:
```bash
JWT_SECRET=your-secret-key
```

### Issue: "ADMIN_PASSWORD_HASH not found"

**Solution:**
Generate hash:
```bash
node backend/scripts/generate-password-hash.js "admin123"
```

Then add to `.env`.

### Issue: CORS error "No Access-Control-Allow-Origin"

**Solution:**
Check FRONTEND_URL in `.env`:
```bash
FRONTEND_URL=http://localhost:5176  # Must match your frontend origin
```

### Issue: "Too many login attempts" after 5 tries

**Expected behavior in production!** ✅

Wait 15 minutes or:
- **In development:** Rate limiting is disabled automatically
- **In production:** Wait 15 minutes or reset IP with VPN

---

## Security Checklist

Before deploying to production:

- [ ] JWT_SECRET is set to strong random value
- [ ] ADMIN_PASSWORD_HASH is generated with bcrypt
- [ ] FRONTEND_URL matches your production domain
- [ ] NODE_ENV=production
- [ ] HTTPS is enabled (via Vercel/Railway)
- [ ] Database credentials secure
- [ ] Rate limiting is enabled
- [ ] Helmet headers are present
- [ ] CORS only allows your domain

---

## References

- [Helmet.js Documentation](https://helmetjs.github.io/)
- [express-rate-limit](https://github.com/nfriedly/express-rate-limit)
- [bcryptjs vs bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)

---

## Support

For security questions or concerns, please:
1. Review the OWASP-TOP-10-REVIEW.md document
2. Check the DEPENDENCY-AUDIT-REPORT.md
3. Consult the security configuration options above
