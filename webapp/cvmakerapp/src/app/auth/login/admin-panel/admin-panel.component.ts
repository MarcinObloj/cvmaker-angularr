import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { CommonModule, DatePipe } from '@angular/common';
import { ModalComponent } from '../../../shared/modal/modal.component';

type ModalOperation = 'deleteUser' | 'deleteCv' | null;

@Component({
  selector: 'app-admin-panel',
  imports: [MatIconModule, DatePipe, CommonModule, ModalComponent],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['../user-panel/user-panel.component.scss'],
})
export class AdminPanelComponent implements OnInit {
  users: any[] = [];

  isModalVisible = false;
  modalTitle = '';
  modalMessage = '';
  modalConfirmText = 'Tak';
  modalCancelText = 'Anuluj';
  showCancel = true;

  modalOperation: ModalOperation = null;
  pendingUserId: string | null = null;
  pendingCvId: string | null = null;
  pendingCvUserId: string | null = null;
  cvFiles: any[] = [];
  selectedUserId: string | null = null;
  isCvListVisible: boolean = false;
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.authService.getUsers().subscribe({
      next: (users) => {
        console.log(users);
        this.users = users;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      },
    });
  }

  viewUserCvs(userId: string): void {
    this.authService.getUserCvs(userId).subscribe({
      next: (cvFiles) => {
        this.cvFiles = cvFiles;
        this.selectedUserId = userId;
        this.isCvListVisible = true; 
      },
      error: (error) => {
        console.error('Błąd pobierania CV:', error);
        this.showCancel = false;
        this.showModal('Błąd', 'Nie znaleziono CV dla tego użytkownika.');
      },
    });
  }

  closeCvList(): void {
    this.isCvListVisible = false;
    this.cvFiles = [];
    this.selectedUserId = null;
  }

  
  deleteUser(userId: string): void {
    this.modalTitle = 'Potwierdzenie usunięcia';
    this.modalMessage = 'Czy na pewno chcesz usunąć tego użytkownika?';
    this.modalConfirmText = 'Tak';
    this.modalCancelText = 'Anuluj';
    this.modalOperation = 'deleteUser';
    this.showCancel = true;
    this.pendingUserId = userId;
    this.isModalVisible = true;
  }

 
  deleteCv(cvId: string, userId: string): void {
    this.modalTitle = 'Potwierdzenie usunięcia';
    this.modalMessage = 'Czy na pewno chcesz usunąć to CV?';
    this.modalConfirmText = 'Tak';
    this.modalCancelText = 'Anuluj';
    this.modalOperation = 'deleteCv';
    this.showCancel = true;
    this.pendingCvId = cvId;
    this.pendingCvUserId = userId;
    this.isModalVisible = true;
  }

  
  onModalConfirm(): void {
    if (this.modalOperation === 'deleteUser' && this.pendingUserId) {
      this.authService.deleteUser(this.pendingUserId).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.showCancel = false;
          this.showModal('Błąd', 'Wystąpił błąd podczas usuwania użytkownika.');
        },
      });
    } else if (
      this.modalOperation === 'deleteCv' &&
      this.pendingCvId &&
      this.pendingCvUserId
    ) {
      const userIdForCv = this.pendingCvUserId;
      this.authService.deleteCv(this.pendingCvId).subscribe({
        next: () => {
          this.viewUserCvs(userIdForCv);
        },
        error: (error) => {
          console.error('Error deleting CV:', error);
          this.showCancel = false;
          this.showModal('Błąd', 'Wystąpił błąd podczas usuwania CV.');
        },
      });
    }
    this.resetModal();
  }

  
  onModalCancel(): void {
    this.resetModal();
  }

  // Resetuje stan modala i operację
  private resetModal(): void {
    this.isModalVisible = false;
    this.modalOperation = null;
    this.pendingUserId = null;
    this.pendingCvId = null;
    this.pendingCvUserId = null;
  }

  
  private showModal(
    title: string,
    message: string,
    confirmText: string = 'OK'
  ): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalConfirmText = confirmText;
    this.modalCancelText = 'Cancel';
    this.modalOperation = null;
    this.isModalVisible = true;
  }

  displayCvs(cvFiles: any[], userId: string): void {
    let content = `
      <div class="modal-overlay">
        <div class="modal-content">
          <h2>CV Użytkownika ${userId}</h2>
          <table class="cv-table">
            <thead>
              <tr>
                <th>Nazwa pliku</th>
                <th>Data dodania</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>`;

    if (cvFiles.length > 0) {
      cvFiles.forEach((cv) => {
        content += `
              <tr>
                <td>${cv.fileName}</td>
                <td>${new Date(cv.createdAt).toLocaleDateString()}</td>
                <td>
                  <a href="${
                    cv.downloadUrl
                  }" target="_blank" class="btn">Pobierz</a>
                  <button class="delete-cv-button btn-danger" data-id="${
                    cv.id
                  }" data-user-id="${userId}">Usuń</button>
                </td>
              </tr>`;
      });
    } else {
      content += `
              <tr>
                <td colspan="3" class="no-cv">Brak CV dla tego użytkownika.</td>
              </tr>`;
    }

    content += `
            </tbody>
          </table>
          <button class="close-button">Zamknij</button>
        </div>
      </div>`;

    const modal = document.createElement('div');
    modal.innerHTML = content;
    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.close-button') as HTMLElement;
    closeButton.onclick = () => {
      document.body.removeChild(modal);
    };

    const deleteCvButtons = modal.querySelectorAll('.delete-cv-button');
    deleteCvButtons.forEach((button) => {
      button.addEventListener('click', (event: Event) => {
        const target = event.target as HTMLElement;
        const cvId = target.getAttribute('data-id');
        const userId = target.getAttribute('data-user-id');
        this.deleteCv(cvId!, userId!);
        document.body.removeChild(modal);
      });
    });
  }
}
