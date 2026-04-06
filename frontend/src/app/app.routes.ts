import { Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page.component';
import { AdminLoginComponent } from './components/admin-login.component';
import { AdminDashboardComponent } from './components/admin-dashboard.component';
import { adminGuard } from './guards/admin.guard';
import { ResumeComponent } from './components/resume.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
  },
  {
    path: 'admin/login',
    component: AdminLoginComponent,
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
