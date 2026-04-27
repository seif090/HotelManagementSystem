import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer, Subscription } from 'rxjs';
import { BookingService, Booking } from './booking.service';
import { NotificationService } from './notification.service';

export interface Reminder {
  id: number;
  type: 'check-in' | 'check-out' | 'payment' | 'maintenance';
  bookingId: number;
  message: string;
  date: Date;
  sent: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private remindersSubject = new BehaviorSubject<Reminder[]>([]);
  reminders$ = this.remindersSubject.asObservable();
  
  private checkInterval: Subscription | null = null;
  private reminderId = 0;

  constructor(
    private bookingService: BookingService,
    private notificationService: NotificationService
  ) {
    this.initializeReminders();
    this.startReminderCheck();
  }

  private initializeReminders(): void {
    this.bookingService.getAllBookings().subscribe(bookings => {
      const reminders: Reminder[] = [];
      
      bookings.forEach(booking => {
        const checkInDate = new Date(booking.checkIn);
        const checkOutDate = new Date(booking.checkOut);
        
        // Check-in reminder (1 day before)
        const checkInReminderDate = new Date(checkInDate);
        checkInReminderDate.setDate(checkInReminderDate.getDate() - 1);
        
        reminders.push({
          id: ++this.reminderId,
          type: 'check-in',
          bookingId: booking.id,
          message: `تذكير: العميل ${booking.customer?.name} يستعد لتسجيل الدخول غداً إلى غرفة ${booking.room?.number}`,
          date: checkInReminderDate,
          sent: false
        });
        
        // Check-out reminder (1 day before)
        const checkOutReminderDate = new Date(checkOutDate);
        checkOutReminderDate.setDate(checkOutReminderDate.getDate() - 1);
        
        reminders.push({
          id: ++this.reminderId,
          type: 'check-out',
          bookingId: booking.id,
          message: `تذكير: العميل ${booking.customer?.name} سيقوم بتسجيل الخروج غداً من غرفة ${booking.room?.number}`,
          date: checkOutReminderDate,
          sent: false
        });
      });
      
      this.remindersSubject.next(reminders);
    });
  }

  private startReminderCheck(): void {
    // Check every hour for due reminders
    this.checkInterval = timer(0, 3600000).subscribe(() => {
      this.checkDueReminders();
    });
  }

  private checkDueReminders(): void {
    const now = new Date();
    const reminders = this.remindersSubject.value;
    
    reminders.forEach(reminder => {
      if (!reminder.sent && reminder.date <= now) {
        this.sendReminder(reminder);
      }
    });
  }

  private sendReminder(reminder: Reminder): void {
    // Update reminder status
    const reminders = this.remindersSubject.value;
    const reminderIndex = reminders.findIndex(r => r.id === reminder.id);
    if (reminderIndex > -1) {
      reminders[reminderIndex].sent = true;
      this.remindersSubject.next([...reminders]);
    }
    
    // Send notification
    this.notificationService.showInfo(reminder.message);
  }

  addReminder(booking: Booking, type: 'check-in' | 'check-out' | 'payment' | 'maintenance'): void {
    const reminderDate = this.calculateReminderDate(booking, type);
    
    const reminder: Reminder = {
      id: ++this.reminderId,
      type,
      bookingId: booking.id,
      message: this.generateReminderMessage(booking, type),
      date: reminderDate,
      sent: false
    };
    
    const reminders = this.remindersSubject.value;
    reminders.push(reminder);
    this.remindersSubject.next([...reminders]);
  }

  private calculateReminderDate(booking: Booking, type: string): Date {
    const date = new Date();
    
    switch (type) {
      case 'check-in':
        const checkInDate = new Date(booking.checkIn);
        checkInDate.setDate(checkInDate.getDate() - 1);
        return checkInDate;
      case 'check-out':
        const checkOutDate = new Date(booking.checkOut);
        checkOutDate.setDate(checkOutDate.getDate() - 1);
        return checkOutDate;
      case 'payment':
        date.setDate(date.getDate() + 3);
        return date;
      case 'maintenance':
        const checkOut = new Date(booking.checkOut);
        checkOut.setDate(checkOut.getDate() + 1);
        return checkOut;
      default:
        return date;
    }
  }

  private generateReminderMessage(booking: Booking, type: string): string {
    switch (type) {
      case 'check-in':
        return `تذكير: العميل ${booking.customer?.name} يستعد لتسجيل الدخول غداً`;
      case 'check-out':
        return `تذكير: العميل ${booking.customer?.name} سيقوم بتسجيل الخروج غداً`;
      case 'payment':
        return `تذكير: دفع مبلغ ${booking.totalPrice} لتأكيد الحجز`;
      case 'maintenance':
        return `تذكير: تنظيف وصيانة غرفة ${booking.room?.number} بعد الخروج`;
      default:
        return 'تذكير جديد';
    }
  }

  getUpcomingReminders(): Reminder[] {
    const now = new Date();
    return this.remindersSubject.value
      .filter(r => !r.sent && r.date > now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  }

  getPendingRemindersCount(): number {
    const now = new Date();
    return this.remindersSubject.value.filter(r => !r.sent && r.date <= now).length;
  }
}
