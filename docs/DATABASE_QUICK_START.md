# Quick Reference: Database Setup

## TL;DR - Get Started in 5 Minutes

### 1. Start PostgreSQL (first time only)
```bash
cd Grablink
docker-compose up -d
```

### 2. Install backend dependencies
```bash
cd app/backend/grablink
npm install --legacy-peer-deps
```

### 3. Start the backend (connects automatically)
```bash
npm run start:dev
```

✅ Database is ready! Shares will now persist in PostgreSQL.

---

## Docker Commands

| Command | Purpose |
|---------|---------|
| `docker-compose up -d` | Start PostgreSQL & pgAdmin |
| `docker-compose down` | Stop containers |
| `docker-compose down -v` | Stop & delete database volume |
| `docker-compose logs postgres` | View PostgreSQL logs |
| `docker-compose ps` | Show running containers |

---

## Database Access

### Via psql (CLI)
```bash
psql -U grablink -d grablink_db -h localhost
```

### Via pgAdmin (Web UI)
- URL: http://localhost:5050
- Email: admin@grablink.local
- Password: admin

### Connection Details
- Host: `localhost`
- Port: `5432`
- User: `grablink`
- Password: `grablink_password_123`
- Database: `grablink_db`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ECONNREFUSED 127.0.0.1:5432` | Run `docker-compose up -d` |
| `database does not exist` | Run `docker-compose down -v` then `docker-compose up -d` |
| Backend won't connect | Check `.env` file has correct DB credentials |
| Can't access pgAdmin | Ensure port 5050 is available |

---

## Data Cleanup

### Delete All Shares
```bash
# Via psql
psql -U grablink -d grablink_db -c "DELETE FROM shares;"
```

### Delete Expired Shares Only
Automatic - runs every minute via scheduled task

### Reset Database
```bash
docker-compose down -v
docker-compose up -d
```

---

## Monitoring

Check database logs:
```bash
docker-compose logs -f postgres
```

Monitor connection in pgAdmin:
- Open http://localhost:5050
- Select database → Tools → Query Tool
- Run: `SELECT COUNT(*) FROM shares;`

---

## Files Changed

| File | Purpose |
|------|---------|
| `package.json` | Added @nestjs/typeorm, typeorm, pg |
| `src/share/entities/share.entity.ts` | TypeORM entity definition |
| `src/database/database.config.ts` | Database configuration |
| `src/database/migrations/*.ts` | Schema migrations |
| `src/share/share.service.ts` | Async database operations |
| `docker-compose.yml` | PostgreSQL + pgAdmin setup |
| `.env` | Database connection string |
| `docs/DATABASE_SETUP.md` | Full documentation |

---

## Next: AWS Integration

When ready for production, see [AWS Setup Guide](AWS_SETUP.md)
