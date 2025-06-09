import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [
    FontAwesomeModule,
    MatIconModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrl: '../login/login.component.scss',
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup;
  successText = '';
  errorText = '';
  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { username, email, password } = this.registerForm.value; 
      this.authService.register({ username, email, password }).subscribe({
        next: (data) => {
          console.log('Rejestracja udana:', data);
          this.successText = 'Rejestracja przebiegła pomyślnie. Email aktywacyjny został wysłany.';
          
        },
        error: (error) => {
          console.error('Błąd rejestracji:', error);
          this.errorText = 'Nie udało się zarejestrować. Spróbuj ponownie później.';
        },
      });
    } else {
      console.error('Formularz jest niepoprawny');
    }
  }
}