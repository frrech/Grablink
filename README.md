# 🔗 Grablink

**Temporary link sharing system using 6-digit codes**

Share URLs instantly with a unique 6-digit code that others can use to retrieve the link from any device. Perfect for quickly sharing links between your phone, tablet, and desktop without remembering URLs.

---

## ✨ Features

- **6-digit Share Codes**: Generate unique codes (e.g., `123456`) for every share
- **URL Persistence**: Save shared links to PostgreSQL database
- **5-Minute Expiration**: Shares automatically expire and are cleaned up
- **Access Tracking**: Track how many times each link was accessed
- **QR Code Generation**: Automatically generate QR codes for easy scanning
- **Metadata Enrichment**: Extract page titles from shared URLs (via AWS Lambda)
- **Two-Device UI**: Separate interfaces for sharing (Device A) and accessing (Device B)
- **Real-time Monitoring**: pgAdmin interface for database inspection
- **Automatic Cleanup**: Scheduled task removes expired shares every minute

---

## 🛠️ Technology Stack

### Backend
- **Framework**: NestJS 11.0.1 (TypeScript)
- **Database**: PostgreSQL 16 with TypeORM 0.3.19
- **Validation**: class-validator + class-transformer
- **Scheduling**: @nestjs/schedule (cleanup every 60 seconds)
- **ORM**: TypeORM with Repository pattern
- **Runtime**: Node.js

### Frontend
- **Framework**: React 19.2.7 with Vite 8.1.1
- **Language**: TypeScript
- **Styling**: CSS with gradient UI
- **HTTP Client**: Fetch API

### Infrastructure
- **Database**: PostgreSQL 16 (Docker)
- **Admin Panel**: pgAdmin 4 (Docker)
- **Container**: Docker Compose

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 18+
- npm 9+
- Docker & Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   cd Grablink
   ```

2. **Start PostgreSQL & pgAdmin**
   ```bash
   docker compose up -d
   ```

3. **Install backend dependencies**
   ```bash
   cd app/backend/grablink
   npm install --legacy-peer-deps
   ```

4. **Install frontend dependencies**
   ```bash
   cd ../../frontend/grablink-front
   npm install
   ```

5. **Start backend (from `app/backend/grablink`)**
   ```bash
   npm run start:dev
   ```

6. **Start frontend (from `app/frontend/grablink-front` in new terminal)**
   ```bash
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173
   - API: http://localhost:3000
   - pgAdmin: http://localhost:5050

✅ Done! The application is now running with persistent PostgreSQL storage.

---

## 📱 How to Use

### Share a Link (Device A)
1. Open http://localhost:5173
2. Click **"Share Link"** tab
3. Paste the URL you want to share
4. Click **"Generate Code"**
5. Copy the 6-digit code and share with others

### Access a Link (Device B)
1. Open http://localhost:5173
2. Click **"Access Link"** tab
3. Enter the 6-digit code
4. Click **"Get Link"**
5. View the shared URL with metadata and QR code

---

## 🔌 API Endpoints

### Create Share
```bash
POST /share
Content-Type: application/json

{
  "url": "https://www.example.com"
}

Response (201):
{
  "code": "123456",
  "expiresAt": "2026-07-05T12:05:00Z"
}
```

### Access Share
```bash
GET /share/:code

Response (200):
{
  "code": "123456",
  "url": "https://www.example.com",
  "title": null,
  "createdAt": "2026-07-05T12:00:00Z",
  "expiresAt": "2026-07-05T12:05:00Z",
  "accessCount": 3,
  "qrCodeData": "data:image/png;base64,..."
}
```

**Error Responses:**
- `400 Bad Request` - Invalid URL format
- `404 Not Found` - Code doesn't exist
- `410 Gone` - Share has expired

---

## 🗄️ Database

### Connection Details
- **Host**: localhost
- **Port**: 5432
- **Database**: grablink_db
- **User**: grablink
- **Password**: grablink_password_123

### Schema
```sql
CREATE TABLE shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,
  url TEXT NOT NULL,
  title VARCHAR(255) NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiresAt TIMESTAMP NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  accessCount INTEGER DEFAULT 0,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_shares_code ON shares(code);
CREATE INDEX idx_shares_expiresAt ON shares(expiresAt);
```

### Database Tools

**View via pgAdmin:**
1. Open http://localhost:5050
2. Login: `admin@grablink.local` / `admin`
3. Navigate to Databases → grablink_db → Schemas → public → Tables → shares

**Query via psql CLI:**
```bash
psql -U grablink -d grablink_db -h localhost

# View all shares
SELECT * FROM shares;

# Count active shares
SELECT COUNT(*) FROM shares WHERE expiresAt > NOW();

# Delete all shares
DELETE FROM shares;
```

---

## 🧪 Testing

### Unit Tests
```bash
cd app/backend/grablink
npm run test
```

### E2E Tests
```bash
# Ensure PostgreSQL is running with: docker compose up -d
cd app/backend/grablink
npm run test:e2e
```

**Test Coverage:**
- ✅ POST /share - Create share validation
- ✅ GET /share/:code - Retrieve existing shares
- ✅ Access counting - Verify increments work
- ✅ 404 errors - Non-existent codes
- ✅ Health check - Base endpoint

---

## 📁 Project Structure

