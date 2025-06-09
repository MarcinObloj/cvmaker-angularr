import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset',
  imports: [MatIconModule,ReactiveFormsModule,CommonModule],
  templateUrl: './reset.component.html',
  styleUrl: '../../login.component.scss'
})
export class ResetComponent {
errorMessage= '';
successMessage= '';
newPasswordForm!: FormGroup;
authService = inject(AuthService)
constructor(private fb: FormBuilder, private route: ActivatedRoute) {
  this.route.queryParams.subscribe(params => {
    this.newPasswordForm = this.fb.group({
      token: [params['token'], Validators.required],  // <-- dodaj token do formularza
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  });
}
onSubmit() {
  if (this.newPasswordForm.valid) {
    const { token, newPassword } = this.newPasswordForm.value;
    this.authService.changePassword(token, newPassword).subscribe({
      next: (response) => {
        this.successMessage = 'Hasło zostało zmienione pomyślnie.';
        
      },
      error: (error) => {
        this.errorMessage = 'Nie znaleziono podanego maila';
        console.log(error);
      },
    });
  }
}

get token() {
  return this.newPasswordForm.get('token');
}

get newPassword() {
  return this.newPasswordForm.get('newPassword');
}
}
