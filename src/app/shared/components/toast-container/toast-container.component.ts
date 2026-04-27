import { Component, OnInit, signal } from '@angular/core';
import { NotificationService, Toast } from '../../../core/services/notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.scss']
})
export class ToastContainerComponent implements OnInit {
  toasts = signal<Toast[]>([]);

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.toasts$.subscribe(toasts => {
      this.toasts.set(toasts);
    });
  }

  closeToast(id: number): void {
    this.notificationService.removeToast(id);
  }

  getToastClass(type: string): string {
    return `toast-${type}`;
  }

  getToastIcon(type: string): string {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  }
}
