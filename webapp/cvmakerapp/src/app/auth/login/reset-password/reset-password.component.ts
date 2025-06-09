import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [MatIconModule, RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: '../login.component.scss',
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = '';
  successMessage = '';
  constructor(private fb: FormBuilder) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
  onSubmit() {
    if (this.resetForm.valid) {
      this.authService.resetPassword(this.resetForm.value.email).subscribe({
        next: (response) => {
          console.log('Reset password email sent');
          this.successMessage = 'Reset password email sent';
        },
        error: (error) => {
          console.log(error);
          this.errorMessage = 'Error sending reset password';
        },
      });
    }
  }

  get email() {
    return this.resetForm.get('email');
  }
}
