import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AuditLog {
  id: number;
  timestamp: Date;
  user: string;
  action: string;
  entity: string;
  details: string;
  ipAddress?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private logsSubject = new BehaviorSubject<AuditLog[]>([]);
  logs$ = this.logsSubject.asObservable();

  private mockLogs: AuditLog[] = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      user: 'مدير النظام',
      action: 'تسجيل الدخول',
      entity: 'المستخدم',
      details: 'تم تسجيل الدخول بنجاح',
      ipAddress: '192.168.1.1'
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      user: 'مدير النظام',
      action: 'إضافة',
      entity: 'غرفة',
      details: 'تمت إضافة غرفة رقم 301',
      ipAddress: '192.168.1.1'
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      user: 'مدير النظام',
      action: 'حجز',
      entity: 'حجز',
      details: 'تم إنشاء حجز جديد للغرفة 102',
      ipAddress: '192.168.1.1'
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      user: 'مدير النظام',
      action: 'تحديث',
      entity: 'عميل',
      details: 'تم تحديث بيانات العميل أحمد محمد',
      ipAddress: '192.168.1.1'
    },
    {
      id: 5,
      timestamp: new Date(Date.now() - 1000 * 60 * 180),
      user: 'مدير النظام',
      action: 'حذف',
      entity: 'حجز',
      details: 'تم حذف حجل رقم 15',
      ipAddress: '192.168.1.1'
    }
  ];

  constructor() {
    this.logsSubject.next([...this.mockLogs]);
  }

  getLogs(): Observable<AuditLog[]> {
    return this.logsSubject.asObservable();
  }

  logAction(action: string, entity: string, details: string, user: string = 'مدير النظام'): void {
    const newLog: AuditLog = {
      id: Math.max(...this.mockLogs.map(l => l.id)) + 1,
      timestamp: new Date(),
      user,
      action,
      entity,
      details,
      ipAddress: '192.168.1.1'
    };
    
    this.mockLogs.unshift(newLog);
    this.logsSubject.next([...this.mockLogs]);
  }

  getRecentLogs(count: number = 10): AuditLog[] {
    return this.mockLogs.slice(0, count);
  }

  filterLogs(filter: {
    user?: string;
    action?: string;
    entity?: string;
    startDate?: Date;
    endDate?: Date;
  }): Observable<AuditLog[]> {
    let filtered = [...this.mockLogs];
    
    if (filter.user) {
      filtered = filtered.filter(log => log.user === filter.user);
    }
    if (filter.action) {
      filtered = filtered.filter(log => log.action === filter.action);
    }
    if (filter.entity) {
      filtered = filtered.filter(log => log.entity === filter.entity);
    }
    if (filter.startDate) {
      filtered = filtered.filter(log => log.timestamp >= filter.startDate!);
    }
    if (filter.endDate) {
      filtered = filtered.filter(log => log.timestamp <= filter.endDate!);
    }
    
    return new Observable(observer => {
      observer.next(filtered);
      observer.complete();
    });
  }
}
