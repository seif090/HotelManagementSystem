import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CustomerService, Customer } from './customer.service';
import { BookingService, Booking } from './booking.service';

export interface LoyaltyTier {
  id: string;
  name: string;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
  discountRate: number;
  color: string;
}

export interface LoyaltyMember {
  id: number;
  customerId: number;
  tier: string;
  points: number;
  lifetimePoints: number;
  memberSince: string;
  nextTierProgress: number;
  benefits: string[];
}

export interface LoyaltyTransaction {
  id: number;
  memberId: number;
  type: 'earn' | 'redeem' | 'adjustment';
  points: number;
  description: string;
  relatedBookingId?: number;
  date: string;
  balance: number;
}

@Injectable({
  providedIn: 'root'
})
export class LoyaltyService {
  private membersSubject = new BehaviorSubject<LoyaltyMember[]>([]);
  members$ = this.membersSubject.asObservable();

  private transactionsSubject = new BehaviorSubject<LoyaltyTransaction[]>([]);
  transactions$ = this.transactionsSubject.asObservable();

  private tiers: LoyaltyTier[] = [
    {
      id: 'bronze',
      name: 'البرونزي',
      minPoints: 0,
      maxPoints: 999,
      benefits: ['خصم 5% على الحجوزات', 'تحديد الغرفة المفضلة', 'وصول مبكر عند التوفر'],
      discountRate: 0.05,
      color: '#CD7F32'
    },
    {
      id: 'silver',
      name: 'الفضي',
      minPoints: 1000,
      maxPoints: 4999,
      benefits: ['خصم 10% على الحجوزات', 'ترقية الغرفة عند التوفر', 'وصول مبكر', 'خروج متأخر حتى الساعة 2 ظهراً'],
      discountRate: 0.10,
      color: '#C0C0C0'
    },
    {
      id: 'gold',
      name: 'الذهبي',
      minPoints: 5000,
      maxPoints: 9999,
      benefits: ['خصم 15% على الحجوزات', 'ترقية الغرفة مجاناً', 'وصول مبكر مضمون', 'خروج متأخر حتى الساعة 4 عصراً', 'خدمة التوصيل من وإلى المطار'],
      discountRate: 0.15,
      color: '#FFD700'
    },
    {
      id: 'platinum',
      name: 'البلاتيني',
      minPoints: 10000,
      maxPoints: 99999,
      benefits: ['خصم 20% على الحجوزات', 'ترقية فئة الغرفة', 'وصول مبكر مضمون', 'خروج متأخر حتى الساعة 6 مساءً', 'خدمة التوصيل من وإلى المطار مجاناً', 'مساعد شخصي 24 ساعة', 'حجوزات مطعم مجانية'],
      discountRate: 0.20,
      color: '#E5E4E2'
    }
  ];

  private mockMembers: LoyaltyMember[] = [
    {
      id: 1,
      customerId: 1,
      tier: 'gold',
      points: 6250,
      lifetimePoints: 6250,
      memberSince: '2024-01-15',
      nextTierProgress: 25,
      benefits: []
    },
    {
      id: 2,
      customerId: 2,
      tier: 'silver',
      points: 2340,
      lifetimePoints: 2340,
      memberSince: '2024-02-20',
      nextTierProgress: 47,
      benefits: []
    },
    {
      id: 3,
      customerId: 3,
      tier: 'bronze',
      points: 850,
      lifetimePoints: 850,
      memberSince: '2024-03-10',
      nextTierProgress: 17,
      benefits: []
    },
    {
      id: 4,
      customerId: 4,
      tier: 'bronze',
      points: 150,
      lifetimePoints: 150,
      memberSince: '2024-04-05',
      nextTierProgress: 3,
      benefits: []
    },
    {
      id: 5,
      customerId: 5,
      tier: 'platinum',
      points: 12500,
      lifetimePoints: 12500,
      memberSince: '2024-05-12',
      nextTierProgress: 0,
      benefits: []
    }
  ];

  private mockTransactions: LoyaltyTransaction[] = [
    {
      id: 1,
      memberId: 1,
      type: 'earn',
      points: 500,
      description: 'حجز غرفة دبللكس لمدة 3 ليالٍ',
      relatedBookingId: 101,
      date: '2024-06-01',
      balance: 6250
    },
    {
      id: 2,
      memberId: 1,
      type: 'redeem',
      points: -200,
      description: 'استبدال نقاط بخصم على الحجز',
      relatedBookingId: 102,
      date: '2024-06-15',
      balance: 6050
    },
    {
      id: 3,
      memberId: 2,
      type: 'earn',
      points: 300,
      description: 'حجز غرفة سوبرior لمدة ليلتين',
      relatedBookingId: 103,
      date: '2024-06-10',
      balance: 2340
    }
  ];

  constructor(
    private customerService: CustomerService,
    private bookingService: BookingService
  ) {
    this.updateBenefits();
    this.membersSubject.next([...this.mockMembers]);
    this.transactionsSubject.next([...this.mockTransactions]);
  }

  getMembers(): Observable<LoyaltyMember[]> {
    return this.membersSubject.asObservable();
  }

  getMemberByCustomerId(customerId: number): Observable<LoyaltyMember | undefined> {
    return new Observable(observer => {
      const member = this.mockMembers.find(m => m.customerId === customerId);
      observer.next(member);
      observer.complete();
    });
  }

  getMember(memberId: number): Observable<LoyaltyMember | undefined> {
    return new Observable(observer => {
      const member = this.mockMembers.find(m => m.id === memberId);
      observer.next(member);
      observer.complete();
    });
  }

  getTier(tierId: string): LoyaltyTier | undefined {
    return this.tiers.find(t => t.id === tierId);
  }

