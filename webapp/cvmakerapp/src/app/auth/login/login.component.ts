import { Component, inject } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [MatIconModule, CommonModule, FormsModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginRequest = {
    emailOrUsername: '',
    password: '',
  };
  successText='';
  errorText='';
  private authService = inject(AuthService);
  private router = inject(Router);
  onSubmit() {
    this.authService.login(this.loginRequest).subscribe({
      next: (response) => {
        console.log('Login successful');
        this.successText='Zalogowano pomyślnie.';
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.log(error);
        this.errorText='Nieprawidłowe dane logowania.'
      },
    });
  }
}
