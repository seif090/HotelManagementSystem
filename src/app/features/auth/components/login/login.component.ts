import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm = signal({
    email: 'admin@hotel.com',
    password: 'admin123',
    remember: true
  });
  
  loading = signal(false);
  showPassword = signal(false);

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.loading()) return;
    
    if (!this.loginForm().email || !this.loginForm().password) {
      this.notificationService.showError('يرجى تعبئة جميع الحقول');
      return;
    }

    this.loading.set(true);
    
    // Use mock login for demo
    this.authService.mockLogin(this.loginForm()).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.notificationService.showSuccess('تم تسجيل الدخول بنجاح');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading.set(false);
        this.notificationService.showError(error?.error?.message || 'خطأ في تسجيل الدخول');
      }
    });
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }
}
