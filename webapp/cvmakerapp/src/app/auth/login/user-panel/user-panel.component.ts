//// filepath: /c:/Users/User/Desktop/htdocs/cvmakerapp/src/app/auth/login/user-panel/user-panel.component.ts
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService, CvFile } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ModalComponent } from "../../../shared/modal/modal.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-panel',
  imports: [MatIconModule, CommonModule, ModalComponent,RouterLink],
  templateUrl: './user-panel.component.html',
  styleUrls: ['./user-panel.component.scss']
})
export class UserPanelComponent {
  get username() {
    return sessionStorage.getItem('username');
  }

  userId: string | null = sessionStorage.getItem('userId');
  cvFiles: CvFile[] = [];

  // Właściwości kontrolujące modal
  isModalVisible: boolean = false;
  modalTitle: string = '';
  modalMessage: string = '';
  modalConfirmText: string = 'Tak';
  modalCancelText: string = 'Anuluj';
  pendingCvId: number | null = null;
  showCancel = true;
  selectedFile: File | null = null;

  triggerFileInput(): void {
    const fileInput = document.getElementById('cvUploadInput') as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (file.type !== 'application/pdf') {
        alert('Tylko pliki PDF są dozwolone.');
        return;
      }

      this.selectedFile = file;
      this.uploadSelectedFile();
    }
  }

  uploadSelectedFile(): void {
    if (!this.selectedFile || !this.userId) return;

    this.authService.uploadCv(this.selectedFile, +this.userId).subscribe({
      next: (response) => {
        console.log('CV uploaded:', response);
        alert('CV zostało dodane zostało dodane pomyślnie.');
        this.loadUserCvFiles(+this.userId!);
      },
      error: (error) => {
        console.error('Błąd przy wysyłaniu CV:', error);
        alert('Nie udało się przesłać pliku.');
      }
    });
  }


  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    if (this.userId) {
      this.loadUserCvFiles(+this.userId);
    } else {
      console.error('User ID nie znaleziono w sessionStorage.');
    }
  }

  loadUserCvFiles(userId: number): void {
    this.authService.getUserCvs(userId.toString()).subscribe({
      next: (files) => {
        this.cvFiles = files;
      },
      error: (err) => {
        console.error('Błąd podczas pobierania CV:', err);
      }
    });
  }

  downloadCv(cvFileId: number): void {
    const url = `http://localhost:8080/api/cvfile/download/${cvFileId}`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank'; // jeśli chcesz otworzyć zamiast pobierać, usuń link.download
    link.click();
  }

  downloadCvFileUrl(url: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank'; // otwórz w nowej karcie
    link.download = ''; // wymusza pobranie pliku
    link.click();
  }


  // Metoda wywoływana po kliknięciu usuń – ustawia modal zamiast użycia confirm()
  deleteCv(cvFileId: number): void {
    this.pendingCvId = cvFileId;
    this.modalTitle = 'Potwierdzenie usunięcia';
    this.modalMessage = 'Czy na pewno chcesz usunąć to CV?';
    this.isModalVisible = true;
  }

  // Metoda wywoływana przy potwierdzeniu usunięcia w modalu
  onModalConfirm(): void {
    if (this.pendingCvId !== null) {
      this.authService.deleteCv(this.pendingCvId.toString()).subscribe({
        next: (response) => {
          // Zamiast alert, ustaw modal z komunikatem sukcesu:
          this.modalTitle = 'Sukces';
          this.modalMessage = 'CV zostało usunięte.';
          this.showCancel = false;
          this.isModalVisible = true;

          if (this.userId) {
            this.loadUserCvFiles(+this.userId);
          }

          setTimeout(() => {
            this.resetModal();
          }, 3000);
        },
        error: (error) => {

          this.modalTitle = 'Błąd';
          this.modalMessage = 'Wystąpił błąd podczas usuwania CV: ' + error;
          this.showCancel = false;
          this.isModalVisible = true;

        }
      });
    }
    // Czyścimy dane tylko po wykonaniu operacji
    this.pendingCvId = null;
  }

  // Metoda wywoływana, gdy użytkownik anuluje operację w modalu
  onModalCancel(): void {
    this.resetModal();
  }

  private resetModal(): void {
    this.isModalVisible = false;
    this.modalTitle = '';
    this.modalMessage = '';
    this.pendingCvId = null;
  }
}
