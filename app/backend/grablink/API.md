# Grablink REST API

REST API for the Grablink application - a simple URL sharing system with 6-digit codes.

## Endpoints

### 1. Create Share (POST /share)
Device A sends a URL to generate a unique 6-digit code.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "code": "482910",
  "url": "https://example.com",
  "expiresAt": "2026-07-05T12:05:00.000Z"
}
```

**Status Codes:**
- `201 Created` - Share created successfully
- `400 Bad Request` - Invalid URL format

---

### 2. Access Share (GET /share/:code)
Device B retrieves the URL and metadata using the 6-digit code.

**Request:**
```
GET /share/482910
```

**Response:**
```json
{
  "code": "482910",
  "url": "https://example.com",
  "title": "Example Website",
  "expiresAt": "2026-07-05T12:05:00.000Z",
  "createdAt": "2026-07-05T12:00:00.000Z",
  "qrCode": "data:image/svg+xml;base64,..."
}
```

**Status Codes:**
- `200 OK` - Share retrieved successfully
- `404 Not Found` - Code not found or expired
- `400 Bad Request` - Code has expired

---

## Features

### Code Generation
- 6-digit numeric code (100000-999999)
- Unique per share request
- 5-minute expiration window

### Data Enrichment
- URL title extraction (handled by Lambda)
- QR code generation for easy mobile access
- Metadata tracking and logging

### Monitoring & Logging
All events are logged in JSON format for CloudWatch integration:
- Share creation events
- Share access events
- Expired code cleanup events

### Automatic Cleanup
Expired shares are cleaned up automatically every minute.

---

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd app/backend/grablink

# Install dependencies
npm install

# Set environment variables
cp .env.example .env

# Start development server
npm run start:dev
```

### Environment Variables

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=debug
```

---

## Development

### Build
```bash
npm run build
```

### Testing
```bash
npm run test
npm run test:e2e
```

### Linting
```bash
npm run lint
```

---

## Architecture

The API follows the Grablink architecture with:

1. **Synchronous Operations (API Layer)**
   - Instant 6-digit code generation
   - Code expiration management
   - Share metadata retrieval

2. **Asynchronous Operations (SQS + Lambda)**
   - URL title extraction (web scraping)
   - Metadata enrichment

3. **Data Persistence**
   - In-memory storage (development)
   - PostgreSQL RDS (production via TypeORM)

---

## Next Steps

- [ ] Integrate TypeORM with PostgreSQL
- [ ] Implement AWS SQS integration
- [ ] Add QR code generation library (qrcode/fast-qr)
- [ ] Create Lambda function for URL enrichment
- [ ] Set up CloudWatch logging
- [ ] Add API authentication/rate limiting
- [ ] Create frontend integration tests
