import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Renderer2,
} from '@angular/core';
import { PdfService } from './services/pdf.service';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ModalComponent } from "../../shared/modal/modal.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-second-step',
  imports: [MatIconModule, RouterLink, ModalComponent,CommonModule],
  templateUrl: './second-step.component.html',
  styleUrls: ['../creator.component.scss'],
})
export class SecondStepComponent implements AfterViewInit {
  @ViewChild('cvPreview') cvPreview!: ElementRef<HTMLDivElement>;
  @ViewChild('summaryArea') summaryArea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('educationArea') educationArea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('skillsArea') skillsArea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('coursesArea') coursesArea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('languagesArea') languagesArea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('hobbiesArea') hobbiesArea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('previewPhoto') previewPhoto!: ElementRef<HTMLDivElement>;
  activeTextarea: HTMLTextAreaElement | null = null;
  uploadedPhoto: string | null = null;
  userData: { [key: string]: string } = {};
  isModalVisible = false;
  modalTitle = '';
  modalMessage = '';
  modalConfirmText = 'OK';
  isOverlayActive = false;

  previewSections = [
    { id: 'preview-job-title', heading: '', display: 'block' },
    { id: 'preview-first-name', heading: '', display: 'block' },
    { id: 'preview-last-name', heading: '', display: 'block' },
    { id: 'preview-email', heading: '', display: 'block' },
    { id: 'preview-phone', heading: '', display: 'block' },
    { id: 'preview-city', heading: '', display: 'block' },
    { id: 'preview-postal-code', heading: '', display: 'block' },
    { id: 'preview-summary', heading: 'Podsumowanie Zawodowe', display: 'none' },
    { id: 'preview-education', heading: 'Wykształcenie', display: 'none' },
    { id: 'preview-skills', heading: 'Umiejętności', display: 'none' },
    { id: 'preview-courses', heading: 'Kursy i certyfikaty', display: 'none' },
    { id: 'preview-languages', heading: 'Języki', display: 'none' },
    { id: 'preview-hobbies', heading: 'Hobby', display: 'none' }
  ];
  

  toggleOverlay(): void {
    this.isOverlayActive = !this.isOverlayActive;
  }
  ngOnInit(): void {
    console.log(this.cvPreview);
  }
  constructor(private renderer: Renderer2, private pdfService: PdfService) {
    console.log(this.cvPreview);
  }

