# Portfolio Backend - Local Development Setup

## One-Command Setup (macOS/Linux)

```bash
cd /Users/madhavmalhotra/Desktop/portfolio-backend

# Create database
createdb portfolio_db

# Setup environment
cp .env.example .env

# Install & run
npm install && npm run db:migrate && npm run db:seed && npm run dev
```

If that doesn't work, follow step-by-step below:

---

## Step-by-Step Setup

### 1. Navigate to Backend Folder
```bash
cd /Users/madhavmalhotra/Desktop/portfolio-backend
```

### 2. Install Dependencies
```bash
npm install
```

This installs:
- express (web framework)
- prisma (ORM)
- postgresql driver
- jwt & bcrypt (auth)
- cors & validators

### 3. Create PostgreSQL Database

**Using command line:**
```bash
createdb portfolio_db
```

**Or using PostgreSQL client:**
```
CREATE DATABASE portfolio_db;
```

### 4. Setup Environment File

```bash
cp .env.example .env
```

Edit `.env` and update:
- DATABASE_URL with your password
- JWT_SECRET (can be anything for dev, e.g., "dev-secret-key")

**Example .env for local:**
```env
PORT=5000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/portfolio_db"
JWT_SECRET="dev-secret-key-change-in-production"
FRONTEND_URL=http://localhost:4200
NODE_ENV=development
```

### 5. Run Database Migrations

```bash
npm run db:migrate
```

This creates tables based on `prisma/schema.prisma`

### 6. Seed Sample Data

```bash
npm run db:seed
```

This populates:
- Admin account (admin@portfolio.com / admin123)
- Sample about section
- Sample contact info
- 10 sample skills
- 3 sample projects
- 3 sample experiences

### 7. Start Development Server

```bash
npm run dev
```

You should see:
```
Server running on http://localhost:5000
CORS enabled for: http://localhost:4200
```

---

## Verify Backend is Working

### In Another Terminal:

```bash
# Health check
curl http://localhost:5000/health

# Should return:
# {"status":"OK","message":"Server is running"}
```

### Get Portfolio Data
```bash
curl http://localhost:5000/api/portfolio

# Should return JSON with about, contact, skills, projects, experience
```

### Login & Get Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@portfolio.com","password":"admin123"}'

# Save the token from response for next test
```

### Create a Skill (Protected Route)
```bash
curl -X POST http://localhost:5000/api/skills \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"TypeScript","category":"Language","level":85}'
```

---

## Using Prisma Studio (DB GUI)

Open visual database editor:
```bash
npm run db:studio
```

Opens at `http://localhost:5555`

You can:
- View all tables
- Add/edit/delete records visually
- Browse relationships
- Export data

---

## Common Issues & Fixes

### Issue: "database does not exist"
```bash
# Create database
createdb portfolio_db

# Then run migrations
npm run db:migrate
```

### Issue: "password authentication failed"
```
Check DATABASE_URL in .env
Format: postgresql://user:password@host:port/database

If using default PostgreSQL:
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/portfolio_db"
```

### Issue: "Port 5000 already in use"
```bash
# Change PORT in .env to:
PORT=5001

# Or kill process using port 5000
# macOS:
lsof -i :5000
kill -9 <PID>
```

