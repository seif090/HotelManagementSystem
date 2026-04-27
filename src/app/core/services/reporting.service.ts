import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { BookingService, Booking } from './booking.service';
import { RoomService, Room } from './room.service';
import { CustomerService } from './customer.service';
import { StatsService } from './stats.service';
import { CurrencyService } from './currency.service';

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  roomType?: string;
  bookingStatus?: string;
  customerId?: number;
  currency?: string;
}

export interface ReportData {
  id: string;
  name: string;
  type: 'summary' | 'detailed' | 'financial' | 'occupancy' | 'customer';
  description: string;
  generatedAt: string;
  data: any;
  filters?: ReportFilter;
}

export interface FinancialSummary {
  totalRevenue: number;
  averageDailyRate: number;
  occupancyRate: number;
  revenuePerAvailableRoom: number;
  totalBookings: number;
  cancelledBookings: number;
  refundAmount: number;
}

export interface OccupancyAnalysis {
  dailyRates: number[];
  occupancyRates: number[];
  revenuePerRoom: number[];
  dates: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportingService {
  private reportsSubject = new BehaviorSubject<ReportData[]>([]);
  reports$ = this.reportsSubject.asObservable();

  private mockReports: ReportData[] = [
    {
      id: 'R001',
      name: 'تقرير الإشغال اليومي',
      type: 'occupancy',
      description: 'تحليل نسب الإشغال اليومية للغرف',
      generatedAt: '2024-06-20T10:00:00Z',
      data: {
        averageOccupancy: 72.5,
        peakDay: 'الجمعة',
        lowestDay: 'الأحد',
        trend: 'ascending'
      }
    },
    {
      id: 'R002',
      name: 'تقرير الإيرادات الشهري',
      type: 'financial',
      description: 'ملخص الأداء المالي للفندق',
      generatedAt: '2024-06-15T14:30:00Z',
      data: {
        totalRevenue: 125000,
        growthRate: 15.5,
        topPerformingRoom: 'الفروقية',
        occupancyRate: 78.2
      }
    },
    {
      id: 'R003',
      name: 'تحليل العملاء',
      type: 'customer',
      description: 'سلوك وتفضيلات العملاء',
      generatedAt: '2024-06-10T09:15:00Z',
      data: {
        totalCustomers: 125,
        repeatCustomers: 45,
        averageStay: 3.2,
        topNationality: 'سعودي'
      }
    }
  ];

  constructor(
    private bookingService: BookingService,
    private roomService: RoomService,
    private customerService: CustomerService,
    private statsService: StatsService,
    private currencyService: CurrencyService
  ) {
    this.reportsSubject.next([...this.mockReports]);
  }

  generateFinancialReport(filter?: ReportFilter): Observable<ReportData> {
    return new Observable(observer => {
      this.bookingService.getAllBookings().subscribe(bookings => {
        this.roomService.getAllRooms().subscribe(rooms => {
          let filteredBookings = [...bookings];
          
          if (filter) {
            filteredBookings = this.applyFilters(filteredBookings, filter);
          }

          const financialSummary = this.calculateFinancialSummary(filteredBookings, rooms);
          const currency = filter?.currency || 'SAR';

          const report: ReportData = {
            id: `R${Date.now()}`,
            name: 'تقرير مالي مفصل',
            type: 'financial',
            description: 'تحليل شامل للأداء المالي',
            generatedAt: new Date().toISOString(),
            data: {
              ...financialSummary,
              currency,
              formattedRevenue: this.currencyService.formatAmount(financialSummary.totalRevenue, currency),
              formattedAverageRate: this.currencyService.formatAmount(financialSummary.averageDailyRate, currency),
              formattedRevenuePar: this.currencyService.formatAmount(financialSummary.revenuePerAvailableRoom, currency)
            },
            filters: filter
          };

          this.mockReports.unshift(report);
          this.reportsSubject.next([...this.mockReports]);
          observer.next(report);
          observer.complete();
        });
      });
    });
  }

  generateOccupancyReport(filter?: ReportFilter): Observable<ReportData> {
    return new Observable(observer => {
      this.bookingService.getAllBookings().subscribe(bookings => {
        this.roomService.getAllRooms().subscribe(rooms => {
          let filteredBookings = [...bookings];
          
          if (filter) {
            filteredBookings = this.applyFilters(filteredBookings, filter);
          }

          const occupancyAnalysis = this.calculateOccupancyAnalysis(filteredBookings, rooms, filter);
          
          const report: ReportData = {
            id: `R${Date.now()}`,
            name: 'تقرير الإشغال والتوافر',
            type: 'occupancy',
            description: 'تحليل نسب الإشغال والغرف المتاحة',
            generatedAt: new Date().toISOString(),
            data: occupancyAnalysis,
            filters: filter
          };

          this.mockReports.unshift(report);
          this.reportsSubject.next([...this.mockReports]);
          observer.next(report);
          observer.complete();
        });
      });
    });
  }

  generateCustomerReport(filter?: ReportFilter): Observable<ReportData> {
    return new Observable(observer => {
      this.customerService.getAllCustomers().subscribe(customers => {
        this.bookingService.getAllBookings().subscribe(bookings => {
          let filteredCustomers = [...customers];
          
          if (filter?.customerId) {
            filteredCustomers = filteredCustomers.filter(c => c.id === filter.customerId);
          }

          const customerAnalysis = this.calculateCustomerAnalysis(filteredCustomers, bookings);
          
          const report: ReportData = {
            id: `R${Date.now()}`,
            name: 'تقرير تحليل العملاء',
            type: 'customer',
            description: 'سلوك وانماط العملاء',
            generatedAt: new Date().toISOString(),
            data: customerAnalysis,
            filters: filter
          };

          this.mockReports.unshift(report);
          this.reportsSubject.next([...this.mockReports]);
          observer.next(report);
          observer.complete();
        });
      });
    });
  }

  generateDetailedBookingReport(filter?: ReportFilter): Observable<ReportData> {
    return new Observable(observer => {
      this.bookingService.getAllBookings().subscribe(bookings => {
        this.roomService.getAllRooms().subscribe(rooms => {
          this.customerService.getAllCustomers().subscribe(customers => {
            let filteredBookings = [...bookings];
            
            if (filter) {
              filteredBookings = this.applyFilters(filteredBookings, filter);
            }

            const detailedData = {
              bookings: filteredBookings.map(b => ({
                ...b,
                room: rooms.find(r => r.id === b.roomId),
                customer: customers.find(c => c.id === b.customerId),
                formattedPrice: this.currencyService.formatAmount(b.totalPrice, filter?.currency || 'SAR')
              })),
              totalBookings: filteredBookings.length,
              totalRevenue: filteredBookings.reduce((sum, b) => sum + b.totalPrice, 0),
              revenueByStatus: this.groupRevenueByStatus(filteredBookings),
              bookingsByRoom: this.groupBookingsByRoom(filteredBookings)
            };

            const report: ReportData = {
              id: `R${Date.now()}`,
              name: 'تقرير الحجوزات التفصيلي',
              type: 'detailed',
              description: 'تفاصيل جميع الحجوزات مع التحليل',
              generatedAt: new Date().toISOString(),
              data: detailedData,
              filters: filter
            };

            this.mockReports.unshift(report);
            this.reportsSubject.next([...this.mockReports]);
            observer.next(report);
            observer.complete();
          });
        });
      });
    });
  }

  generateSummaryReport(filter?: ReportFilter): Observable<ReportData> {
    return new Observable(observer => {
      const summaryReport: ReportData = {
        id: `R${Date.now()}`,
        name: 'تقرير الخلاصات التنفيذية',
        type: 'summary',
        description: 'نظرة عامة شاملة على أداء الفندق',
        generatedAt: new Date().toISOString(),
        data: {
          keyMetrics: this.getKeyMetrics(filter),
          trends: this.getTrends(),
          performanceIndicators: this.getPerformanceIndicators()
        },
        filters: filter
      };

      this.mockReports.unshift(summaryReport);
      this.reportsSubject.next([...this.mockReports]);
      observer.next(summaryReport);
      observer.complete();
    });
  }

  private calculateFinancialSummary(bookings: Booking[], rooms: Room[]): FinancialSummary {
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalBookings = bookings.length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const occupiedRoomNights = bookings.reduce((sum, b) => sum + this.calculateNights(b.checkIn, b.checkOut), 0);
    const totalRoomNights = rooms.length * 30; // Assuming 30 days
    const occupancyRate = totalRoomNights > 0 ? (occupiedRoomNights / totalRoomNights) * 100 : 0;
    const averageDailyRate = occupiedRoomNights > 0 ? totalRevenue / occupiedRoomNights : 0;
    const revenuePerAvailableRoom = totalRoomNights > 0 ? totalRevenue / totalRoomNights : 0;

    return {
      totalRevenue,
      averageDailyRate,
      occupancyRate,
      revenuePerAvailableRoom,
      totalBookings,
      cancelledBookings,
      refundAmount: 0 // Mock data
    };
  }

  private calculateOccupancyAnalysis(bookings: Booking[], rooms: Room[], filter?: ReportFilter): OccupancyAnalysis {
    const dates: string[] = [];
    const occupancyRates: number[] = [];
    const revenuePerRoom: number[] = [];
    const dailyRates: number[] = [];

    const startDate = filter?.startDate ? new Date(filter.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filter?.endDate ? new Date(filter.endDate) : new Date();

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dates.push(dateStr);

      const dayBookings = bookings.filter(b => b.checkIn <= dateStr && b.checkOut > dateStr);
      const occupancyRate = rooms.length > 0 ? (dayBookings.length / rooms.length) * 100 : 0;
      const dayRevenue = dayBookings.reduce((sum, b) => sum + b.totalPrice, 0);
      const roomRevenue = rooms.length > 0 ? dayRevenue / rooms.length : 0;
      const avgDailyRate = dayBookings.length > 0 ? dayRevenue / dayBookings.length : 0;

      occupancyRates.push(Math.round(occupancyRate * 10) / 10);
      revenuePerRoom.push(Math.round(roomRevenue * 100) / 100);
      dailyRates.push(Math.round(avgDailyRate * 100) / 100);
    }

    return { dailyRates, occupancyRates, revenuePerRoom, dates };
  }

  private calculateCustomerAnalysis(customers: any[], bookings: Booking[]) {
    const totalCustomers = customers.length;
    const repeatCustomers = customers.filter(c => c.bookingsCount > 1).length;
    const totalBookings = bookings.length;
    const averageStay = totalBookings > 0 ? 
      bookings.reduce((sum, b) => sum + this.calculateNights(b.checkIn, b.checkOut), 0) / totalBookings : 0;

    return {
      totalCustomers,
      repeatCustomers,
      repeatCustomerRate: totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0,
      averageStay: Math.round(averageStay * 10) / 10,
      totalBookings,
      averageBookingsPerCustomer: totalCustomers > 0 ? totalBookings / totalCustomers : 0
    };
  }

  private applyFilters(bookings: Booking[], filter: ReportFilter): Booking[] {
    return bookings.filter(b => {
      if (filter.startDate && b.checkIn < filter.startDate) return false;
      if (filter.endDate && b.checkOut > filter.endDate) return false;
      if (filter.bookingStatus && b.status !== filter.bookingStatus) return false;
      if (filter.customerId && b.customerId !== filter.customerId) return false;
      if (filter.roomType && b.room?.type !== filter.roomType) return false;
      return true;
    });
  }

  private groupRevenueByStatus(bookings: Booking[]): {[key: string]: number} {
    return bookings.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + b.totalPrice;
      return acc;
    }, {} as {[key: string]: number});
  }

  private groupBookingsByRoom(bookings: Booking[]): {[key: string]: number} {
    return bookings.reduce((acc, b) => {
      const roomName = b.room?.number || 'Unknown';
      acc[roomName] = (acc[roomName] || 0) + 1;
      return acc;
    }, {} as {[key: string]: number});
  }

  private getKeyMetrics(filter?: ReportFilter) {
    return this.statsService.dailyStats$.pipe(
      // This would be implemented with proper RxJS operators
    );
  }

  private getTrends() {
    return {
      revenueGrowth: 15.5,
      occupancyGrowth: 8.2,
      customerGrowth: 12.3,
      averageStayGrowth: 5.7
    };
  }

  private getPerformanceIndicators() {
    return {
      revPar: 125.50,
      occupancy: 78.2,
      averageDailyRate: 152.30,
      customerSatisfaction: 4.6
    };
  }

  private calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getReports(): Observable<ReportData[]> {
    return this.reportsSubject.asObservable();
  }

  getReportById(id: string): Observable<ReportData | undefined> {
    return new Observable(observer => {
      const report = this.mockReports.find(r => r.id === id);
      observer.next(report);
      observer.complete();
    });
  }

  exportReport(report: ReportData, format: 'pdf' | 'excel' | 'csv'): Observable<boolean> {
    return new Observable(observer => {
      // Simulate export
      setTimeout(() => {
        console.log(`Exporting report ${report.id} as ${format}`);
        observer.next(true);
        observer.complete();
      }, 2000);
    });
  }

  deleteReport(id: string): Observable<boolean> {
    return new Observable(observer => {
      const index = this.mockReports.findIndex(r => r.id === id);
      if (index > -1) {
        this.mockReports.splice(index, 1);
        this.reportsSubject.next([...this.mockReports]);
        observer.next(true);
      } else {
        observer.next(false);
      }
      observer.complete();
    });
  }
}
