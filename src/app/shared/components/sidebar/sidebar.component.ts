import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  isCollapsed = signal(false);
  currentRoute = signal('');

  navigation = [
    { path: '/dashboard', label: 'الرئيسية', icon: '🏠' },
    { path: '/rooms', label: 'إدارة الغرف', icon: '🛏️' },
    { path: '/customers', label: 'إدارة العملاء', icon: '👤' },
    { path: '/bookings', label: 'إدارة الحجوزات', icon: '📅' },
    { path: '/calendar', label: 'التقويم', icon: '📆' },
    { path: '/search', label: 'البحث', icon: '🔍' },
  ];

  constructor(private router: Router, private authService: AuthService) {
    this.currentRoute.set(router.url);
    router.events.subscribe(() => {
      this.currentRoute.set(router.url || '');
    });
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }

  logout(): void {
    this.authService.logout();
  }

  toggleCollapse(): void {
    this.isCollapsed.update(v => !v);
  }

  isActive(path: string): boolean {
    return this.currentRoute().startsWith(path);
  }
}
