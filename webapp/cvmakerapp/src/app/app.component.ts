import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/footer/footer.component';
import { NavComponent } from './shared/nav/nav.component';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent, NavComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'cvmakerapp';
  showHeaderFooter = true;
  router = inject(Router);
  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const currentRoute =
          this.router.routerState.snapshot.root.firstChild?.routeConfig?.path;
          console.log(currentRoute);
        this.showHeaderFooter = (currentRoute !== '**') && (currentRoute !== 'user-panel') && (currentRoute !== 'admin-panel') && (currentRoute !== 'user-panel') && (currentRoute !== 'final-step') && (currentRoute !== 'second-step') && (currentRoute !== 'creator');
      });
  }
}
