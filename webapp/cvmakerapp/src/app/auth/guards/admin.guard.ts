import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const isAdmin = sessionStorage.getItem('role');
    if (isAdmin === 'ROLE_ADMIN') {
      return true;
    }
    return this.router.parseUrl('/');
  }
}