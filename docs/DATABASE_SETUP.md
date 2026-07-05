# Database Setup Guide

## Overview

Grablink now uses PostgreSQL with TypeORM for data persistence. This replaces the in-memory storage used during development.

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL 12+ (if running without Docker)

## Quick Start with Docker

### 1. Start PostgreSQL and pgAdmin

From the project root directory, run:

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL**: `localhost:5432`
  - Username: `grablink`
  - Password: `grablink_password_123`
  - Database: `grablink_db`

- **pgAdmin**: `http://localhost:5050`
  - Email: `admin@grablink.local`
  - Password: `admin`

### 2. Install Backend Dependencies

```bash
cd app/backend/grablink
npm install --legacy-peer-deps
```

### 3. Verify Environment Variables

Ensure `.env` file exists in `app/backend/grablink/` with database configuration:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=grablink
DATABASE_PASSWORD=grablink_password_123
DATABASE_NAME=grablink_db
```

### 4. Start the Backend

```bash
npm run start:dev
```

The application will automatically:
- Connect to PostgreSQL
- Run database synchronization (in development mode)
- Create the `shares` table
- Start listening on `http://localhost:3000`

## Manual PostgreSQL Setup (Without Docker)

If running PostgreSQL locally without Docker:

### 1. Create Database and User

```sql
CREATE USER grablink WITH PASSWORD 'grablink_password_123';
CREATE DATABASE grablink_db OWNER grablink;
GRANT ALL PRIVILEGES ON DATABASE grablink_db TO grablink;
```

### 2. Connect and Verify

```bash
psql -U grablink -d grablink_db -h localhost
```

### 3. Update .env

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=grablink
DATABASE_PASSWORD=grablink_password_123
DATABASE_NAME=grablink_db
```

### 4. Start Backend

```bash
npm run start:dev
```

## Database Schema

### Shares Table

```sql
CREATE TABLE shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(6) UNIQUE NOT NULL,
  url TEXT NOT NULL,
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  processed BOOLEAN DEFAULT false,
  access_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_expires_at (expires_at)
);
```

## TypeORM Configuration

TypeORM is configured in `src/database/database.config.ts`:

- **Synchronize**: Enabled in development (auto-creates tables)
- **Logging**: Error/warn logs in development
- **Migrations**: Located in `src/database/migrations/`

### Running Migrations

#### Create a Migration

```bash
npx typeorm migration:create src/database/migrations/YourMigrationName
```

#### Run Migrations

```bash
npx typeorm migration:run
```

#### Revert Migrations

```bash
npx typeorm migration:revert
```

## Monitoring with pgAdmin

1. Open `http://localhost:5050`
2. Login with `admin@grablink.local` / `admin`
3. Add Server:
   - Host: `postgres`
   - Username: `grablink`
   - Password: `grablink_password_123`
4. Browse database in the left panel

## Data Persistence

### What's Persisted?
- Share codes and URLs
- Title metadata (when enriched by Lambda)
- Access counts
- Expiration timestamps
- Creation/update timestamps

### Data Cleanup
- Expired shares are automatically deleted every minute by the scheduled task
- Triggered by `ShareScheduler` with `@Interval(60 * 1000)`

## Environment Variables

```env
# Database Connection
DATABASE_HOST=localhost           # PostgreSQL host
DATABASE_PORT=5432              # PostgreSQL port
DATABASE_USER=grablink           # Database user
DATABASE_PASSWORD=...           # Database password
DATABASE_NAME=grablink_db        # Database name

# Application
NODE_ENV=development             # development|production
```

## Troubleshooting

### Connection Refused

**Problem**: `connect ECONNREFUSED 127.0.0.1:5432`

**Solution**: Ensure PostgreSQL is running
```bash
# If using Docker
docker-compose ps
docker-compose logs postgres

# If running locally
sudo systemctl status postgresql
```

### Database Doesn't Exist

**Problem**: `error: database "grablink_db" does not exist`

**Solution**: Create database manually or reset Docker volume
```bash
docker-compose down -v  # Remove volume
docker-compose up -d    # Recreate
```

### TypeORM Synchronization Issues

**Problem**: Tables not created automatically

**Solution**: Ensure `synchronize: true` in `database.config.ts` for development

```typescript
const config: TypeOrmModuleOptions = {
  synchronize: process.env.NODE_ENV === 'development',
  // ...
};
```

## Next Steps

- [ ] Set up AWS RDS for production database
- [ ] Create backup strategy
- [ ] Implement database read replicas
- [ ] Add connection pooling for production
- [ ] Set up automated schema versioning with Liquibase

## Resources

- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [pgAdmin Documentation](https://www.pgadmin.org/docs/)
