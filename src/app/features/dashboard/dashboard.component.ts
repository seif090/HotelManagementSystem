import { Component, OnInit, signal } from '@angular/core';
import { RoomService } from '../../core/services/room.service';
import { CustomerService } from '../../core/services/customer.service';
import { BookingService } from '../../core/services/booking.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  totalRooms = signal(0);
  availableRooms = signal(0);
  occupiedRooms = signal(0);
  maintenanceRooms = signal(0);
  totalCustomers = signal(0);
  totalBookings = signal(0);
  activeBookings = signal(0);
  occupancyRate = signal(0);
  
  recentBookings: any[] = [];
  monthlyStats = signal([
    { month: 'يناير', bookings: 45, revenue: 12500 },
    { month: 'فبراير', bookings: 52, revenue: 14200 },
    { month: 'مارس', bookings: 48, revenue: 13800 },
    { month: 'أبريل', bookings: 61, revenue: 16500 },
    { month: 'مايو', bookings: 55, revenue: 15200 },
    { month: 'يونيو', bookings: 58, revenue: 15800 },
  ]);

  constructor(
    private roomService: RoomService,
    private customerService: CustomerService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.roomService.getAllRooms().subscribe(rooms => {
      this.totalRooms.set(rooms.length);
      this.availableRooms.set(rooms.filter(r => r.status === 'available').length);
      this.occupiedRooms.set(rooms.filter(r => r.status === 'occupied').length);
      this.maintenanceRooms.set(rooms.filter(r => r.status === 'maintenance').length);
      const total = this.totalRooms();
      const occupied = this.occupiedRooms();
      this.occupancyRate.set(total > 0 ? Math.round((occupied / total) * 100) : 0);
    });

    this.customerService.getAllCustomers().subscribe(customers => {
      this.totalCustomers.set(customers.length);
    });

    this.bookingService.getAllBookings().subscribe(bookings => {
      this.totalBookings.set(bookings.length);
      this.activeBookings.set(bookings.filter(b => 
        b.status === 'confirmed' || b.status === 'checked-in'
      ).length);
      this.recentBookings = bookings.slice(-5).reverse();
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'available': return 'success';
      case 'occupied': return 'warning';
      case 'maintenance': return 'danger';
      default: return 'info';
    }
  }

  getBookingStatusLabel(status: string): string {
    const labels: {[key: string]: string} = {
      'confirmed': 'مؤكد',
      'cancelled': 'ملغي',
      'checked-in': 'تم تسجيل الدخول',
      'checked-out': 'تم تسجيل الخروج'
    };
    return labels[status] || status;
  }
}
