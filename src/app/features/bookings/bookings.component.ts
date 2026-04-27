import { Component, OnInit, signal } from '@angular/core';
import { BookingService, Booking } from '../../core/services/booking.service';
import { RoomService } from '../../core/services/room.service';
import { CustomerService } from '../../core/services/customer.service';
import { NotificationService } from '../../core/services/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  loading = signal(false);
  searchQuery = '';
  filterStatus = '';
  
  rooms: any[] = [];
  customers: any[] = [];
  
  showModal = signal(false);
  editingBooking: Booking | null = null;
  
  newBooking = signal<Partial<Booking>>({
    customerId: 0,
    roomId: 0,
    checkIn: '',
    checkOut: '',
    totalPrice: 0,
    status: 'confirmed'
  });

  constructor(
    private bookingService: BookingService,
    private roomService: RoomService,
    private customerService: CustomerService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    
    this.bookingService.getAllBookings().subscribe(bookings => {
      this.bookings = bookings;
      this.filteredBookings = [...bookings];
      this.loading.set(false);
    });

    this.roomService.getAllRooms().subscribe(rooms => {
      this.rooms = rooms;
    });

    this.customerService.getAllCustomers().subscribe(customers => {
      this.customers = customers;
    });
  }

  applyFilters(): void {
    this.filteredBookings = this.bookings.filter(booking => {
      const matchesSearch = !this.searchQuery ||
        booking.customer?.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        booking.room?.number.includes(this.searchQuery);
      const matchesStatus = !this.filterStatus || booking.status === this.filterStatus;
      return matchesSearch && matchesStatus;
    });
  }

  calculatePrice(): void {
    const room = this.rooms.find(r => r.id === this.newBooking().roomId);
    if (room && this.newBooking().checkIn && this.newBooking().checkOut) {
      const price = this.bookingService.calculatePrice(
        room.price,
        this.newBooking().checkIn!,
        this.newBooking().checkOut!
      );
      this.newBooking.set({ ...this.newBooking(), totalPrice: price });
    }
  }

  openAddModal(): void {
    this.editingBooking = null;
    this.newBooking.set({
      customerId: 0,
      roomId: 0,
      checkIn: '',
      checkOut: '',
      totalPrice: 0,
      status: 'confirmed'
    });
    this.showModal.set(true);
  }

  openEditModal(booking: Booking): void {
    this.editingBooking = booking;
    this.newBooking.set({ ...booking });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingBooking = null;
  }

  saveBooking(): void {
    if (!this.validateBooking()) return;

    if (this.editingBooking) {
      this.bookingService.updateBooking(this.editingBooking.id, this.newBooking() as Booking).subscribe(() => {
        this.notificationService.showSuccess('تم تحديث الحجز بنجاح');
        this.loadData();
        this.closeModal();
      });
    } else {
      this.bookingService.addBooking(this.newBooking() as any).subscribe(() => {
        this.notificationService.showSuccess('تم إنشاء الحجز بنجاح');
        this.loadData();
        this.closeModal();
      });
    }
  }

  deleteBooking(booking: Booking): void {
    if (confirm('هل أنت متأكد من حذف هذا الحجز؟')) {
      this.bookingService.deleteBooking(booking.id).subscribe(() => {
        this.notificationService.showSuccess('تم حذف الحجز بنجاح');
        this.loadData();
      });
    }
  }

  updateStatus(booking: Booking, status: Booking['status']): void {
    this.bookingService.updateBookingStatus(booking.id, status).subscribe(() => {
      this.notificationService.showSuccess('تم تحديث حالة الحجز');
      this.loadData();
    });
  }

  validateBooking(): boolean {
    const { customerId, roomId, checkIn, checkOut } = this.newBooking();
    if (!customerId || !roomId || !checkIn || !checkOut) {
      this.notificationService.showError('يرجى تعبئة جميع الحقول المطلوبة');
      return false;
    }
    if (checkIn >= checkOut) {
      this.notificationService.showError('تاريخ الخروج يجب أن يكون بعد تاريخ الدخول');
      return false;
    }
    return true;
  }

  getStatusClass(status: string): string {
    return {
      'confirmed': 'success',
      'cancelled': 'danger',
      'checked-in': 'warning',
      'checked-out': 'info'
    }[status] || 'info';
  }

  getStatusLabel(status: string): string {
    return {
      'confirmed': 'مؤكد',
      'cancelled': 'ملغي',
      'checked-in': 'تم تسجيل الدخول',
      'checked-out': 'تم تسجيل الخروج'
    }[status] || status;
  }
}
