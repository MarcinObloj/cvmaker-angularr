import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PdfService } from '../services/pdf.service';

@Component({
  selector: 'app-final-step',
  imports: [RouterLink],
  templateUrl: './final-step.component.html',
  styleUrl: '../../creator.component.scss',
})
export class FinalStepComponent {
  private pdfService = inject(PdfService);
  downloadCV(): void {
    const cvFileIdStr = sessionStorage.getItem('cvFileId');
    if (!cvFileIdStr) {
      console.error('Brak cvFileId w sessionStorage');
      return;
    }
    const cvFileId = +cvFileIdStr;
    this.pdfService.downloadPdf(cvFileId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cv.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading CV:', error);
      },
    });
  }
}
