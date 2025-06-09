import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  private apiUrl = 'http://localhost:8080/api/cvfile/uploadPdf';
  private downloadUrl = 'http://localhost:8080/api/cvfile/download';
  constructor(private http: HttpClient) {}

  async generatePdf(elementId: string): Promise<Blob> {
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Element not found');

    const htmlElement = element as HTMLElement;

    const originalStyles = {
      borderRadius: htmlElement.style.borderRadius,
      margin: htmlElement.style.margin,
      padding: htmlElement.style.padding,
    };
    htmlElement.style.borderRadius = '0';
    htmlElement.style.margin = '0';
    htmlElement.style.padding = '0';

    // Tworzymy kontener o wymiarach A4
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '210mm'; // Szerokość A4
    container.style.minHeight = '297mm'; // Wysokość A4
    container.style.overflow = 'visible';

    const clonedElement = htmlElement.cloneNode(true) as HTMLElement;
    clonedElement.style.width = '100%';
    container.appendChild(clonedElement);
    document.body.appendChild(container);

    // Zrobimy zrzut ekranu z elementu
    const canvas = await html2canvas(container, {
      scale: 2, // Wysoka jakość obrazu
      useCORS: true,
      logging: false,
      scrollY: 0, // Brak przewijania
      backgroundColor: '#ffffff', // Białe tło
    });

    // Usuwamy kontener po wykonaniu zrzutu ekranu
    document.body.removeChild(container);

    // Tworzymy PDF i dostosowujemy rozmiar
    const pdf = new jsPDF('portrait', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/jpeg');
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 0;
    let remainingHeight = imgHeight;

    // Dodajemy obraz do PDF, dostosowując do A4
    while (remainingHeight > 0) {
      pdf.addImage(
        imgData,
        'JPEG',
        0,
        position,
        imgWidth,
        Math.min(pageHeight, remainingHeight)
      );
      remainingHeight -= pageHeight;

      if (remainingHeight > 0) {
        pdf.addPage();
        position = Math.min(0, remainingHeight - pageHeight);
      }
    }

    // Zwracamy PDF jako Blob
    return pdf.output('blob');
  }


  async generateAndUploadPdf(elementId: string, userId: number): Promise<void> {
    try {
      const pdfBlob = await this.generatePdf(elementId); // Generowanie PDF
      const formData = new FormData();
      formData.append('cvFile', pdfBlob, 'cv.pdf');
      formData.append('userId', userId.toString());

      const headers = new HttpHeaders().set(
        'Authorization',
        `Bearer ${sessionStorage.getItem('token')}`
      );

      this.http
        .post(this.apiUrl, formData, { headers })
        .pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Error uploading CV', error);
            if (error.error instanceof ErrorEvent) {
              console.error('Client-side error:', error.error.message);
            } else {
              console.error(
                `Server-side error: ${error.status} - ${error.statusText}`
              );
              console.error('Error details:', error.error);
            }
            return throwError(
              'Wystąpił błąd przy przesyłaniu CV. Spróbuj ponownie.'
            );
          })
        )
        .subscribe({
          next: (response: any) => {
            console.log('CV uploaded successfully', response);
            // Zapisz cvFileId do sessionStorage, aby móc później go użyć przy pobieraniu CV
            if (response && response.cvFileId) {
              sessionStorage.setItem('cvFileId', response.cvFileId.toString());
            }
          },
          error: (error) => console.error('Error uploading CV', error),
        });
    } catch (error) {
      console.error('Error generating or uploading PDF:', error);
    }
  }
  downloadPdf(cvFileId: number): Observable<Blob> {
    const url = `${this.downloadUrl}/${cvFileId}`;
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${sessionStorage.getItem('token')}`
    );
    return this.http.get(url, { headers, responseType: 'blob' });
  }
}