  getAllTiers(): LoyaltyTier[] {
    return [...this.tiers];
  }

  getTransactions(memberId: number): Observable<LoyaltyTransaction[]> {
    return new Observable(observer => {
      const memberTransactions = this.mockTransactions.filter(t => t.memberId === memberId);
      observer.next([...memberTransactions]);
      observer.complete();
    });
  }

  earnPoints(memberId: number, booking: Booking, points: number): Observable<LoyaltyMember | undefined> {
    return new Observable(observer => {
      const index = this.mockMembers.findIndex(m => m.id === memberId);
      if (index > -1) {
        const member = this.mockMembers[index];
        member.points += points;
        member.lifetimePoints += points;
        member.nextTierProgress = this.calculateNextTierProgress(member);

        const transaction: LoyaltyTransaction = {
          id: Math.max(...this.mockTransactions.map(t => t.id)) + 1,
          memberId,
          type: 'earn',
          points,
          description: `حجز الغرفة ${booking.room?.number} لمدة ${this.calculateNights(booking.checkIn, booking.checkOut)} ليالٍ`,
          relatedBookingId: booking.id,
          date: new Date().toISOString().split('T')[0],
          balance: member.points
        };

        this.mockTransactions.unshift(transaction);
        this.updateMemberTier(member);
        this.updateBenefits();
        this.membersSubject.next([...this.mockMembers]);
        this.transactionsSubject.next([...this.mockTransactions]);
        observer.next(member);
      } else {
        observer.next(undefined);
      }
      observer.complete();
    });
  }

  redeemPoints(memberId: number, points: number, description: string): Observable<LoyaltyMember | undefined> {
    return new Observable(observer => {
      const index = this.mockMembers.findIndex(m => m.id === memberId);
      if (index > -1) {
        const member = this.mockMembers[index];
        if (member.points >= points) {
          member.points -= points;

          const transaction: LoyaltyTransaction = {
            id: Math.max(...this.mockTransactions.map(t => t.id)) + 1,
            memberId,
            type: 'redeem',
            points: -points,
            description,
            date: new Date().toISOString().split('T')[0],
            balance: member.points
          };

          this.mockTransactions.unshift(transaction);
          this.updateMemberTier(member);
          this.membersSubject.next([...this.mockMembers]);
          this.transactionsSubject.next([...this.mockTransactions]);
          observer.next(member);
        } else {
          observer.error('نقاط غير كافية');
        }
      } else {
        observer.next(undefined);
      }
      observer.complete();
    });
  }

  addMember(customerId: number): Observable<LoyaltyMember> {
    return new Observable(observer => {
      const newMember: LoyaltyMember = {
        id: Math.max(...this.mockMembers.map(m => m.id)) + 1,
        customerId,
        tier: 'bronze',
        points: 0,
        lifetimePoints: 0,
        memberSince: new Date().toISOString().split('T')[0],
        nextTierProgress: 0,
        benefits: []
      };
      this.mockMembers.push(newMember);
      this.updateBenefits();
      this.membersSubject.next([...this.mockMembers]);
      observer.next(newMember);
      observer.complete();
    });
  }

  getLoyaltyStats(): {
    totalMembers: number;
    totalPoints: number;
    averagePoints: number;
    tierDistribution: {[key: string]: number};
  } {
    const totalMembers = this.mockMembers.length;
    const totalPoints = this.mockMembers.reduce((sum, m) => sum + m.points, 0);
    const averagePoints = totalMembers > 0 ? Math.round(totalPoints / totalMembers) : 0;
    
    const tierDistribution = this.tiers.reduce((acc, tier) => {
      acc[tier.id] = this.mockMembers.filter(m => m.tier === tier.id).length;
      return acc;
    }, {} as {[key: string]: number});

    return {
      totalMembers,
      totalPoints,
      averagePoints,
      tierDistribution
    };
  }

  getPointsToNextTier(member: LoyaltyMember): number {
    const currentTier = this.getTier(member.tier);
    if (!currentTier) return 0;
    
    const nextTierIndex = this.tiers.findIndex(t => t.id === member.tier) + 1;
    if (nextTierIndex >= this.tiers.length) return 0;
    
    const nextTier = this.tiers[nextTierIndex];
    return nextTier.minPoints - member.points;
  }

  calculateDiscount(member: LoyaltyMember, amount: number): number {
    const tier = this.getTier(member.tier);
    if (!tier) return 0;
    return amount * tier.discountRate;
  }

  applyLoyaltyDiscount(booking: Booking, member: LoyaltyMember): number {
    const discount = this.calculateDiscount(member, booking.totalPrice);
    return booking.totalPrice - discount;
  }

  private updateMemberTier(member: LoyaltyMember): void {
    for (let i = this.tiers.length - 1; i >= 0; i--) {
      const tier = this.tiers[i];
      if (member.points >= tier.minPoints) {
        member.tier = tier.id;
        break;
      }
    }
  }

  private updateBenefits(): void {
    this.mockMembers.forEach(member => {
      const tier = this.getTier(member.tier);
      member.benefits = tier ? [...tier.benefits] : [];
    });
  }

  private calculateNextTierProgress(member: LoyaltyMember): number {
    const currentTier = this.getTier(member.tier);
    if (!currentTier) return 0;

    const nextTierIndex = this.tiers.findIndex(t => t.id === member.tier) + 1;
    if (nextTierIndex >= this.tiers.length) return 0;

    const nextTier = this.tiers[nextTierIndex];
    const pointsNeeded = nextTier.minPoints - currentTier.minPoints;
    const pointsProgressed = member.points - currentTier.minPoints;
    
    return Math.round((pointsProgressed / pointsNeeded) * 100);
  }

  private calculateNights(checkIn: string, checkOut: string): number {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
