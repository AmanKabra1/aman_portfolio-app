# Portfolio Backend API

A production-ready backend API for a portfolio website built with Node.js, Express.js, Prisma ORM, and PostgreSQL.

## Features

✅ **Authentication & Authorization**
- JWT-based authentication for admin users
- Password hashing with bcryptjs
- Protected routes with middleware

✅ **Portfolio Management**
- Manage About section
- Manage Contact information
- Manage Skills (CRUD operations)
- Manage Projects with technologies
- Manage Experience

✅ **Security**
- CORS protection (configurable frontend URL)
- Input validation with express-validator
- Environment variables for sensitive data
- Password encryption

✅ **API Features**
- RESTful API design
- Consistent response format
- Comprehensive error handling
- Public routes for portfolio data
- Protected admin routes

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT
- **Validation:** express-validator
- **Security:** bcryptjs, CORS

## Project Structure

```
portfolio-backend/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware (auth, error handling)
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions (auth, response)
│   ├── validators/      # Input validation schemas
│   └── server.js        # Application entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.js          # Database seed script
├── .env.example         # Environment variables template
├── .gitignore           # Git ignore rules
├── package.json         # Dependencies
└── README.md           # This file
```

## Prerequisites

- Node.js 16+ 
- PostgreSQL 12+
- npm or yarn

## Installation

### 1. Clone & Setup

```bash
# Navigate to backend directory
cd portfolio-backend

# Install dependencies
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb portfolio_db

# Or use your PostgreSQL client to create database manually
```

### 3. Environment Variables

```bash
# Copy example file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Example `.env` file:**

```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/portfolio_db"
JWT_SECRET="your_super_secret_jwt_key_change_this_in_production"
FRONTEND_URL=http://localhost:4200
NODE_ENV=development
```

### 4. Database Migration & Seed

```bash
# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed
```

**Sample Admin Credentials:**
- Email: `admin@portfolio.com`
- Password: `admin123`

## Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

The server will start at `http://localhost:5000`

### Production Mode

```bash
npm start
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Admin login | ❌ |
| GET | `/api/auth/me` | Get current admin | ✅ |

### Portfolio (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portfolio` | Get complete portfolio data |
| GET | `/api/about` | Get about section |
| GET | `/api/contact` | Get contact information |

### Skills (Public Read / Protected Write)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/skills` | Get all skills | ❌ |
| GET | `/api/skills/:id` | Get skill by ID | ❌ |
| POST | `/api/skills` | Create skill | ✅ |
| PUT | `/api/skills/:id` | Update skill | ✅ |
| DELETE | `/api/skills/:id` | Delete skill | ✅ |

### Projects (Public Read / Protected Write)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/projects` | Get all projects | ❌ |
| GET | `/api/projects/:id` | Get project by ID | ❌ |
| POST | `/api/projects` | Create project | ✅ |
| PUT | `/api/projects/:id` | Update project | ✅ |
| DELETE | `/api/projects/:id` | Delete project | ✅ |

### Experience (Public Read / Protected Write)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/experience` | Get all experience | ❌ |
| GET | `/api/experience/:id` | Get experience by ID | ❌ |
| POST | `/api/experience` | Create experience | ✅ |
| PUT | `/api/experience/:id` | Update experience | ✅ |
| DELETE | `/api/experience/:id` | Delete experience | ✅ |

### About & Contact (Protected)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| PUT | `/api/about` | Update about section | ✅ |
| PUT | `/api/contact` | Update contact info | ✅ |

## API Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Something went wrong",
  "errors": []
}
```

## Example Requests

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@portfolio.com",
    "password": "admin123"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": 1,
      "name": "Madhav Malhotra",
      "email": "admin@portfolio.com"
    }
  }
}
```

### Create Skill (Protected)

```bash
curl -X POST http://localhost:5000/api/skills \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "React",
    "category": "Frontend",
    "level": 95
  }'
```

