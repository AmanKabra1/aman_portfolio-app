# API Documentation & Integration Guide

## Frontend Integration with Your Angular Portfolio

### Set Up Environment Variables

**src/environments/environment.ts**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  authUrl: 'http://localhost:5000/api/auth'
};
```

**src/environments/environment.prod.ts**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-domain.com/api',
  authUrl: 'https://your-backend-domain.com/api/auth'
};
```

---

### Create Auth Service

```typescript
// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.authUrl}`;
  private tokenSubject = new BehaviorSubject<string | null>(
    localStorage.getItem('token')
  );
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
    this.tokenSubject.next(token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
  }
}
```

### Create Auth Interceptor

```typescript
// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(req);
  }
}
```

### Register Interceptor in app.config.ts

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([])
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    // ... other providers
  ],
};
```

### Create Portfolio Service

```typescript
// src/app/services/portfolio.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // Public endpoints
  getPortfolio(): Observable<any> {
    return this.http.get(`${this.apiUrl}/portfolio`);
  }

  getAbout(): Observable<any> {
    return this.http.get(`${this.apiUrl}/about`);
  }

  getContact(): Observable<any> {
    return this.http.get(`${this.apiUrl}/contact`);
  }

  getSkills(): Observable<any> {
    return this.http.get(`${this.apiUrl}/skills`);
  }

  getProjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/projects`);
  }

  getExperience(): Observable<any> {
    return this.http.get(`${this.apiUrl}/experience`);
  }

  // Admin endpoints (protected)
  updateAbout(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/about`, data);
  }

  updateContact(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/contact`, data);
  }

  // Skills admin
  createSkill(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/skills`, data);
  }

  updateSkill(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/skills/${id}`, data);
  }

  deleteSkill(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/skills/${id}`);
  }

  // Projects admin
  createProject(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/projects`, data);
  }

  updateProject(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/projects/${id}`, data);
  }

  deleteProject(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/projects/${id}`);
  }

  // Experience admin
  createExperience(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/experience`, data);
  }

  updateExperience(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/experience/${id}`, data);
  }

  deleteExperience(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/experience/${id}`);
  }
}
```

### Login Component Example

```typescript
// src/app/components/login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <form (ngSubmit)="onLogin()">
        <input
          [(ngModel)]="email"
          name="email"
          type="email"
          placeholder="Email"
          required
        />
        <input
          [(ngModel)]="password"
          name="password"
          type="password"
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
        <div *ngIf="error" class="error">{{ error }}</div>
      </form>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.authService.setToken(response.data.token);
        this.router.navigate(['/admin']);
      },
      error: (error) => {
        this.error = error.error.message || 'Login failed';
      },
    });
  }
}
```

### Create Auth Guard

```typescript
// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
```

### Update Routes

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login.component';
import { AdminComponent } from './components/admin.component';

export const routes: Routes = [
  // Public routes
  { path: '', component: HeroComponent },
  // ... other public routes

  // Admin routes (protected)
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
  },

  // 404
  { path: '**', redirectTo: '' },
];
```

---

## API Response Examples

### Successful Login
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

### Get Portfolio Data
```json
{
  "success": true,
  "message": "Portfolio data retrieved successfully",
  "data": {
    "about": {
      "id": 1,
      "bio": "Full Stack Developer",
      "description": "I am a passionate developer...",
      "yearsExperience": 5,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-20T15:30:00Z"
    },
    "contact": {
      "id": 1,
      "email": "madhav@example.com",
      "phone": "+91 9876543210",
      "location": "India",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-20T15:30:00Z"
    },
    "skills": [
      {
        "id": 1,
        "name": "JavaScript",
        "category": "Language",
        "level": 95,
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-20T15:30:00Z"
      }
    ],
    "projects": [
      {
        "id": 1,
        "title": "E-Commerce Platform",
        "description": "Full-stack e-commerce...",
        "image": "https://...",
        "liveLink": "https://...",
        "githubLink": "https://...",
        "featured": true,
        "technologies": ["React", "Node.js", "PostgreSQL"],
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-20T15:30:00Z"
      }
    ],
    "experience": [
      {
        "id": 1,
        "company": "Tech Solutions Inc.",
        "position": "Senior Developer",
        "duration": "2021 - Present",
        "description": "Leading development...",
        "startDate": "2021-01-15T00:00:00Z",
        "endDate": "2026-12-31T00:00:00Z",
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-20T15:30:00Z"
      }
    ]
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Invalid email or password",
  "errors": []
}
```

### Validation Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Skill name is required"
    },
    {
      "field": "level",
      "message": "Level must be between 0 and 100"
    }
  ]
}
```

---

## Common Issues & Solutions

### CORS Error
**Problem:** `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution:** 
1. Verify `FRONTEND_URL` in backend `.env` matches your frontend URL
2. Add trailing slash carefully: `http://localhost:4200` not `http://localhost:4200/`
3. Restart backend server

### 401 Unauthorized
**Problem:** Request returns 401 status

**Solution:**
- Check token is present in localStorage
- Verify token hasn't expired (7 days from login)
- Re-login to get new token
- Ensure Authorization header is set correctly: `Bearer {token}`

### 404 Not Found
**Problem:** `/api/skills/undefined` returns 404

**Solution:**
- Verify you're passing correct ID (number, not object)
- Check route parameters: `/skills/:id`
- Ensure resource exists in database

### Request Timeout
**Problem:** Long requests fail

**Solution:**
- Increase HTTP timeout in Angular
- Optimize database queries
- Check backend logs for slow queries

---

## Using Postman

### Setup Postman

1. Download [Postman](https://www.postman.com/)
2. Create new collection "Portfolio API"
3. Set base URL: `http://localhost:5000`

### Environment Variables in Postman

```json
{
  "baseUrl": "http://localhost:5000",
  "authToken": ""
}
```

### Login Request

- **Method:** POST
- **URL:** `{{baseUrl}}/api/auth/login`
- **Body (JSON):**
```json
{
  "email": "admin@portfolio.com",
  "password": "admin123"
}
```
- **After Response:** Copy token to `authToken` variable

### Get Skills Request

- **Method:** GET
- **URL:** `{{baseUrl}}/api/skills`
- **Headers:** None needed (public endpoint)

### Create Skill Request

- **Method:** POST
- **URL:** `{{baseUrl}}/api/skills`
- **Headers:** 
  - Authorization: `Bearer {{authToken}}`
  - Content-Type: application/json
- **Body (JSON):**
```json
{
  "name": "React",
  "category": "Frontend",
  "level": 95
}
```

---

## Rate Limiting (Optional Enhancement)

Add to your backend for production:

```bash
npm install express-rate-limit
```

```javascript
// src/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many login attempts, please try again later',
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 requests per 15 minutes
});
```

Use in routes:
```javascript
router.post('/login', loginLimiter, validateLogin, authController.login);
app.use('/api', apiLimiter);
```

---

## API Testing Checklist

- [ ] Test login with correct credentials
- [ ] Test login with wrong password
- [ ] Test login with non-existent email
- [ ] Get portfolio data (public)
- [ ] Create skill without auth (should fail)
- [ ] Create skill with auth (should succeed)
- [ ] Update skill
- [ ] Delete skill
- [ ] Create project with technologies
- [ ] Update project
- [ ] Delete project
- [ ] Create experience
- [ ] Update experience
- [ ] Delete experience
- [ ] Update about section
- [ ] Update contact section
- [ ] Verify token expiration

---

**Your backend is fully documented and ready for frontend integration! 🚀**
