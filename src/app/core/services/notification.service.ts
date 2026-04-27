import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();
  private toastId = 0;

  showSuccess(message: string, duration = 4000): void {
    this.addToast('success', message, duration);
  }

  showError(message: string, duration = 6000): void {
    this.addToast('error', message, duration);
  }

  showWarning(message: string, duration = 5000): void {
    this.addToast('warning', message, duration);
  }

  showInfo(message: string, duration = 4000): void {
    this.addToast('info', message, duration);
  }

  private addToast(type: Toast['type'], message: string, duration: number): void {
    const id = ++this.toastId;
    const newToast: Toast = { id, type, message, duration };
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, newToast]);

    timer(duration).subscribe(() => this.removeToast(id));
  }

  removeToast(id: number): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(t => t.id !== id));
  }

  clearAll(): void {
    this.toastsSubject.next([]);
  }
}