### Get All Portfolio Data

```bash
curl http://localhost:5000/api/portfolio
```

## Database Schema

### Admins Table

```sql
- id (int, primary key)
- name (string)
- email (string, unique)
- passwordHash (string)
- createdAt (timestamp)
- updatedAt (timestamp)
```

### About Table

```sql
- id (int, primary key)
- bio (text)
- description (text)
- yearsExperience (int)
- createdAt (timestamp)
- updatedAt (timestamp)
```

### Contact Table

```sql
- id (int, primary key)
- email (string)
- phone (string)
- location (string)
- createdAt (timestamp)
- updatedAt (timestamp)
```

### Skills Table

```sql
- id (int, primary key)
- name (string)
- category (string)
- level (int, 0-100)
- createdAt (timestamp)
- updatedAt (timestamp)
```

### Projects Table

```sql
- id (int, primary key)
- title (string)
- description (text)
- image (string, URL)
- liveLink (string, URL)
- githubLink (string, URL)
- featured (boolean)
- createdAt (timestamp)
- updatedAt (timestamp)
```

### ProjectTechnologies Table

```sql
- id (int, primary key)
- projectId (int, foreign key)
- technologyName (string)
- createdAt (timestamp)
```

### Experience Table

```sql
- id (int, primary key)
- company (string)
- position (string)
- duration (string)
- description (text)
- startDate (date)
- endDate (date)
- createdAt (timestamp)
- updatedAt (timestamp)
```

## Deployment

### Render.com

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - Secure random string
   - `FRONTEND_URL` - Your frontend URL
   - `NODE_ENV` - production
5. Deploy

### Railway.app

1. Push code to GitHub
2. Create new project on Railway
3. Add PostgreSQL plugin
4. Set environment variables
5. Deploy

### VPS (Ubuntu/Debian)

```bash
# SSH into server
ssh user@server_ip

# Install Node.js and PostgreSQL
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql postgresql-contrib

# Clone and setup
git clone your-repo-url
cd portfolio-backend
npm install

# Setup .env
nano .env

# Setup database
psql -U postgres -c "CREATE DATABASE portfolio_db;"

# Run migrations
npm run db:migrate
npm run db:seed

# Start with PM2
npm install -g pm2
pm2 start src/server.js --name "portfolio-api"
pm2 save
pm2 startup
```

## Development Tips

### View Database

```bash
# Open Prisma Studio
npm run db:studio
```

### Reset Database

```bash
# Delete all data and re-seed
npm run db:reset
```

### Debugging

Enable verbose logging by setting:

```bash
export DEBUG=*
npm run dev
```

## Validation Rules

**Skills:**
- Name: minimum 2 characters
- Category: minimum 2 characters
- Level: 0-100

**Projects:**
- Title: minimum 3 characters
- Description: minimum 10 characters
- Image, Live Link, GitHub Link: valid URLs
- Technologies: array of strings (minimum 1)

**Experience:**
- Company: minimum 2 characters
- Position: minimum 2 characters
- Description: minimum 10 characters
- Start Date & End Date: valid ISO 8601 format

**About:**
- Bio: minimum 10 characters
- Description: minimum 20 characters

**Contact:**
- Email: valid email format
- Phone: minimum 10 characters
- Location: minimum 2 characters

## Error Handling

API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (auth error)
- `404` - Not Found
- `500` - Internal Server Error

## Security Considerations

✅ **Implemented:**
- Password hashing with bcryptjs
- JWT-based authentication
- CORS protection
- Input validation
- Environment variables for secrets
- No console logging of sensitive data

⚠️ **For Production:**
- Use HTTPS only
- Set strong `JWT_SECRET`
- Enable rate limiting
- Add request logging
- Monitor error logs
- Use strong database password
- Enable database backups

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Create a pull request

## License

MIT

## Support

For issues and questions, please create an issue on GitHub.

---

**Created with ❤️ for portfolio management**
