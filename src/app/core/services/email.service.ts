import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BookingService, Booking } from './booking.service';
import { CustomerService } from './customer.service';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  category: string;
}

export interface EmailLog {
  id: number;
  to: string;
  subject: string;
  body: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private emailLogsSubject = new BehaviorSubject<EmailLog[]>([]);
  emailLogs$ = this.emailLogsSubject.asObservable();

  private templates: EmailTemplate[] = [
    {
      id: 'booking_confirmation',
      name: 'تأكيد الحجز',
      subject: 'تأكيد حجز الفندق - رقم الحجز #{bookingId}',
      body: `
        <h2>مرحباً {customerName}</h2>
        <p>نؤكد لك حجزك في فندقنا المتميز.</p>
        
        <h3>تفاصيل الحجز:</h3>
        <ul>
          <li><strong>رقم الحجز:</strong> {bookingId}</li>
          <li><strong>الغرفة:</strong> {roomNumber} ({roomType})</li>
          <li><strong>تاريخ الدخول:</strong> {checkIn}</li>
          <li><strong>تاريخ الخروج:</strong> {checkOut}</li>
          <li><strong>عدد الليالي:</strong> {nights}</li>
          <li><strong>السعر الإجمالي:</strong> {totalPrice} ر.س</li>
        </ul>
        
        <p>نحن في انتظار وصولكم.</p>
        <p>شكراً لتفضيلكم لنا.</p>
        
        <p>أطيب التحيات،<br>إدارة الفندق</p>
      `,
      variables: ['customerName', 'bookingId', 'roomNumber', 'roomType', 'checkIn', 'checkOut', 'nights', 'totalPrice'],
      category: 'booking'
    },
    {
      id: 'check_in_reminder',
      name: 'تذكير تسجيل الدخول',
      subject: 'تذكير: تسجيل الدخول غداً - حجز رقم #{bookingId}',
      body: `
        <h2>عزيزي/عزيزتي {customerName}</h2>
        <p>نود تذكيرك بتسجيل الدخول غداً.</p>
        
        <h3>تفاصيل الحجز:</h3>
        <ul>
          <li><strong>رقم الحجز:</strong> {bookingId}</li>
          <li><strong>الغرفة:</strong> {roomNumber}</li>
          <li><strong>تاريخ الدخول:</strong> {checkIn}</li>
          <li><strong>تاريخ الخروج:</strong> {checkOut}</li>
        </ul>
        
        <p>وقت تسجيل الدخول: اعتباراً من الساعة 3:00 عصراً</p>
        <p>نرجو التواجد في مكتب الاستقبال.</p>
        
        <p>مع أطيب التحيات،<br>إدارة الفندق</p>
      `,
      variables: ['customerName', 'bookingId', 'roomNumber', 'checkIn', 'checkOut'],
      category: 'reminder'
    },
    {
      id: 'check_out_reminder',
      name: 'تذكير تسجيل الخروج',
      subject: 'تذكير: تسجيل الخروج غداً - حجز رقم #{bookingId}',
      body: `
        <h2>عزيزي/عزيزتي {customerName}</h2>
        <p>نود تذكيرك بتسجيل الخروج غداً قبل الظهر.</p>
        
        <h3>تفاصيل الحجز:</h3>
        <ul>
          <li><strong>رقم الحجز:</strong> {bookingId}</li>
          <li><strong>الغرفة:</strong> {roomNumber}</li>
          <li><strong>تاريخ الخروج:</strong> {checkOut}</li>
        </ul>
        
        <p>وقت تسجيل الخروج: قبل الساعة 12:00 ظهراً</p>
        <p>نرجو تفهمكم وتعاونكم.</p>
        
        <p>نشكر لكم ثقتكم،<br>إدارة الفندق</p>
      `,
      variables: ['customerName', 'bookingId', 'roomNumber', 'checkOut'],
      category: 'reminder'
    },
    {
      id: 'payment_reminder',
      name: 'تذكير الدفع',
      subject: 'تذكير: تأكيد دفع الحجز - رقم #{bookingId}',
      body: `
        <h2>عزيزي/عزيزتي {customerName}</h2>
        <p>نود تذكيرك بإتمام الدفع لتأكيد حجزك.</p>
        
        <h3>تفاصيل الحجز:</h3>
        <ul>
          <li><strong>رقم الحجز:</strong> {bookingId}</li>
          <li><strong>المبلغ المستحق:</strong> {amount} ر.س</li>
        </ul>
        
        <p>يمكنكم إتمام الدفع عبر قنواتنا المختلفة:</p>
        <ul>
          <li>التحويل البنكي</li>
          <li>بطاقة الائتمان</li>
          <li>الدفع عند الوصول</li>
        </ul>
        
        <p>نرجو الإسراع في إتمام الدفع لتأكيد الحجز.</p>
        
        <p>شكراً لتعاونكم،<br>إدارة الفندق</p>
      `,
      variables: ['customerName', 'bookingId', 'amount'],
      category: 'payment'
    },
    {
      id: 'cancellation',
      name: 'إلغاء الحجز',
      subject: 'إلغاء الحجز - رقم #{bookingId}',
      body: `
        <h2>عزيزي/عزيزتي {customerName}</h2>
        <p>نؤكد لكم إلغاء الحجز.</p>
        
        <h3>تفاصيل الحجز الملغي:</h3>
        <ul>
          <li><strong>رقم الحجز:</strong> {bookingId}</li>
          <li><strong>الغرفة:</strong> {roomNumber}</li>
          <li><strong>فترة الحجز:</strong> {checkIn} إلى {checkOut}</li>
        </ul>
        
        <p>نأسف لعدم تمكنكم من الزيارة ونأمل استضافتكم في المرة القادمة.</p>
        
        <p>أطيب التحيات،<br>إدارة الفندق</p>
      `,
      variables: ['customerName', 'bookingId', 'roomNumber', 'checkIn', 'checkOut'],
      category: 'booking'
    }
  ];