  private showModal(
    title: string,
    message: string,
    confirmText: string = 'OK'
  ): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalConfirmText = confirmText;
    this.isModalVisible = true;
  }

  // Metoda wyłączająca modal
  onModalConfirm(): void {
    this.isModalVisible = false;
  }

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = this.renderer.createElement('img');
        this.renderer.setAttribute(img, 'src', e.target?.result as string);
        this.renderer.setAttribute(img, 'alt', 'Uploaded Photo');
        this.renderer.setStyle(img, 'max-width', '150px');
        this.renderer.setStyle(img, 'max-height', '150px');
        this.renderer.setStyle(img, 'border-radius', '50%');
        this.renderer.setStyle(img, 'overflow', 'hidden');


        this.renderer.setProperty(
          this.previewPhoto.nativeElement,
          'innerHTML',
          ''
        );
        this.renderer.appendChild(this.previewPhoto.nativeElement, img);

        this.uploadedPhoto = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  generateAndUploadCv(): void {
    const userId = sessionStorage.getItem('userId'); 
    if (!userId) {
      console.error('User ID not found');
      this.showModal('Błąd', 'Nie znaleziono ID użytkownika.');
      return;
    }

    this.pdfService
      .generateAndUploadPdf('cv-preview', parseInt(userId))
      .then(() => {
        this.showModal(
          'Sukces',
          'CV zostało pomyślnie stworzone i wysłane!',
          'OK'
        );
      })
      .catch((error) => {
        console.error('Wystąpił błąd przy tworzeniu CV:', error);
        this.showModal(
          'Błąd',
          'Wystąpił błąd przy tworzeniu CV. Spróbuj ponownie.',
          'OK'
        );
      });
  }

  updatePreview(eventOrField: Event | string, value?: string): void {
    let inputId = '';
    let inputValue = '';
    if (typeof eventOrField !== 'string') {
      const target = eventOrField.target as
        | HTMLInputElement
        | HTMLTextAreaElement;
      inputId = target.id;
      inputValue = target.value;
    } else {
      inputId = eventOrField;
      inputValue = value || '';
    }
    this.userData[inputId] = inputValue;

    const previewElement = document.getElementById('preview-' + inputId);
    if (previewElement) {
      const paragraph = previewElement.querySelector('p');
      const header = previewElement.querySelector('h3');

      
      const displayValue = ['email', 'phone', 'city', 'postal-code'].includes(
        inputId
      )
        ? 'flex'
        : 'block';

      if (paragraph) {
        this.renderer.setProperty(paragraph, 'innerHTML', inputValue);
      }
      if (inputValue.trim() === '') {
        if (paragraph) this.renderer.setStyle(paragraph, 'display', 'none');
        if (header) this.renderer.setStyle(header, 'display', 'none');
        this.renderer.setStyle(previewElement, 'display', 'none'); // Ukryj całą sekcję
      } else {
        if (paragraph)
          this.renderer.setStyle(paragraph, 'display', displayValue);
        if (header) this.renderer.setStyle(header, 'display', displayValue);
        this.renderer.setStyle(previewElement, 'display', displayValue); // Pokaż całą sekcję
      }
    }
  }

  setActiveTextarea(area: HTMLTextAreaElement): void {
    this.activeTextarea = area;
  }

  insertTag(tag: string): void {
    if (this.activeTextarea) {
      const textarea = this.activeTextarea;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      textarea.value = text.substring(0, start) + tag + text.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + tag.length / 2;
      textarea.focus();
      this.updatePreview({ target: textarea } as unknown as Event);
    } else {
      console.log('No active textarea found.');
    }
  }
  ngAfterViewInit(): void {
    this.adjustTemplate();
    console.log(this.cvPreview);
  }

  adjustTemplate(): void {
    const selectedTemplate = localStorage.getItem('selectTemplate');
    const cvPreviewElement = this.cvPreview.nativeElement;

    if (selectedTemplate) {
      switch (selectedTemplate) {
        case 'cv-classic':
          this.renderer.addClass(cvPreviewElement, 'cv-classic-style');
          this.applyClassicTemplate(cvPreviewElement);
          break;
        case 'cv-modern':
          this.renderer.addClass(cvPreviewElement, 'cv-modern-style');
          this.applyModernTemplate(cvPreviewElement);
          break;
        case 'cv-creative':
          this.renderer.addClass(cvPreviewElement, 'cv-creative-style');
          this.applyCreativeTemplate(cvPreviewElement);
          break;
        case 'cv-mini':
          this.renderer.addClass(cvPreviewElement, 'cv-mini-style');
          this.applyMiniTemplate(cvPreviewElement);
          break;
        default:
          break;
      }
    }
  }

  private applyClassicTemplate(cvPreviewElement: HTMLElement): void {
    const firstName = document.getElementById('preview-first-name');
    const lastName = document.getElementById('preview-last-name');
    const jobTitle = document.getElementById('preview-job-title');

    const personalInfoBoxes = this.renderer.createElement('div');
    this.renderer.addClass(personalInfoBoxes, 'personal-info-boxes');

    if (jobTitle && firstName && lastName) {
      this.renderer.appendChild(personalInfoBoxes, jobTitle);
      this.renderer.appendChild(personalInfoBoxes, firstName);
      this.renderer.appendChild(personalInfoBoxes, lastName);
      this.renderer.insertBefore(
        cvPreviewElement,
        personalInfoBoxes,
        cvPreviewElement.firstChild
      );
    }

    const personalDataBox = this.renderer.createElement('div');
    this.renderer.addClass(personalDataBox, 'personal-data-boxes');

    const sections = [
      { id: 'preview-email', icon: 'fa-envelope' },
      { id: 'preview-phone', icon: 'fa-phone' },
      { id: 'preview-city', icon: 'fa-city' },
      { id: 'preview-postal-code', icon: 'fa-map-marker-alt' },
    ];

    sections.forEach((section) => {
      const sectionElement = document.getElementById(section.id);
      if (sectionElement) {
        const iconElement = this.renderer.createElement('i');
        this.renderer.addClass(iconElement, 'fa');
        this.renderer.addClass(iconElement, section.icon);
        this.renderer.addClass(sectionElement, 'personal-data-box');
        this.renderer.insertBefore(
          sectionElement,
          iconElement,
          sectionElement.firstChild
        );
        this.renderer.appendChild(personalDataBox, sectionElement);
      }
    });

    const previewSummary = document.getElementById('preview-summary');
    if (previewSummary) {
      this.renderer.insertBefore(
        cvPreviewElement,
        personalDataBox,
        previewSummary.nextSibling
      );
    }

    const mainBox = this.renderer.createElement('div');
    this.renderer.addClass(mainBox, 'main-box');

    const mainBoxLeft = this.renderer.createElement('div');
    this.renderer.addClass(mainBoxLeft, 'main-box-left');

    const sectionsLeft = [
      'preview-summary',
      'preview-education',
      'preview-skills',
      'preview-courses',
    ];

    sectionsLeft.forEach((id) => {
      const sectionElement = document.getElementById(id);
      if (sectionElement) {
        this.renderer.appendChild(mainBoxLeft, sectionElement);
      }
    });

    this.renderer.appendChild(mainBox, mainBoxLeft);

    const mainBoxRight = this.renderer.createElement('div');
    this.renderer.addClass(mainBoxRight, 'main-box-right');

    const sectionsRight = ['preview-languages', 'preview-hobbies'];

    sectionsRight.forEach((id) => {
      const sectionElement = document.getElementById(id);
      if (sectionElement) {
        this.renderer.appendChild(mainBoxRight, sectionElement);
      }
    });

    this.renderer.appendChild(mainBox, mainBoxRight);
    this.renderer.appendChild(cvPreviewElement, mainBox);
  }

  private applyModernTemplate(cvPreviewElement: HTMLElement): void {
    const photosSection = this.renderer.createElement('div');
    this.renderer.addClass(photosSection, 'photos-section');

    for (let i = 1; i <= 4; i++) {
      const photo = this.renderer.createElement('img');
      this.renderer.setAttribute(photo, 'src', `img/${i}.png`);
      this.renderer.addClass(photo, `photo-${i}`);
      this.renderer.addClass(photo, 'photo');
      this.renderer.setAttribute(photo, 'alt', `Zdjęcie ${i}`);
      this.renderer.appendChild(photosSection, photo);
    }

    this.renderer.insertBefore(
      cvPreviewElement,
      photosSection,
      cvPreviewElement.firstChild
    );

    const personalInfoBoxesModern = this.renderer.createElement('div');
    this.renderer.addClass(
      personalInfoBoxesModern,
      'personal-info-boxes-modern'
    );

    const firstNameModern = document.getElementById('preview-first-name');
    const lastNameModern = document.getElementById('preview-last-name');
    const jobTitleModern = document.getElementById('preview-job-title');

    if (jobTitleModern && firstNameModern && lastNameModern) {
      this.renderer.appendChild(personalInfoBoxesModern, jobTitleModern);
      this.renderer.appendChild(personalInfoBoxesModern, firstNameModern);
      this.renderer.appendChild(personalInfoBoxesModern, lastNameModern);
      this.renderer.insertBefore(
        cvPreviewElement,
        personalInfoBoxesModern,
        cvPreviewElement.firstChild
      );
    }

    const personalDataBoxModern = this.renderer.createElement('div');
    this.renderer.addClass(personalDataBoxModern, 'personal-data-boxes-modern');

    const sectionsModern = [
      { id: 'preview-email', icon: 'fa-envelope' },
      { id: 'preview-phone', icon: 'fa-phone' },
      { id: 'preview-city', icon: 'fa-city' },
      { id: 'preview-postal-code', icon: 'fa-map-marker-alt' },
    ];

    sectionsModern.forEach((section) => {
      const sectionElement = document.getElementById(section.id);
      if (sectionElement) {
        const iconElement = this.renderer.createElement('i');
        this.renderer.addClass(iconElement, 'fa');
        this.renderer.addClass(iconElement, section.icon);
        this.renderer.addClass(sectionElement, 'personal-data-box-modern');
        this.renderer.insertBefore(
          sectionElement,
          iconElement,
          sectionElement.firstChild
        );
        this.renderer.appendChild(personalDataBoxModern, sectionElement);
      }
    });

    const previewSummaryModern = document.getElementById('preview-summary');
    if (previewSummaryModern) {
      this.renderer.insertBefore(
        cvPreviewElement,
        personalDataBoxModern,
        previewSummaryModern.nextSibling
      );
    }

    const mainBoxModern = this.renderer.createElement('div');
    this.renderer.addClass(mainBoxModern, 'main-box-modern');

    const mainBoxLeftModern = this.renderer.createElement('div');
    this.renderer.addClass(mainBoxLeftModern, 'main-box-left-modern');

    const sectionsLeftModern = [
      'preview-summary',
      'preview-education',
      'preview-skills',
      'preview-courses',
    ];

    sectionsLeftModern.forEach((id) => {
      const sectionElement = document.getElementById(id);
      if (sectionElement) {
        this.renderer.appendChild(mainBoxLeftModern, sectionElement);
      }
    });

    this.renderer.appendChild(mainBoxModern, mainBoxLeftModern);

    const mainBoxRightModern = this.renderer.createElement('div');
    this.renderer.addClass(mainBoxRightModern, 'main-box-right-modern');

    const sectionsRightModern = ['preview-languages', 'preview-hobbies'];

    sectionsRightModern.forEach((id) => {
      const sectionElement = document.getElementById(id);
      if (sectionElement) {
        this.renderer.appendChild(mainBoxRightModern, sectionElement);
      }
    });

    this.renderer.appendChild(mainBoxModern, mainBoxRightModern);
    this.renderer.appendChild(cvPreviewElement, mainBoxModern);
  }

  private applyCreativeTemplate(cvPreviewElement: HTMLElement): void {
    const personalInfoCreative = this.renderer.createElement('div');
    this.renderer.addClass(personalInfoCreative, 'personal-info-creative');

    const firstNameCreative = document.getElementById('preview-first-name');
    const lastNameCreative = document.getElementById('preview-last-name');
    const jobTitleCreative = document.getElementById('preview-job-title');

    if (jobTitleCreative && firstNameCreative && lastNameCreative) {
      this.renderer.appendChild(personalInfoCreative, jobTitleCreative);
      this.renderer.appendChild(personalInfoCreative, firstNameCreative);
      this.renderer.appendChild(personalInfoCreative, lastNameCreative);
    }

    const personalDataBoxCreative = this.renderer.createElement('div');
    this.renderer.addClass(
      personalDataBoxCreative,
      'personal-data-box-creative'
    );

    const sectionsCreative = [
      { id: 'preview-email', icon: 'fa-envelope' },
      { id: 'preview-phone', icon: 'fa-phone' },
      { id: 'preview-city', icon: 'fa-city' },
      { id: 'preview-postal-code', icon: 'fa-map-marker-alt' },
    ];

    sectionsCreative.forEach((section) => {
      const sectionElement = document.getElementById(section.id);
      if (sectionElement) {
        const iconElement = this.renderer.createElement('i');
        this.renderer.addClass(iconElement, 'fa');
        this.renderer.addClass(iconElement, section.icon);
        this.renderer.addClass(
          sectionElement,
          'personal-data-box-creative-item'
        );
        this.renderer.insertBefore(
          sectionElement,
          iconElement,
          sectionElement.firstChild
        );
        this.renderer.appendChild(personalDataBoxCreative, sectionElement);
      }
    });

    const mainBoxLeftCreative = this.renderer.createElement('div');
    this.renderer.addClass(mainBoxLeftCreative, 'main-box-left-creative');

    this.renderer.appendChild(mainBoxLeftCreative, personalInfoCreative);

    const sectionsLeftCreative = [
      'preview-summary',
      'preview-education',
      'preview-skills',
    ];

    sectionsLeftCreative.forEach((id) => {
      const sectionElement = document.getElementById(id);
      if (sectionElement) {
        this.renderer.appendChild(mainBoxLeftCreative, sectionElement);
      }
    });

    const mainBoxRightCreative = this.renderer.createElement('div');
    this.renderer.addClass(mainBoxRightCreative, 'main-box-right-creative');

    this.renderer.appendChild(mainBoxRightCreative, personalDataBoxCreative);

    const sectionsRightCreative = [
      'preview-courses',
      'preview-languages',
      'preview-hobbies',
    ];

    sectionsRightCreative.forEach((id) => {
      const sectionElement = document.getElementById(id);
      if (sectionElement) {
        this.renderer.appendChild(mainBoxRightCreative, sectionElement);
      }
    });

    this.renderer.appendChild(cvPreviewElement, mainBoxLeftCreative);
    this.renderer.appendChild(cvPreviewElement, mainBoxRightCreative);
  }

  private applyMiniTemplate(cvPreviewElement: HTMLElement): void {
    const mainBoxMiniLeft = this.renderer.createElement('div');
    this.renderer.addClass(mainBoxMiniLeft, 'main-box-mini-left');

    const mainBoxMiniRight = this.renderer.createElement('div');
    this.renderer.addClass(mainBoxMiniRight, 'main-box-mini-right');

    const personalDataBoxMini = this.renderer.createElement('div');
    this.renderer.addClass(personalDataBoxMini, 'personal-data-box-mini');

    const sectionsMini = [
      { id: 'preview-email', icon: 'fa-envelope' },
      { id: 'preview-phone', icon: 'fa-phone' },
      { id: 'preview-city', icon: 'fa-city' },
      { id: 'preview-postal-code', icon: 'fa-map-marker-alt' },
    ];

    sectionsMini.forEach((section) => {
      const sectionElement = document.getElementById(section.id);
      if (sectionElement) {
        const iconElement = this.renderer.createElement('i');
        this.renderer.addClass(iconElement, 'fa');
        this.renderer.addClass(iconElement, section.icon);
        this.renderer.addClass(sectionElement, 'personal-data-box-mini-item');
        this.renderer.insertBefore(
          sectionElement,
          iconElement,
          sectionElement.firstChild
        );
        this.renderer.appendChild(personalDataBoxMini, sectionElement);
      }
    });

    this.renderer.appendChild(mainBoxMiniLeft, personalDataBoxMini);

    const sectionsToAdd = [
      'preview-skills',
      'preview-courses',
      'preview-hobbies',
    ];

    sectionsToAdd.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        const hrElement = this.renderer.createElement('hr');
        this.renderer.appendChild(element, hrElement);
        this.renderer.appendChild(mainBoxMiniLeft, element);
      }
    });

    const sectionsToRight = [
      'preview-summary',
      'preview-education',
      'preview-languages',
    ];

    sectionsToRight.forEach((id) => {
      const sectionElement = document.getElementById(id);
      if (sectionElement) {
        const infoContainer = this.renderer.createElement('div');
        this.renderer.addClass(infoContainer, 'cv-section-info');

        const h3Element = sectionElement.querySelector('h3');
        if (h3Element) {
          const hrElement = this.renderer.createElement('hr');
          this.renderer.appendChild(infoContainer, h3Element);
          this.renderer.appendChild(infoContainer, hrElement);
        }

        const idContainer = document.getElementById(sectionElement.id);
        if (idContainer) {
          this.renderer.appendChild(idContainer, infoContainer);

          const pElement = sectionElement.querySelector('p');
          if (pElement) {
            this.renderer.appendChild(idContainer, pElement);
          }

          this.renderer.appendChild(mainBoxMiniRight, idContainer);
        }
      }
    });

    this.renderer.appendChild(cvPreviewElement, mainBoxMiniLeft);
    this.renderer.appendChild(cvPreviewElement, mainBoxMiniRight);

    const authorContainer = this.renderer.createElement('div');
    this.renderer.addClass(authorContainer, 'cv-mini-style-author');

    const photoElement = document.getElementById('preview-photo');
    const firstNameElement = document.getElementById('preview-first-name');
    const lastNameElement = document.getElementById('preview-last-name');
    const jobTitleElement = document.getElementById('preview-job-title');

    if (photoElement) this.renderer.appendChild(authorContainer, photoElement);

    const nameContainer = this.renderer.createElement('div');
    this.renderer.addClass(nameContainer, 'cv-mini-style-author-name');

    if (firstNameElement)
      this.renderer.appendChild(nameContainer, firstNameElement);
    if (lastNameElement)
      this.renderer.appendChild(nameContainer, lastNameElement);

    this.renderer.appendChild(authorContainer, nameContainer);

    if (jobTitleElement)
      this.renderer.appendChild(authorContainer, jobTitleElement);

    this.renderer.insertBefore(
      cvPreviewElement,
      authorContainer,
      cvPreviewElement.firstChild
    );
  }
}