### Issue: "Cannot find module"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Dependencies won't install
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install
```

---

## File Editing

### Change Admin Credentials
Edit `prisma/seed.js`:
```javascript
const admin = await prisma.admin.create({
  data: {
    name: 'Your Name',
    email: 'your-email@example.com',
    passwordHash: await hashPassword('your-password'), // min 6 chars
  },
});
```

Then re-seed:
```bash
npm run db:reset
```

### Add New Fields to Database

1. Edit `prisma/schema.prisma`
2. Add your new field to model
3. Run: `npm run db:migrate`

Example: Add `phone` to Admin model:
```prisma
model Admin {
  id        Int     @id @default(autoincrement())
  name      String
  email     String  @unique
  phone     String  // NEW FIELD
  passwordHash String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## Environment Variables Explained

| Var | Purpose | Example |
|-----|---------|---------|
| PORT | Server port | 5000 |
| DATABASE_URL | PostgreSQL connection | postgresql://user:pass@host/db |
| JWT_SECRET | Token signing key | my-secret-key |
| FRONTEND_URL | Angular app URL (CORS) | http://localhost:4200 |
| NODE_ENV | Environment | development |

---

## npm Scripts Reference

```bash
npm run dev              # Start with auto-reload
npm start                # Start server (no reload)
npm run db:migrate      # Create/update database tables
npm run db:seed         # Add sample data
npm run db:reset        # Clear database & re-seed
npm run db:studio       # Visual database editor
```

---

## Project Structure Quick Reference

```
src/
├── server.js              ← Main app file
├── routes/
│   ├── authRoutes.js      ← /api/auth/*
│   └── portfolioRoutes.js ← /api/*
├── controllers/           ← Handle requests
├── services/              ← Business logic
├── middleware/            ← Auth, error handling
├── validators/            ← Input validation
└── utils/                 ← Helper functions

prisma/
├── schema.prisma          ← Database schema
└── seed.js                ← Sample data

.env                       ← Your secrets (don't commit!)
package.json               ← Dependencies
```

---

## Database Structure

Tables created by migrations:

1. **admins** - User login
2. **about** - About section
3. **contact** - Contact info  
4. **skills** - Developer skills
5. **projects** - Portfolio projects
6. **projectTechnologies** - Tech per project
7. **experience** - Work history

---

## Frontend Connection

Your Angular app connects via:

```typescript
// In environment.ts
apiUrl: 'http://localhost:5000/api'

// In services
this.http.get(this.apiUrl + '/portfolio')
```

API returns standardized responses:
```json
{
  "success": true,
  "message": "Data loaded",
  "data": { /* actual content */ }
}
```

---

## Terminal Tips

### Keep Logs Visible
```bash
npm run dev
# Shows all server logs live
# Errors appear immediately
```

### Background Process
```bash
# Run in background
npm run dev &

# Get back prompt
fg    # brings back to foreground
ctrl+c # stops it
```

### Multiple Terminals
- Terminal 1: `npm run dev` (backend)
- Terminal 2: `ng serve` in Angular folder (frontend)
- Terminal 3: Run curl commands to test

---

## Testing the API

### Without Authentication
```bash
# Get portfolio (public)
curl http://localhost:5000/api/portfolio

# Get skills
curl http://localhost:5000/api/skills

# Get projects
curl http://localhost:5000/api/projects
```

### With Authentication
```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@portfolio.com","password":"admin123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Use token
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/auth/me

# 3. Create skill
curl -X POST http://localhost:5000/api/skills \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Node.js","category":"Backend","level":90}'
```

---

## Debugging Tips

### Enable Verbose Logging
```bash
DEBUG=* npm run dev
```

### Check Database Connection
```bash
# Test with psql
psql -U postgres -d portfolio_db -c "SELECT * FROM admins;"
```

### View Application Logs
```bash
# In another terminal, watch logs
npm run dev 2>&1 | tee app.log
```

### Test with Postman
1. Download Postman
2. Import endpoints
3. Set Authorization header with token
4. Test each endpoint

---

## When You're Done

### Stop Backend
```bash
# In terminal where npm run dev is running
ctrl + c
```

### Clean Up (Optional)
```bash
# Delete node_modules (safe, can reinstall)
rm -rf node_modules

# Keep .env, .env should NOT be in git
```

### Before Pushing to Git
```bash
# .gitignore already includes:
# - node_modules
# - .env
# - .DS_Store
```

---

## Ready to Develop!

✅ Backend running on `http://localhost:5000`
✅ Database populated with sample data
✅ Ready to connect with Angular frontend

**Next:** Update your Angular app's `environment.ts` with API URL!

---

**Happy coding! 🚀**