  private mockEmailLogs: EmailLog[] = [
    {
      id: 1,
      to: 'ahmed@hotel.com',
      subject: 'تأكيد حجز الفندق - رقم الحجز #101',
      body: '<p>تم تأكيد حجزكم...</p>',
      status: 'sent',
      sentAt: new Date().toISOString()
    },
    {
      id: 2,
      to: 'sara@hotel.com',
      subject: 'تذكير: تسجيل الدخول غداً',
      body: '<p>تذكير بتسجيل الدخول...</p>',
      status: 'sent',
      sentAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  constructor(
    private bookingService: BookingService,
    private customerService: CustomerService
  ) {
    this.emailLogsSubject.next([...this.mockEmailLogs]);
  }

  getTemplates(): EmailTemplate[] {
    return [...this.templates];
  }

  getTemplatesByCategory(category: string): EmailTemplate[] {
    return this.templates.filter(t => t.category === category);
  }

  getTemplate(id: string): EmailTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  sendEmail(to: string, subject: string, body: string): Observable<boolean> {
    return new Observable(observer => {
      // Simulate email sending
      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate
        const emailLog: EmailLog = {
          id: Math.max(...this.mockEmailLogs.map(l => l.id)) + 1,
          to,
          subject,
          body,
          status: success ? 'sent' : 'failed',
          sentAt: new Date().toISOString(),
          error: success ? undefined : 'SMTP connection failed'
        };
        
        this.mockEmailLogs.unshift(emailLog);
        this.emailLogsSubject.next([...this.mockEmailLogs]);
        
        observer.next(success);
        observer.complete();
      }, 1000);
    });
  }

  sendBookingConfirmation(booking: Booking): Observable<boolean> {
    const template = this.getTemplate('booking_confirmation');
    if (!template) {
      return new Observable(observer => {
        observer.next(false);
        observer.complete();
      });
    }

    const customer = this.customerService.getMockCustomer(booking.customerId);
    const body = this.fillTemplate(template.body, {
      customerName: customer?.name || 'العميل',
      bookingId: booking.id.toString(),
      roomNumber: booking.room?.number || '---',
      roomType: booking.room?.type || '---',
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: this.calculateNights(booking.checkIn, booking.checkOut).toString(),
      totalPrice: booking.totalPrice.toString()
    });

    const subject = template.subject.replace('{bookingId}', booking.id.toString());

    return this.sendEmail(customer?.email || '', subject, body);
  }

  sendReminderEmail(booking: Booking, type: 'check_in' | 'check_out'): Observable<boolean> {
    const templateId = type === 'check_in' ? 'check_in_reminder' : 'check_out_reminder';
    const template = this.getTemplate(templateId);
    if (!template) {
      return new Observable(observer => {
        observer.next(false);
        observer.complete();
      });
    }

    const customer = this.customerService.getMockCustomer(booking.customerId);
    const body = this.fillTemplate(template.body, {
      customerName: customer?.name || 'العميل',
      bookingId: booking.id.toString(),
      roomNumber: booking.room?.number || '---',
      checkIn: booking.checkIn,
      checkOut: booking.checkOut
    });

    const subject = template.subject.replace('{bookingId}', booking.id.toString());

    return this.sendEmail(customer?.email || '', subject, body);
  }

  getEmailLogs(): Observable<EmailLog[]> {
    return this.emailLogsSubject.asObservable();
  }

  getRecentEmailLogs(count: number = 10): EmailLog[] {
    return this.mockEmailLogs.slice(0, count);
  }

  getFailedEmails(): EmailLog[] {
    return this.mockEmailLogs.filter(log => log.status === 'failed');
  }

  resendEmail(logId: number): Observable<boolean> {
    const log = this.mockEmailLogs.find(l => l.id === logId);
    if (!log) {
      return new Observable(observer => {
        observer.next(false);
        observer.complete();
      });
    }

    return this.sendEmail(log.to, log.subject, log.body);
  }

  private fillTemplate(template: string, variables: {[key: string]: string}): string {
    let filled = template;
    Object.keys(variables).forEach(key => {
      filled = filled.replace(new RegExp(`{${key}}`, 'g'), variables[key]);
    });
    return filled;
  }

  private calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
