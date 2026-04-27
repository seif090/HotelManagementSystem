import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent {
  darkMode = signal(false);
  showNotifications = signal(false);
  user = signal<any>(null);
  
  notifications = [
    { id: 1, type: 'success', message: 'تم تسجيل حجز جديد للغرفة 102', time: 'الآن' },
    { id: 2, type: 'warning', message: 'غرفة 104 قيد الصيانة', time: 'منذ ساعة' },
    { id: 3, type: 'info', message: 'تم تسجيل خروج العميل محمد', time: 'منذ ساعتين' },
  ];

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private router: Router
  ) {
    this.authService.user$.subscribe(u => this.user.set(u));
  }

  toggleDarkMode(): void {
    this.darkMode.update(v => !v);
    document.documentElement.setAttribute('data-theme', this.darkMode() ? 'dark' : 'light');
  }

  toggleNotifications(): void {
    this.showNotifications.update(v => !v);
  }

  clearNotifications(): void {
    this.notifications = [];
    this.notificationService.clearAll();
  }

  logout(): void {
    this.authService.logout();
  }

  get unreadCount(): number {
    return this.notifications.length;
  }

  getPageTitle(): string {
    const url = this.router.url;
    const titles: {[key: string]: string} = {
      '/dashboard': 'لوحة التحكم',
      '/rooms': 'إدارة الغرف',
      '/customers': 'إدارة العملاء',
      '/bookings': 'إدارة الحجوزات',
      '/calendar': 'التقويم',
      '/search': 'البحث'
    };
    return titles[url] || 'نظام إدارة الفندق';
  }
}
