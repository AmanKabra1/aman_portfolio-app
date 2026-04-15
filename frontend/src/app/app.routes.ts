import { Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page.component';
import { LoginComponent } from './components/login.component';
import { RegisterComponent } from './components/register.component';
import { UserDashboardComponent } from './components/user-dashboard.component';
import { PublicPortfolioComponent } from './components/public-portfolio.component';
import { AdminDashboardComponent } from './components/admin-dashboard.component';
import { ResumeComponent } from './components/resume.component';
import { adminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'dashboard',
    component: UserDashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'p/:identifier',
    component: PublicPortfolioComponent,
  },
  {
    path: 'admin/login',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [adminGuard],
  },
  {
    path: 'resume',
    component: ResumeComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
