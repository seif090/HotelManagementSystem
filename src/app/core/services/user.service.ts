>
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff' | 'guest';
  permissions: string[];
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();

  private mockUsers: User[] = [
    {
      id: 1,
      name: 'مدير النظام',
      email: 'admin@hotel.com',
      role: 'admin',
      permissions: ['all'],
      active: true,
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'أحمد محمد',
      email: 'ahmed@hotel.com',
      role: 'manager',
      permissions: ['manage_rooms', 'manage_bookings', 'view_reports'],
      active: true,
      createdAt: '2024-02-20'
    },
    {
      id: 3,
      name: 'سارة علي',
      email: 'sara@hotel.com',
      role: 'staff',
      permissions: ['manage_bookings', 'check_in_out'],
      active: true,
      createdAt: '2024-03-10'
    },
    {
      id: 4,
      name: 'خالد عبدالله',
      email: 'khalid@hotel.com',
      role: 'staff',
      permissions: ['check_in_out'],
      active: false,
      createdAt: '2024-04-05'
    },
    {
      id: 5,
      name: 'زينب حسن',
      email: 'zainab@hotel.com',
      role: 'guest',
      permissions: ['view_profile'],
      active: true,
      createdAt: '2024-05-12'
    }
  ];

  private permissions: Permission[] = [
    { id: 'all', name: 'الوصول الكامل', description: 'جميع الصلاحيات', category: 'system' },
    { id: 'manage_rooms', name: 'إدارة الغرف', description: 'إضافة وتعديل وحذف الغرف', category: 'rooms' },
    { id: 'manage_bookings', name: 'إدارة الحجوزات', description: 'إنشاء وتعديل الحجوزات', category: 'bookings' },
    { id: 'check_in_out', name: 'تسجيل الدخول والخروج', description: 'تسجيل وصول ومغادرة الضيوف', category: 'bookings' },
    { id: 'view_reports', name: 'عرض التقارير', description: 'الوصول إلى التقارير والإحصائيات', category: 'reports' },
    { id: 'manage_users', name: 'إدارة المستخدمين', description: 'إضافة وتعديل المستخدمين', category: 'system' },
    { id: 'manage_settings', name: 'إعدادات النظام', description: 'تعديل إعدادات النظام', category: 'system' },
    { id: 'view_profile', name: 'عرض الملف الشخصي', description: 'عرض معلومات المستخدم', category: 'profile' }
  ];

  constructor() {
    this.usersSubject.next([...this.mockUsers]);
  }

  getAllUsers(): Observable<User[]> {
    return this.usersSubject.asObservable();
  }

  getUser(id: number): Observable<User | undefined> {
    return new Observable(observer => {
      const user = this.mockUsers.find(u => u.id === id);
      observer.next(user);
      observer.complete();
    });
  }

  addUser(user: Omit<User, 'id' | 'createdAt'>): Observable<User> {
    return new Observable(observer => {
      const newUser: User = {
        ...user,
        id: Math.max(...this.mockUsers.map(u => u.id)) + 1,
        createdAt: new Date().toISOString().split('T')[0]
      };
      this.mockUsers.push(newUser);
      this.usersSubject.next([...this.mockUsers]);
      observer.next(newUser);
      observer.complete();
    });
  }

  updateUser(id: number, user: Partial<User>): Observable<User | undefined> {
    return new Observable(observer => {
      const index = this.mockUsers.findIndex(u => u.id === id);
      if (index > -1) {
        this.mockUsers[index] = { ...this.mockUsers[index], ...user };
        this.usersSubject.next([...this.mockUsers]);
        observer.next(this.mockUsers[index]);
      } else {
        observer.next(undefined);
      }
      observer.complete();
    });
  }

  deleteUser(id: number): Observable<boolean> {
    return new Observable(observer => {
      const index = this.mockUsers.findIndex(u => u.id === id);
      if (index > -1) {
        this.mockUsers.splice(index, 1);
        this.usersSubject.next([...this.mockUsers]);
        observer.next(true);
      } else {
        observer.next(false);
      }
      observer.complete();
    });
  }

  getPermissions(): Permission[] {
    return [...this.permissions];
  }

  getPermissionsByCategory(): {[key: string]: Permission[]} {
    return this.permissions.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {} as {[key: string]: Permission[]});
  }

  checkPermission(user: User, permissionId: string): boolean {
    return user.permissions.includes('all') || user.permissions.includes(permissionId);
  }

  toggleUserStatus(id: number): Observable<User | undefined> {
    return new Observable(observer => {
      const user = this.mockUsers.find(u => u.id === id);
      if (user) {
        user.active = !user.active;
        this.usersSubject.next([...this.mockUsers]);
        observer.next(user);
      } else {
        observer.next(undefined);
      }
      observer.complete();
    });
  }
}
