# API Endpoints Reference

**Phase 1 Output** | **Date**: 2025-11-05 | **Status**: Complete

This document provides a detailed reference for all API endpoints in the Quote System MVP.

---

## Base URL

```
Development:  http://localhost:3000
Production:   https://api.quote-system.example.com
```

---

## Authentication Endpoints

### 1. POST /api/auth/register

**Description**: Register a new user account

**Request**:

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Query Parameters**: None

**Request Body**:

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| `email` | string | Yes | Valid email format, must not exist |
| `password` | string | Yes | 8+ chars, uppercase, lowercase, digit |

**Success Response (201)**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "message": "Registration successful. Please log in."
}
```

**Error Responses**:

- **400 Bad Request** - Validation error:
  ```json
  {
    "error": "Validation failed",
    "details": {
      "email": ["Invalid email format"],
      "password": ["Password must contain uppercase letter"]
    }
  }
  ```

- **409 Conflict** - Email already exists:
  ```json
  {
    "error": "This email is already registered"
  }
  ```

**Notes**:
- Password is hashed with bcryptjs before storage.
- User must log in separately after registration.

---

### 2. POST /api/auth/login

**Description**: Authenticate user and create session

**Request**:

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Query Parameters**: None

**Request Body**:

| Field | Type | Required |
|-------|------|----------|
| `email` | string | Yes |
| `password` | string | Yes |

**Success Response (200)**:

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com"
  },
  "message": "Login successful"
}
```

**Session**:
- JWT token stored in HTTP-only cookie (NextAuth.js).
- Token expires after 30 days (configurable).
- User remains logged in across page refreshes.

**Error Responses**:

- **401 Unauthorized** - Invalid credentials:
  ```json
  {
    "error": "Invalid email or password"
  }
  ```

**Notes**:
- NextAuth.js automatically creates session cookie on successful login.
- Subsequent requests include session in Authorization header or cookie.

---

### 3. POST /api/auth/logout

**Description**: Invalidate user session

**Request**:

```bash
POST /api/auth/logout
```

**Query Parameters**: None

**Request Body**: Empty

**Authentication**: Required (session cookie)

**Success Response (200)**:

```json
{
  "message": "Logout successful"
}
```

**Notes**:
- Clears session cookie.
- User is redirected to login page.

---

## Product Endpoints

### 4. GET /api/products

**Description**: List all products owned by the authenticated user

**Request**:

```bash
GET /api/products
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters**: None

**Authentication**: Required (session)

**Success Response (200)**:

```json
{
  "products": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Office Chair",
      "description": "Ergonomic office chair with lumbar support",
      "category": "Furniture",
      "unit_price": 5000.00,
      "created_at": "2025-11-05T10:30:00Z",
      "updated_at": "2025-11-05T10:30:00Z"
    }
  ]
}
```

**Sorting**: By `created_at` DESC (newest first)

**Error Responses**:

- **401 Unauthorized** - No active session:
  ```json
  {
    "error": "Unauthorized"
  }
  ```

**Notes**:
- Returns only products owned by the authenticated user.
- Filters applied server-side using `user_id` from session.

---

### 5. POST /api/products

**Description**: Create a new product

**Request**:

```bash
POST /api/products
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "name": "Office Chair",
  "description": "Ergonomic office chair with lumbar support",
  "category": "Furniture",
  "unit_price": 5000.00
}
```

**Request Body**:

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| `name` | string | Yes | 1-255 chars |
| `description` | string | Yes | 1-2000 chars |
| `category` | string | Yes | 1-100 chars |
| `unit_price` | number | Yes | > 0, 2 decimal places |

**Authentication**: Required (session)

**Success Response (201)**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Office Chair",
  "description": "Ergonomic office chair with lumbar support",
  "category": "Furniture",
  "unit_price": 5000.00,
  "created_at": "2025-11-05T10:30:00Z",
  "updated_at": "2025-11-05T10:30:00Z"
}
```

**Error Responses**:

- **400 Bad Request** - Validation error:
  ```json
  {
    "error": "Validation failed",
    "details": {
      "unit_price": ["Price must be positive"]
    }
  }
  ```

- **401 Unauthorized** - No active session

**Notes**:
- Product is automatically assigned to the authenticated user.
- Unit price stored as DECIMAL(10, 2) for precision.

---

### 6. GET /api/products/{id}

**Description**: Get a specific product by ID

**Request**:

```bash
GET /api/products/550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <JWT_TOKEN>
```

**Path Parameters**:

| Parameter | Type | Required |
|-----------|------|----------|
| `id` | string (UUID) | Yes |

**Authentication**: Required (session)

**Success Response (200)**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Office Chair",
  "description": "Ergonomic office chair with lumbar support",
  "category": "Furniture",
  "unit_price": 5000.00,
  "created_at": "2025-11-05T10:30:00Z",
  "updated_at": "2025-11-05T10:30:00Z"
}
```

**Error Responses**:

- **404 Not Found** - Product doesn't exist or user doesn't own it:
  ```json
  {
    "error": "Product not found"
  }
  ```

- **401 Unauthorized** - No active session

---

## Quote Endpoints

### 7. GET /api/quotes

**Description**: Get user's complete quote history

**Request**:

```bash
GET /api/quotes
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters**: None

**Authentication**: Required (session)

**Success Response (200)**:

```json
{
  "quotes": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "product_id": "550e8400-e29b-41d4-a716-446655440001",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "quantity": 10,
      "quote_value": 50000.00,
      "created_at": "2025-11-05T11:00:00Z",
      "product": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Office Chair",
        "description": "Ergonomic office chair with lumbar support",
        "category": "Furniture",
        "unit_price": 5000.00,
        "created_at": "2025-11-05T10:30:00Z",
        "updated_at": "2025-11-05T10:30:00Z"
      }
    }
  ]
}
```

**Sorting**: By `created_at` DESC (newest first)

**Error Responses**:

- **401 Unauthorized** - No active session:
  ```json
  {
    "error": "Unauthorized"
  }
  ```

**Notes**:
- Returns quote history for the authenticated user only.
- Includes full product details for each quote.
- Useful for "Quote History" page.

---

### 8. POST /api/quotes

**Description**: Create a new quote for a product

**Request**:

```bash
POST /api/quotes
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "product_id": "550e8400-e29b-41d4-a716-446655440001",
  "quantity": 10
}
```

**Request Body**:

| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| `product_id` | string (UUID) | Yes | Must reference an existing product owned by user |
| `quantity` | integer | Yes | >= 1 |

**Authentication**: Required (session)

**Success Response (201)**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "product_id": "550e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "quantity": 10,
  "quote_value": 50000.00,
  "created_at": "2025-11-05T11:00:00Z"
}
```

**Calculation**:

```
quote_value = product.unit_price × quantity
            = 5000.00 × 10
            = 50000.00
```

**Error Responses**:

- **400 Bad Request** - Validation error:
  ```json
  {
    "error": "Validation failed",
    "details": {
      "quantity": ["Quantity must be at least 1"]
    }
  }
  ```

- **404 Not Found** - Product not found or user doesn't own it:
  ```json
  {
    "error": "Product not found"
  }
  ```

- **401 Unauthorized** - No active session

**Notes**:
- Quote value is immutable (stored at creation time).
- If product price changes later, existing quotes retain their original value.
- Quotes are read-only in MVP (no update/delete).

---

### 9. GET /api/quotes/{id}

**Description**: Get a specific quote by ID

**Request**:

```bash
GET /api/quotes/550e8400-e29b-41d4-a716-446655440002
Authorization: Bearer <JWT_TOKEN>
```

**Path Parameters**:

| Parameter | Type | Required |
|-----------|------|----------|
| `id` | string (UUID) | Yes |

**Authentication**: Required (session)

**Success Response (200)**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "product_id": "550e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "quantity": 10,
  "quote_value": 50000.00,
  "created_at": "2025-11-05T11:00:00Z",
  "product": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Office Chair",
    "description": "Ergonomic office chair with lumbar support",
    "category": "Furniture",
    "unit_price": 5000.00,
    "created_at": "2025-11-05T10:30:00Z",
    "updated_at": "2025-11-05T10:30:00Z"
  }
}
```

**Error Responses**:

- **404 Not Found** - Quote doesn't exist or user doesn't own it:
  ```json
  {
    "error": "Quote not found"
  }
  ```

- **401 Unauthorized** - No active session

---

## Error Handling

### Common HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET request |
| 201 | Created | Successful POST request |
| 400 | Bad Request | Invalid input, validation error |
| 401 | Unauthorized | No active session, invalid token |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Email already exists (registration) |
| 500 | Server Error | Internal server error |

### Standard Error Response Format

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field_name": ["Specific error for this field"]
  }
}
```

---

## Authentication & Authorization

### Session Management

- **Method**: NextAuth.js with JWT
- **Session Duration**: 30 days
- **Storage**: HTTP-only cookie (secure)
- **Scope**: User can only access their own products and quotes

### Authorization Checks

All endpoints verify:

1. User has an active session
2. User can only access resources they own

Example (GET /api/products):

```typescript
// Get authenticated user's ID from session
const userId = session.user.id;

// Query only products where user_id matches
const products = await db.query(
  'SELECT * FROM products WHERE user_id = $1',
  [userId]
);
```

---

## Rate Limiting (MVP)

- **Registration/Login**: 5 requests per minute per IP
- **Other endpoints**: No limit (can be added in Phase 2)

Response when rate limited:

```json
{
  "error": "Too many requests",
  "retryAfter": 45
}
```

---

## API Design Principles

1. **RESTful**: Standard HTTP methods (GET, POST, PUT, DELETE)
2. **Stateless**: Each request includes necessary auth info (session)
3. **Idempotent**: Safe to retry requests without side effects
4. **Data Isolation**: Users only see their own data
5. **Consistent**: All responses follow same format

---

## Example Workflows

### Workflow 1: Register and Create Product

```bash
# 1. Register
POST /api/auth/register
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
→ Response: { id: "user-id", email: "john@example.com" }

# 2. Login
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
→ Response: { user: { id: "user-id" }, message: "Login successful" }
→ Session cookie set

# 3. Create Product
POST /api/products
Content-Type: application/json
Authorization: Bearer <token>
{
  "name": "Office Chair",
  "description": "Ergonomic office chair",
  "category": "Furniture",
  "unit_price": 5000.00
}
→ Response: { id: "product-id", ... }
```

### Workflow 2: Create and View Quote

```bash
# 1. Create Quote
POST /api/quotes
{
  "product_id": "product-id",
  "quantity": 10
}
→ Response: { id: "quote-id", quote_value: 50000.00, ... }

# 2. View Quote
GET /api/quotes/quote-id
→ Response: { id: "quote-id", quantity: 10, quote_value: 50000.00, product: {...} }

# 3. View All Quotes
GET /api/quotes
→ Response: { quotes: [{...}, {...}, ...] }
```

---

**API Endpoints Reference Complete**: All endpoints documented. Ready for quickstart and implementation.
