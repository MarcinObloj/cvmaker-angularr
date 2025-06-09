import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-creator',
  imports: [RouterLink, CommonModule],
  templateUrl: './creator.component.html',
  styleUrl: './creator.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CreatorComponent {
  @ViewChild('swiperContainer') swiper!: ElementRef<any>;
  templates = [
    {
      id: 'cv-modern',
      img: 'img/hericv.svg',
      name: 'CV Klasyczne',
      description: 'Elegancja i prostota',
    },
    {
      id: 'cv-classic',
      img: 'img/accountant-cv.svg',
      name: 'CV nowe',
      description: 'Świeży i dynamiczny',
    },
    {
      id: 'cv-creative',
      img: 'img/research-assistant-example-CV.svg',
      name: 'CV Kreatywne',
      description: 'Dla kreatywnych',
    },
    {
      id: 'cv-mini',
      img: 'img/cv-4.png',
      name: 'CV mini',
      description: 'Proste i eleganckie',
    },
  ];

  constructor(private router: Router) {}
  ngAfterViewInit(): void {
    const swiperParams = {
      slidesPerView: 1,
      breakpoints: {
        600: {
          slidesPerView: 2,
        },
        900: {
          slidesPerView: 3,
        },
      },
      on: {
        init() {
          console.log('Swiper initialized');
        },
      },
    };

    Object.assign(this.swiper.nativeElement, swiperParams);
    this.swiper.nativeElement.initialize();
  }
  selectTemplate(templateName: string) {
    localStorage.setItem('selectTemplate', templateName);
    this.router.navigate(['/second-step']); 
  }
}
