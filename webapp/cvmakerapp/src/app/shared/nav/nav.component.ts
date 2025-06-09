import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, viewChild, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-nav',
  imports: [RouterLink,CommonModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent {
  isNavOpen = false;
  @ViewChild('hamburgerButton') hamburgerButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('navDesktop') navDesktop!: ElementRef<HTMLDivElement>;
  @ViewChild('navMobile') navMobile!: ElementRef<HTMLDivElement>;
  toggleNav(): void {
    this.isNavOpen = !this.isNavOpen;
    this.hamburgerButton.nativeElement.classList.toggle('is-active');
    this.navMobile.nativeElement.classList.toggle('nav__mobile--active');
    this.updateNavVisibility();
  }

  isLoggedIn = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.isLoggedIn.subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
    });
  }

  logout(): void {
    this.authService.logout();
  }
  closeNav(): void {
    this.isNavOpen = false;
  }
  get role(){
    return sessionStorage.getItem('role');
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.nav__mobile') && !target.closest('.hamburger') && this.isNavOpen) {
      this.closeNav();
    }
  }
  updateNavVisibility(): void {
    if(this.navMobile.nativeElement.classList.contains('nav__mobile--active')) {
      document.body.style.overflow = 'hidden';
    }else{
      document.body.style.overflow = '';
    }
  }
}