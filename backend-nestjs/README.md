# Portfolio Backend - NestJS

A modern, production-ready backend built with NestJS for the portfolio website.

## 🚀 Features

- **NestJS Framework** - TypeScript-first framework with dependency injection
- **Prisma ORM** - Type-safe database access with MySQL
- **JWT Authentication** - Secure admin authentication
- **Validation** - Built-in request validation with class-validator
- **Modular Architecture** - Clean separation of concerns
- **Error Handling** - Centralized exception handling
- **CORS Support** - Configured for frontend integration

## 📋 Prerequisites

- Node.js >= 16.x
- MySQL >= 8.0
- npm or yarn

## 🛠️ Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
DATABASE_URL="mysql://user:password@localhost:3306/portfolio_db"
JWT_SECRET="your-secret-key-here"
PORT=5000
NODE_ENV=development
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

## 🚦 Running the Application

### Development Mode

```bash
npm run start:dev
```

The server will start on `http://localhost:5000`

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

## 📁 Project Structure

```
src/
├── modules/
│   ├── auth/              # Authentication module
│   │   ├── dto/           # Data transfer objects
│   │   ├── guards/        # JWT guard
│   │   ├── strategies/    # Passport strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── portfolio/         # Portfolio (About/Contact) module
│   ├── skills/            # Skills CRUD module
│   ├── projects/          # Projects CRUD module
│   └── experience/        # Experience CRUD module
├── common/
│   ├── filters/           # Exception filters
│   ├── interceptors/      # Response interceptors
│   └── interfaces/        # Shared interfaces
├── database/
│   ├── prisma.service.ts  # Prisma service
│   └── database.module.ts # Database module
├── app.module.ts          # Root module
└── main.ts                # Application entry point
```

## 🔌 API Endpoints

### Health Check
- `GET /` - API status and available endpoints
- `GET /health` - Server health check

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current admin (Protected)

### Portfolio
- `GET /api/portfolio` - Get complete portfolio data
- `GET /api/about` - Get about information
- `GET /api/contact` - Get contact information
- `PUT /api/about` - Update about (Protected)
- `PUT /api/contact` - Update contact (Protected)

### Skills
- `GET /api/skills` - Get all skills
- `GET /api/skills/:id` - Get skill by ID
- `POST /api/skills` - Create skill (Protected)
- `PUT /api/skills/:id` - Update skill (Protected)
- `DELETE /api/skills/:id` - Delete skill (Protected)

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project (Protected)
- `PUT /api/projects/:id` - Update project (Protected)
- `DELETE /api/projects/:id` - Delete project (Protected)

### Experience
- `GET /api/experience` - Get all experience
- `GET /api/experience/:id` - Get experience by ID
- `POST /api/experience` - Create experience (Protected)
- `PUT /api/experience/:id` - Update experience (Protected)
- `DELETE /api/experience/:id` - Delete experience (Protected)

## 🔒 Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Login Example

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "your-password"}'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": 1,
      "name": "Admin",
      "email": "admin@example.com"
    }
  }
}
```

## 📊 Database Management

### Prisma Commands

```bash
# Generate Prisma Client
npm run db:generate

# Create a new migration
npm run db:migrate

# Reset database (caution!)
npm run db:reset

# Open Prisma Studio (database GUI)
npm run db:studio
```

## 🧪 Response Format

All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

## 🔧 Development Scripts

```bash
# Start development server with hot reload
npm run start:dev

# Build for production
npm run build

# Run linter
npm run lint

# Format code
npm run format
```

## 🌐 CORS Configuration

CORS is enabled for all origins by default. To restrict origins, modify `main.ts`:

```typescript
app.enableCors({
  origin: ['http://localhost:4200'], // Your frontend URL
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | MySQL connection string | `mysql://user:pass@localhost:3306/db` |
| JWT_SECRET | Secret for JWT signing | `your-secret-key` |
| PORT | Server port | `5000` |
| NODE_ENV | Environment mode | `development` or `production` |

## 🚨 Important Notes

1. **Database Compatibility** - Uses the same MySQL database and Prisma schema as the Express backend
2. **API Compatibility** - All endpoints maintain the same request/response format
3. **No Frontend Changes Required** - Frontend can connect without any modifications
4. **JWT Secret** - Ensure the JWT_SECRET is the same if migrating from Express to maintain token compatibility

## 📦 Migration from Express

If migrating from the Express backend:

1. Both backends use the same database (no migration needed)
2. Copy your `.env` file from the Express backend
3. Ensure JWT_SECRET is the same for token compatibility
4. Run `npm install` and `npm run db:generate`
5. Start the server with `npm run start:dev`

## 🤝 Support

For issues or questions:
1. Check the logs in development mode
2. Verify database connection
3. Ensure environment variables are set correctly
4. Review the NestJS documentation

## 📄 License

ISC
