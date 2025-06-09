import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-main',
  imports: [RouterLink],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  @ViewChild('imageList') imageList!: ElementRef;
  @ViewChild('sliderScrollbar') sliderScrollbar!: ElementRef;
  @ViewChild('scrollbarThumb') scrollbarThumb!: ElementRef;
  @ViewChild('prevSlideButton') prevSlideButton!: ElementRef;
  @ViewChild('nextSlideButton') nextSlideButton!: ElementRef;
  @ViewChild('stepOneBtn') stepOneBtn!: ElementRef;
  @ViewChild('stepTwoBtn') stepTwoBtn!: ElementRef;
  @ViewChild('stepThreeBtn') stepThreeBtn!: ElementRef;
  @ViewChild('bottomBoxOne') bottomBoxOne!: ElementRef;
  @ViewChild('bottomBoxTwo') bottomBoxTwo!: ElementRef;
  @ViewChild('bottomBoxThree') bottomBoxThree!: ElementRef;
  templateItems = [
    {
      image: 'img/accountant-cv.svg',
      alt: 'img-1',
      title: 'Szablon Nowoczesny'
    },
    {
      image: 'img/hericv.svg',
      alt: 'img-2',
      title: 'Szablon Klasyczny'
    },
    {
      image: 'img/cv-4.png',
      alt: 'img-3',
      title: 'Szablon Kreatywny'
    },
    {
      image: 'img/research-assistant-example-CV.svg',
      alt: 'img-4',
      title: 'Szablon Profesjonalny'
    },
    {
      image: 'img/accountant-cv.svg',
      alt: 'img-5',
      title: 'Szablon Minimalistyczny'
    }
  ];
  allStepsBtns: ElementRef[] = [];
  allBottomBoxes: ElementRef[] = [];
  currentIndex = 0;
  intervalId: any;
  ngAfterViewInit() {
    this.initSlider();
    window.addEventListener('resize', this.initSlider.bind(this));
    this.allStepsBtns = [this.stepOneBtn, this.stepTwoBtn, this.stepThreeBtn];
    this.allBottomBoxes = [
      this.bottomBoxOne,
      this.bottomBoxTwo,
      this.bottomBoxThree,
    ];

    this.stepOneBtn.nativeElement.addEventListener(
      'click',
      this.handleBtnStep.bind(this)
    );
    this.stepTwoBtn.nativeElement.addEventListener(
      'click',
      this.handleBtnStep.bind(this)
    );
    this.stepThreeBtn.nativeElement.addEventListener(
      'click',
      this.handleBtnStep.bind(this)
    );

    this.intervalId = setInterval(this.cycleActiveClass.bind(this), 10000);
    this.cycleActiveClass();
  }

  handleBtnStep(event: any) {
    this.allStepsBtns.forEach(btn => btn.nativeElement.classList.remove('active'));
    this.allBottomBoxes.forEach(box => box.nativeElement.classList.remove('active-box'));
  
    const clickedBtn = event.target;
    const index = this.allStepsBtns.findIndex(btn => btn.nativeElement === clickedBtn);
  
    if (index === -1) return; 
  
    clickedBtn.classList.add('active');
    this.allBottomBoxes[index].nativeElement.classList.add('active-box');
  
    this.currentIndex = index;
  
    clearInterval(this.intervalId);
    this.intervalId = setInterval(this.cycleActiveClass.bind(this), 10000);
  }
  

  cycleActiveClass() {
    this.allStepsBtns.forEach(btn => btn.nativeElement.classList.remove('active'));
    this.allBottomBoxes.forEach(box => box.nativeElement.classList.remove('active-box'));

    this.allStepsBtns[this.currentIndex].nativeElement.classList.add('active');
    this.allBottomBoxes[this.currentIndex].nativeElement.classList.add('active-box');

    this.currentIndex = (this.currentIndex + 1) % this.allStepsBtns.length;
  }

  initSlider() {
    const imageList = this.imageList.nativeElement;
    const slideButtons = [
      this.prevSlideButton.nativeElement,
      this.nextSlideButton.nativeElement,
    ];
    const sliderScrollbar = this.sliderScrollbar.nativeElement;
    const scrollbarThumb = this.scrollbarThumb.nativeElement;
    const maxScrollLeft = imageList.scrollWidth - imageList.clientWidth;

    scrollbarThumb.addEventListener('mousedown', (e: MouseEvent) => {
      const startX = e.clientX;
      const thumbPosition = scrollbarThumb.offsetLeft;
      const maxThumbPosition =
        sliderScrollbar.getBoundingClientRect().width -
        scrollbarThumb.offsetWidth;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - startX;
        const newThumbPosition = thumbPosition + deltaX;
        const boundedPosition = Math.max(
          0,
          Math.min(maxThumbPosition, newThumbPosition)
        );
        const scrollPosition =
          (boundedPosition / maxThumbPosition) * maxScrollLeft;

        scrollbarThumb.style.left = `${boundedPosition}px`;
        imageList.scrollLeft = scrollPosition;
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    });

    slideButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const direction = button.id === 'prev-slide' ? -1 : 1;
        const scrollAmount = imageList.clientWidth * direction;
        imageList.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });
    });

    const handleSlideButtons = () => {
      slideButtons[0].style.display =
        imageList.scrollLeft <= 0 ? 'none' : 'flex';
      slideButtons[1].style.display =
        imageList.scrollLeft >= maxScrollLeft ? 'none' : 'flex';
    };

    const updateScrollThumbPosition = () => {
      const scrollPosition = imageList.scrollLeft;
      const thumbPosition =
        (scrollPosition / maxScrollLeft) *
        (sliderScrollbar.clientWidth - scrollbarThumb.offsetWidth);
      scrollbarThumb.style.left = `${thumbPosition}px`;
    };

    imageList.addEventListener('scroll', () => {
      updateScrollThumbPosition();
      handleSlideButtons();
    });
  }
}
