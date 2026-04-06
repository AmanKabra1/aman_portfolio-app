# Backend Architecture

## 🏗️ Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Angular Frontend                          │
│                   http://localhost:4200                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP Requests
                         │ (with auth token)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Express.js Server                           │
│              http://localhost:5000/api                       │
├─────────────────────────────────────────────────────────────┤
│  CORS Middleware (FRONTEND_URL)                             │
│         ↓                                                     │
│  Auth Interceptor (add JWT to requests)                     │
│         ↓                                                     │
│  Route Handler                                              │
│  ├─ /api/auth/* → authRoutes                               │
│  └─ /api/* → portfolioRoutes                               │
├─────────────────────────────────────────────────────────────┤
│  Controllers (Request Handling)                             │
│  ├─ authController.js                                       │
│  ├─ portfolioController.js                                  │
│  ├─ skillController.js                                      │
│  ├─ projectController.js                                    │
│  └─ experienceController.js                                 │
├─────────────────────────────────────────────────────────────┤
│  Middleware                                                 │
│  ├─ authMiddleware.js (JWT verification)                   │
│  └─ errorHandler.js (Global error handling)                │
├─────────────────────────────────────────────────────────────┤
│  Services (Business Logic)                                  │
│  ├─ authService.js                                          │
│  ├─ portfolioService.js                                     │
│  ├─ skillService.js                                         │
│  ├─ projectService.js                                       │
│  └─ experienceService.js                                    │
├─────────────────────────────────────────────────────────────┤
│  Validators (Input Validation)                             │
│  ├─ authValidators.js                                       │
│  ├─ skillValidators.js                                      │
│  ├─ projectValidators.js                                    │
│  ├─ experienceValidators.js                                 │
│  └─ aboutContactValidators.js                               │
├─────────────────────────────────────────────────────────────┤
│  Utilities                                                  │
│  ├─ authUtils.js (JWT, bcrypt)                             │
│  ├─ response.js (Response format)                          │
│  └─ database.js (Prisma client)                            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Prisma ORM
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database                             │
│            (portfolio_db)                                   │
├─────────────────────────────────────────────────────────────┤
│  Tables:                                                    │
│  ├─ admins                                                  │
│  ├─ about                                                   │
│  ├─ contact                                                 │
│  ├─ skills                                                  │
│  ├─ projects                                                │
│  ├─ projectTechnologies                                     │
│  └─ experience                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📡 API Request Flow

```
1. Frontend Request
   └─ POST /api/auth/login
      {email, password}

2. Express Server
   └─ Route Handler (authRoutes.js)
      └─ Validation (authValidators.js)
         └─ Success: Continue
            └─ Fail: Return 400 Validation Error

3. Controller (authController.js)
   └─ Call Service

4. Service (authService.js)
   └─ loginAdmin(email, password)
      └─ Find user in database via Prisma
      └─ Compare password with hash
      └─ Generate JWT token
      └─ Return {token, admin}

5. Controller Response
   └─ successResponse(res, message, data, 200)

6. Frontend receives:
   {
     "success": true,
     "message": "Login successful",
     "data": {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "admin": {...}
     }
   }

7. Frontend stores token in localStorage
   └─ Uses token in Authorization header for protected routes
```

---

## 🔐 Authentication Flow

```
Request → authMiddleware.js
    ├─ Get token from Authorization header
    ├─ Verify token with JWT_SECRET
    ├─ Query database for admin with token's ID
    ├─ If valid: Attach admin to req.admin, call next()
    └─ If invalid: Return 401 Unauthorized

Protected Route Handler
    └─ req.admin available (from middleware)
    └─ Perform operation
    └─ Return response
```

---

## 🗄️ Database Relationship Diagram

```
┌──────────────┐
│    Admin     │
├──────────────┤
│ id (PK)      │
│ name         │
│ email (UQ)   │
│ passwordHash │
│ createdAt    │
│ updatedAt    │
└──────────────┘

┌──────────────┐
│    About     │
├──────────────┤
│ id (PK)      │
│ bio          │
│ description  │
│ yearsExp     │
│ createdAt    │
│ updatedAt    │
└──────────────┘

┌──────────────┐
│   Contact    │
├──────────────┤
│ id (PK)      │
│ email        │
│ phone        │
│ location     │
│ createdAt    │
│ updatedAt    │
└──────────────┘

┌──────────────┐
│    Skill     │
├──────────────┤
│ id (PK)      │
│ name         │
│ category     │
│ level (0-100)│
│ createdAt    │
│ updatedAt    │
└──────────────┘

┌──────────────┐        1:N      ┌─────────────────────────┐
│   Project    │ ───────────────▶ │ ProjectTechnology       │
├──────────────┤                  ├─────────────────────────┤
│ id (PK)      │                  │ id (PK)                 │
│ title        │                  │ projectId (FK)          │
│ description  │                  │ technologyName          │
│ image        │                  │ createdAt               │
│ liveLink     │                  └─────────────────────────┘
│ githubLink   │
│ featured     │
│ createdAt    │
│ updatedAt    │
└──────────────┘

┌──────────────────┐
│   Experience     │
├──────────────────┤
│ id (PK)          │
│ company          │
│ position         │
│ duration         │
│ description      │
│ startDate        │
│ endDate          │
│ createdAt        │
│ updatedAt        │
└──────────────────┘
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  GitHub Repository                       │
│          (Your code pushed to GitHub)                   │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
    ┌────────┐    ┌────────┐    ┌────────┐
    │ Render │    │Railway │    │  VPS   │
    ├────────┤    ├────────┤    ├────────┤
    │ Node.js│    │ Node.js│    │Node.js │
    │via Auto│    │via Auto│    │+ Nginx │
    └────────┘    └────────┘    └────────┘
        │              │              │
        ▼              ▼              ▼
    ┌────────┐    ┌────────┐    ┌────────┐
    │Postgres│    │Postgres│    │Postgres│
    │(Managed)    │(Plugin)│    │(Manual)│
    └────────┘    └────────┘    └────────┘

All three options:
✅ Auto-deploy on git push
✅ Environment variables secured
✅ SSL/HTTPS
✅ Database backups available
```

---

## 📊 File Organization

```
Sources (Input)
    ↓
Validators (Express Validation)
    ├─ authValidators.js
    ├─ skillValidators.js
    ├─ projectValidators.js
    ├─ experienceValidators.js
    └─ aboutContactValidators.js
    ↓
Middleware (Auth Check + Error Handling)
    ├─ authMiddleware.js (JWT verification)
    └─ errorHandler.js (Global catch)
    ↓
Controllers (Route Handlers)
    ├─ authController.js
    ├─ portfolioController.js
    ├─ skillController.js
    ├─ projectController.js
    └─ experienceController.js
    ↓
Services (Business Logic)
    ├─ authService.js
    ├─ portfolioService.js
    ├─ skillService.js
    ├─ projectService.js
    └─ experienceService.js
    ↓
Utilities (Helpers)
    ├─ authUtils.js (JWT, bcrypt)
    ├─ response.js (Format response)
    └─ database.js (Prisma client)
    ↓
Database Access via Prisma ORM
    ↓
PostgreSQL Database
```

---

## 🔄 Request Processing Pipeline

```
Incoming HTTP Request
        ↓
Express Server receives request
        ↓
CORS Middleware checks origin
        ↓
Express router matches route
        ├─ /api/auth/* → authRoutes
        └─ /api/* → portfolioRoutes
        ↓
Route Validators run (if defined)
        ├─ Request body validation
        ├─ Parameter validation
        └─ Return 400 if fails
        ↓
Auth Middleware (for protected routes)
        ├─ Extract JWT token
        ├─ Verify token
        ├─ Query database for admin
        └─ Return 401 if fails
        ↓
Controller method executes
        ├─ Input processing
        ├─ Call service method
        └─ Get result
        ↓
Service method executes
        ├─ Database queries via Prisma
        ├─ Business logic
        └─ Return data/error
        ↓
Controller formats response
        ├─ successResponse() or errorResponse()
        └─ Send to client
        ↓
Client receives JSON response
        ├─ {success, message, data}
        └─ Or {success, message, errors}
```

---

## 🔑 Security Layers

```
Layer 1: Network
    ├─ CORS (only allow FRONTEND_URL)
    ├─ HTTPS (in production)
    └─ SSL/TLS certificates

Layer 2: Request Validation
    ├─ Express validator sanitizes input
    ├─ Type checking
    └─ Required field validation

Layer 3: Authentication
    ├─ JWT tokens with expiration
    ├─ Password hashing (bcryptjs)
    └─ Secure token verification

Layer 4: Authorization
    ├─ authMiddleware checks token
    ├─ Admin role verified from database
    └─ Protected routes only for authenticated users

Layer 5: Data Protection
    ├─ Prisma prevents SQL injection
    ├─ Error messages don't expose internals
    └─ No sensitive data in logs

Layer 6: Operational
    ├─ Environment variables (secrets not in code)
    ├─ Database connection string secure
    ├─ JWT secret secured
    └─ No hardcoded credentials
```

---

## 📈 Performance Considerations

```
Database Queries
    ├─ Prisma auto-generates optimized SQL
    ├─ Relationships included in queries (projects + technologies)
    └─ Index on unique fields (email)

Response Caching
    ├─ Public endpoints cacheable
    ├─ Add node-cache for frequently accessed data
    └─ Redis for distributed caching (optional)

Request Processing
    ├─ Async/await for non-blocking I/O
    ├─ Connection pooling via Prisma
    └─ Middleware optimized

File Size
    ├─ Gzip compression enabled (Nginx)
    ├─ JSON payloads optimized
    └─ Database indexes on frequently queried fields
```

---

## 🔍 Monitoring & Logging

```
Error Handling
    ├─ centralized errorHandler middleware
    ├─ All errors caught and formatted
    ├─ Console logs for debugging
    └─ Production: use Sentry or New Relic

Request Logging
    ├─ Every request passes through middleware
    ├─ Can add morgan/winston for detailed logs
    ├─ Database query logs (set DEBUG=prisma:* in dev)
    └─ Response times can be tracked

Health Check
    ├─ GET /health endpoint
    ├─ Returns {status: 'OK', message: 'Server is running'}
    └─ Use for uptime monitoring

Database Health
    ├─ Prisma auto-manages connections
    ├─ Connection pool includes retries
    └─ Graceful error handling for failures
```

---

## 🚀 Scaling Strategy

```
Current Setup (Single Instance)
    ├─ Node.js server (port 5000)
    ├─ PostgreSQL database
    └─ Suitable for: portfolios, small projects

Future Scaling
    ├─ Horizontal Scaling
    │   ├─ Load balancer (nginx)
    │   ├─ Multiple Node.js instances
    │   └─ Session store (Redis)
    │
    ├─ Database Scaling
    │   ├─ Read replicas
    │   ├─ Sharding (if needed)
    │   └─ Connection pooling (pgBouncer)
    │
    ├─ Caching Layer
    │   ├─ Redis for sessions
    │   ├─ Redis for frequently accessed data
    │   └─ CDN for static files
    │
    └─ API Optimization
        ├─ GraphQL (instead of REST)
        ├─ Rate limiting
        └─ API versioning
```

---

## 📊 Summary Stats

- **Models:** 7
- **Routes:** 32+
- **Controllers:** 5
- **Services:** 5  
- **Validators:** 5 sets
- **Middleware:** 2 types
- **Database Tables:** 7
- **Sample Records:** 20+
- **API Response Format:** Standardized
- **Authentication:** JWT + bcrypt
- **Error Handling:** Centralized
- **Code Lines:** 2,000+

---

**Your backend is architected for production! 🚀**
