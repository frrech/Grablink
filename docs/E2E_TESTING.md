# End-to-End Testing Guide

## Test Summary

The e2e test suite validates the complete Grablink API workflow including share creation, retrieval, access counting, and error handling.

### Test Suites

#### 1. Share Endpoints (5 tests)
- ✅ **POST /share** - Create new share with valid URL
  - Validates: Response includes unique 6-digit code
  - Validates: Response includes expiration timestamp
  - Validates: Code format matches `^\d{6}$` (6 digits)

- ✅ **POST /share** - Reject invalid URL
  - Validates: Returns 400 Bad Request
  - Validates: Error message for invalid format

- ✅ **GET /share/:code** - Retrieve existing share
  - Validates: Returns 200 OK
  - Validates: Response includes original URL
  - Validates: Response includes share metadata
  - Validates: Response includes QR code data

- ✅ **GET /share/:code** - Increment access count
  - Validates: Access count increases on each request
  - Validates: Count is persisted correctly

- ✅ **GET /share/:code** - Return 404 for non-existent code
  - Validates: Returns 404 Not Found
  - Validates: No error on invalid code format

#### 2. Health Check (1 test)
- ✅ **GET /** - Health status endpoint
  - Validates: Returns 200 OK
  - Validates: Returns "Hello World!" text

---

## Prerequisites for Running Tests

### Requirements
- Node.js 18+
- npm 9+
- Docker & Docker Compose (for database)
- PostgreSQL connection to localhost:5432

### Environment Setup
```bash
# Terminal 1: Start database
cd Grablink
docker compose up -d

# Wait for PostgreSQL to be ready (10-15 seconds)
# Verify with: docker compose ps
```

---

## Running the Tests

### Option 1: Development Mode (Recommended)

**Terminal 1** - Start PostgreSQL
```bash
cd Grablink
docker compose up -d
```

**Terminal 2** - Run e2e tests
```bash
cd app/backend/grablink
npm run test:e2e
```

Expected output:
```
PASS  test/app.e2e-spec.ts
  Grablink API (e2e)
    Share Endpoints
      ✓ POST /share - should create a new share with valid URL (XXms)
      ✓ POST /share - should reject invalid URL (XXms)
      ✓ GET /share/:code - should retrieve existing share (XXms)
      ✓ GET /share/:code - should increment access count (XXms)
      ✓ GET /share/:code - should return 404 for non-existent code (XXms)
    Health Check
      ✓ GET / - should return health status (XXms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
```

### Option 2: Run All Tests
```bash
cd app/backend/grablink

# Unit tests
npm run test

# E2E tests (requires database)
npm run test:e2e

# Both
npm run test && npm run test:e2e
```

---

## Test Database Configuration

### For Development (PostgreSQL)
The tests use the default PostgreSQL configuration from `.env`:
- Host: `localhost`
- Port: `5432`
- Database: `grablink_db`
- User: `grablink`
- Password: `grablink_password_123`

### For CI/CD (Future)
Tests should use a test database (`grablink_test`) separate from development.

---

## Test Flow Diagram

```
START
  │
  ├─► Create Share with URL
  │   └─► Verify 6-digit code
  │   └─► Verify expiration time
  │
  ├─► Create Share with Invalid URL
  │   └─► Verify 400 error
  │
  ├─► Retrieve Share by Code
  │   └─► Verify URL matches
  │   └─► Verify metadata present
  │   └─► Verify QR code generated
  │
  ├─► Access Count Tracking
  │   ├─► First access (count = 1)
  │   └─► Second access (count = 2)
  │
  ├─► Non-Existent Code
  │   └─► Verify 404 error
  │
  ├─► Health Check
  │   └─► Verify endpoint responding
  │
  END ✓
```

---

## Debugging Tests

### Test Timeout Issues
```bash
# Increase timeout to 30 seconds
npm run test:e2e -- --testTimeout=30000
```

### See Detailed Logs
```bash
# Run tests with verbose output
npm run test:e2e -- --verbose
```

### Run Specific Test
```bash
# Run only share endpoints tests
npm run test:e2e -- --testNamePattern="Share Endpoints"

# Run only health check
npm run test:e2e -- --testNamePattern="Health Check"
```

### Debug with Node Inspector
```bash
# Run with debugging enabled
node --inspect-brk ./node_modules/.bin/jest --config ./test/jest-e2e.json --runInBand
```

---

## Troubleshooting

### "Unable to connect to the database"
**Problem**: PostgreSQL not running
```bash
# Check if containers are running
docker compose ps

# Start PostgreSQL if not running
docker compose up -d

# Check logs
docker compose logs postgres
```

### "ECONNREFUSED 127.0.0.1:5432"
**Problem**: Wrong connection credentials
```bash
# Verify .env file
cat .env | grep DATABASE_

# Test connection manually
psql -U grablink -d grablink_db -h localhost -c "SELECT 1"
```

### "Jest timeout exceeded"
**Problem**: Database initialization taking too long
```bash
# Increase Jest timeout
# In jest-e2e.json, add: "testTimeout": 30000
```

### "Exceeded timeout of 5000 ms"
**Problem**: beforeAll hook timeout
```bash
# Already fixed in updated test file - beforeAll has 30000ms timeout
```

---

## Test Coverage

| Endpoint | Method | Status | Tests |
|----------|--------|--------|-------|
| / | GET | ✅ | 1 |
| /share | POST | ✅ | 2 |
| /share/:code | GET | ✅ | 3 |
| **Total** | | | **6** |

---

## Performance Expectations

| Metric | Expected | Acceptable |
|--------|----------|------------|
| Total Time | 5-10s | < 30s |
| Per Test | 200-500ms | < 2s |
| Database Init | 2-3s | < 10s |

---

## Integration with CI/CD

For GitHub Actions / GitLab CI, use:

```yaml
# .github/workflows/test.yml
- name: Run E2E Tests
  run: |
    docker compose up -d
    sleep 10  # Wait for database
    cd app/backend/grablink
    npm install --legacy-peer-deps
    npm run test:e2e
```

---

## Mocking Database (Future)

For unit tests that don't require a database:
```typescript
// Example: Mock repository in unit tests
const mockShareRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
};
```

---

**Last Updated**: 2026-07-05
**Test Framework**: Jest with Supertest
**Database**: PostgreSQL 16
