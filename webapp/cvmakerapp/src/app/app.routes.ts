import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ResetPasswordComponent } from './auth/login/reset-password/reset-password.component';
import { ResetComponent } from './auth/login/reset-password/reset/reset.component';
import { FaqComponent } from './faq/faq.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { CreatorComponent } from './creator/creator.component';
import { SecondStepComponent } from './creator/second-step/second-step.component';
import { UserPanelComponent } from './auth/login/user-panel/user-panel.component';
import { AdminPanelComponent } from './auth/login/admin-panel/admin-panel.component';
import { FinalStepComponent } from './creator/second-step/final-step/final-step.component';
import { AuthGuard } from './auth/guards/auth.guard';
import { AdminGuard } from './auth/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./main/main.component').then((m) => m.MainComponent),
  },
  {
    path: 'blog',
    loadComponent: () =>
      import('./blog/blog.component').then((m) => m.BlogComponent),
  },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'reset', component: ResetComponent },
  { path: 'faq', component: FaqComponent },
  { path: 'creator', component: CreatorComponent },
  { path: 'second-step', component: SecondStepComponent },
  {
    path: 'user-panel',
    component: UserPanelComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin-panel',
    component: AdminPanelComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  { path: 'final-step', component: FinalStepComponent },

  { path: '**', component: ErrorPageComponent },
];