```
Grablink/
├── README.md (this file)
├── docker-compose.yml (PostgreSQL + pgAdmin)
├── docs/
│   ├── API.md (detailed endpoint documentation)
│   ├── DATABASE_SETUP.md (database configuration guide)
│   └── DATABASE_QUICK_START.md (quick reference)
├── app/
│   ├── backend/grablink/ (NestJS API)
│   │   ├── src/
│   │   │   ├── share/ (Share feature module)
│   │   │   │   ├── entities/ (TypeORM entities)
│   │   │   │   ├── dto/ (request/response schemas)
│   │   │   │   ├── share.service.ts (business logic)
│   │   │   │   ├── share.controller.ts (HTTP handlers)
│   │   │   │   └── share.scheduler.ts (cleanup tasks)
│   │   │   ├── database/
│   │   │   │   ├── database.config.ts (TypeORM config)
│   │   │   │   └── migrations/ (schema migrations)
│   │   │   └── app.module.ts (root module)
│   │   ├── test/
│   │   │   ├── app.e2e-spec.ts (end-to-end tests)
│   │   │   └── jest-e2e.json (Jest config)
│   │   ├── .env (development credentials)
│   │   ├── package.json (dependencies)
│   │   └── tsconfig.json (TypeScript config)
│   └── frontend/grablink-front/ (React + Vite)
│       ├── src/
│       │   ├── components/
│       │   │   ├── ShareDevice.tsx (share interface)
│       │   │   └── AccessDevice.tsx (access interface)
│       │   ├── services/
│       │   │   └── api.ts (HTTP client)
│       │   ├── App.tsx (main component)
│       │   └── main.tsx (entry point)
│       ├── .env (API URL)
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
```

---

## ⚙️ Configuration

### Backend Environment Variables (`.env`)
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=grablink
DATABASE_PASSWORD=grablink_password_123
DATABASE_NAME=grablink_db

# Application
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables (`.env`)
```env
VITE_API_URL=http://localhost:3000
```

---

## 🐛 Troubleshooting

### PostgreSQL Connection Error
```
ERROR: Unable to connect to the database
```
**Solution:**
```bash
docker compose down -v  # Remove volume
docker compose up -d    # Start fresh
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:**
```bash
# Find and kill process using port
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows (find PID)
taskkill /PID <PID> /F         # Windows (kill)
```

### CORS Errors in Frontend
- Verify backend is running on http://localhost:3000
- Check `VITE_API_URL` in `.env`
- Ensure CORS is enabled in NestJS (default: enabled)

### Tests Timeout
- Ensure PostgreSQL is running: `docker compose ps`
- Increase Jest timeout: Add `, 30000` to test function
- Check database credentials in `.env`

---

## 📦 Dependencies

### Backend
- `@nestjs/common@11.0.1` - NestJS framework
- `@nestjs/core@11.0.1` - Core NestJS
- `@nestjs/typeorm@10.1.1` - TypeORM integration
- `@nestjs/schedule@4.1.0` - Scheduling
- `typeorm@0.3.19` - ORM
- `pg@8.11.3` - PostgreSQL driver
- `class-validator@0.14.0` - DTO validation
- `class-transformer@0.5.1` - DTO transformation

### Frontend
- `react@19.2.7` - UI library
- `vite@8.1.1` - Build tool
- `typescript@5.6.2` - Language

---

## 🚦 Development Commands

### Backend
```bash
cd app/backend/grablink

npm run build          # Compile TypeScript
npm run start          # Production mode
npm run start:dev      # Development with watch
npm run test           # Unit tests
npm run test:e2e       # End-to-end tests
npm run lint           # ESLint check
```

### Frontend
```bash
cd app/frontend/grablink-front

npm run dev            # Development server
npm run build          # Production build
npm run preview        # Preview production build
npm run lint           # ESLint check
```

---

## 🔐 Security Considerations

⚠️ **Current Implementation (Development Only)**
- No authentication/authorization
- No rate limiting
- No input sanitization beyond validation
- Plain HTTP (no HTTPS)

✅ **For Production Deployment**
- Add API key authentication
- Implement rate limiting per IP
- Use HTTPS/TLS encryption
- Add CORS whitelist
- Implement database backups
- Add DDoS protection
- Sanitize all user input
- Use AWS Secrets Manager for credentials

---

## 📚 Additional Documentation

- [API Documentation](docs/API.md) - Detailed endpoint specs
- [Database Setup Guide](docs/DATABASE_SETUP.md) - Database configuration
- [Database Quick Reference](docs/DATABASE_QUICK_START.md) - Quick commands

---

## 🎯 Roadmap

- [x] Basic REST API with 6-digit codes
- [x] React frontend with two interfaces
- [x] PostgreSQL persistence
- [x] Automatic expiration cleanup
- [x] Docker Compose setup
- [ ] AWS RDS PostgreSQL
- [ ] AWS SQS messaging
- [ ] AWS Lambda for URL enrichment
- [ ] CloudWatch logging
- [ ] API authentication/rate limiting
- [ ] Production deployment
- [ ] Mobile app (React Native)
- [ ] Custom expiration times
- [ ] Share history tracking

---

## 👥 Contributing

This project is under active development. For questions or issues, refer to the troubleshooting section above.

---

## 📄 License

This project is provided as-is for personal and educational use.

---

**Built with ❤️ using NestJS, React, and PostgreSQL**
