import { Injectable } from '@angular/core';
import { BookingService, Booking } from './booking.service';
import { RoomService, Room } from './room.service';
import { CustomerService, Customer } from './customer.service';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  constructor(
    private bookingService: BookingService,
    private roomService: RoomService,
    private customerService: CustomerService
  ) {}

  exportBookingsToCSV(): void {
    this.bookingService.getAllBookings().subscribe(bookings => {
      const headers = ['رقم الحجز', 'العميل', 'الغرفة', 'تاريخ الدخول', 'تاريخ الخروج', 'السعر', 'الحالة'];
      const rows = bookings.map(b => [
        b.id,
        b.customer?.name || '---',
        b.room?.number || '---',
        b.checkIn,
        b.checkOut,
        b.totalPrice,
        this.getBookingStatusLabel(b.status)
      ]);
      
      this.downloadCSV(headers, rows, 'حجوزات_الفندق');
    });
  }

  exportRoomsToCSV(): void {
    this.roomService.getAllRooms().subscribe(rooms => {
      const headers = ['رقم الغرفة', 'النوع', 'السعر', 'السعة', 'الدور', 'الحالة', 'المميزات'];
      const rows = rooms.map(r => [
        r.number,
        r.type,
        r.price,
        r.capacity,
        r.floor,
        this.getRoomStatusLabel(r.status),
        r.amenities.join(', ')
      ]);
      
      this.downloadCSV(headers, rows, 'غرف_الفندق');
    });
  }

  exportCustomersToCSV(): void {
    this.customerService.getAllCustomers().subscribe(customers => {
      const headers = ['الاسم', 'البريد', 'الهاتف', 'الهوية', 'عدد الحجوزات', 'تاريخ التسجيل'];
      const rows = customers.map(c => [
        c.name,
        c.email,
        c.phone,
        c.nationalId,
        c.bookingsCount,
        c.createdAt
      ]);
      
      this.downloadCSV(headers, rows, 'عملاء_الفندق');
    });
  }

  private downloadCSV(headers: string[], rows: any[][], filename: string): void {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private getBookingStatusLabel(status: string): string {
    const labels: {[key: string]: string} = {
      'confirmed': 'مؤكد',
      'cancelled': 'ملغي',
      'checked-in': 'تم تسجيل الدخول',
      'checked-out': 'تم تسجيل الخروج'
    };
    return labels[status] || status;
  }

  private getRoomStatusLabel(status: string): string {
    const labels: {[key: string]: string} = {
      'available': 'متاحة',
      'occupied': 'مشغولة',
      'maintenance': 'صيانة'
    };
    return labels[status] || status;
  }
}
