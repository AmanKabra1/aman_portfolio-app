# Quick Start Guide for Portfolio Backend

## Step-by-Step Setup

### 1️⃣ Install Dependencies
```bash
cd portfolio-backend
npm install
```

### 2️⃣ Create .env File
```bash
cp .env.example .env
```

Update `.env` with your database details:
```
PORT=5000
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/portfolio_db"
JWT_SECRET="your-secret-key-minimum-32-chars-long"
FRONTEND_URL=http://localhost:4200
NODE_ENV=development
```

### 3️⃣ Create PostgreSQL Database
```bash
# Using psql
psql -U postgres
CREATE DATABASE portfolio_db;
\q
```

### 4️⃣ Run Database Migrations
```bash
npm run db:migrate
```

### 5️⃣ Seed Sample Data
```bash
npm run db:seed
```

Sample Admin Login:
- **Email:** admin@portfolio.com
- **Password:** admin123

### 6️⃣ Start Development Server
```bash
npm run dev
```

Server runs at: `http://localhost:5000`

## Quick API Tests

### Test Health Check
```bash
curl http://localhost:5000/health
```

### Get All Portfolio Data
```bash
curl http://localhost:5000/api/portfolio
```

### Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@portfolio.com","password":"admin123"}'
```

## Frontend Integration

Update your Angular frontend API URL:

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};

// For production
// export const environment = {
//   production: true,
//   apiUrl: 'https://your-backend-domain.com/api'
// };
```

## Available npm Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with auto-reload (nodemon) |
| `npm start` | Start production server |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed sample data |
| `npm run db:reset` | Reset database & re-seed |
| `npm run db:studio` | Open Prisma Studio GUI |

## Prisma Studio

View and manage your database visually:
```bash
npm run db:studio
```

Opens at: `http://localhost:5555`

## Database Reset

To reset everything and start fresh:
```bash
npm run db:reset
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | JWT signing key (min 32 chars) | `your-secret-key-here` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:4200` |
| `NODE_ENV` | Environment | `development` or `production` |

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify database exists: `psql -l`

### Port Already in Use
```bash
# Change PORT in .env to another port (e.g., 5001)
```

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

### JWT Token Invalid
- Ensure JWT_SECRET is set in .env
- Token expires in 7 days
- Include token in Authorization header: `Bearer {token}`

## Next Steps

1. ✅ Backend is ready to use
2. Connect your Angular frontend (update API URL in environment.ts)
3. Test authentication in your frontend
4. Update admin login credentials in production
5. Deploy to Render, Railway, or VPS

## Support

- Check [README.md](./README.md) for full documentation
- Review error logs for debugging
- Use `npm run db:studio` to inspect database

---

**Your backend is now ready! 🚀**
