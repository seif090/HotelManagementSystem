>
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BookingService, Booking } from './booking.service';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

export interface ConversionResult {
  amount: number;
  fromCurrency: Currency;
  toCurrency: Currency;
  convertedAmount: number;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private baseCurrency = 'SAR';
  private selectedCurrencySubject = new BehaviorSubject<Currency>(this.getCurrency('SAR'));
  selectedCurrency$ = this.selectedCurrencySubject.asObservable();

  private currencies: Currency[] = [
    { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س', rate: 1 },
    { code: 'USD', name: 'دولار أمريكي', symbol: '$', rate: 3.75 },
    { code: 'EUR', name: 'يورو', symbol: '€', rate: 4.10 },
    { code: 'GBP', name: 'جنيه استرليني', symbol: '£', rate: 4.75 },
    { code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ', rate: 1.02 },
    { code: 'QAR', name: 'ريال قطري', symbol: 'ر.ق', rate: 1.03 },
    { code: 'KWD', name: 'دينار كويتي', symbol: 'د.ك', rate: 12.25 },
    { code: 'BHD', name: 'دينار بحريني', symbol: 'د.ب', rate: 10.00 }
  ];

  private exchangeRates: {[key: string]: {[key: string]: number}} = {
    'USD': { 'EUR': 0.92, 'GBP': 0.79, 'SAR': 3.75 },
    'EUR': { 'USD': 1.09, 'GBP': 0.86, 'SAR': 4.10 },
    'GBP': { 'USD': 1.27, 'EUR': 1.16, 'SAR': 4.75 },
    'SAR': { 'USD': 0.27, 'EUR': 0.24, 'GBP': 0.21 }
  };

  constructor(
    private bookingService: BookingService
  ) {}

  getCurrency(code: string): Currency {
    return this.currencies.find(c => c.code === code) || this.currencies[0];
  }

  setCurrency(code: string): void {
    const currency = this.getCurrency(code);
    this.selectedCurrencySubject.next(currency);
  }

  convert(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return amount;

    // Convert to base currency first
    const fromRate = this.getCurrency(fromCurrency).rate;
    const toRate = this.getCurrency(toCurrency).rate;
    const baseAmount = amount / fromRate;
    return baseAmount * toRate;
  }

  formatAmount(amount: number, currencyCode?: string): string {
    const currency = this.getCurrency(currencyCode || this.selectedCurrencySubject.value.code);
    const convertedAmount = currency.code !== this.baseCurrency ? this.convert(amount, this.baseCurrency, currency.code) : amount;
    
    return `${currency.symbol} ${convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  getFormattedBookingPrice(booking: Booking, currencyCode?: string): string {
    return this.formatAmount(booking.totalPrice, currencyCode);
  }

  convertBookingPrice(booking: Booking, targetCurrency: string): ConversionResult {
    const fromCurrency = this.getCurrency('SAR');
    const toCurrency = this.getCurrency(targetCurrency);
    const convertedAmount = this.convert(booking.totalPrice, fromCurrency.code, toCurrency.code);

    return {
      amount: booking.totalPrice,
      fromCurrency,
      toCurrency,
      convertedAmount,
      date: new Date().toISOString().split('T')[0]
    };
  }

  getExchangeRates(): {[key: string]: {[key: string]: number}} {
    return { ...this.exchangeRates };
  }

  getAvailableCurrencies(): Currency[] {
    return [...this.currencies];
  }

  getCurrencyBySymbol(symbol: string): Currency | undefined {
    return this.currencies.find(c => c.symbol === symbol);
  }

  updateExchangeRate(fromCurrency: string, toCurrency: string, rate: number): void {
    if (!this.exchangeRates[fromCurrency]) {
      this.exchangeRates[fromCurrency] = {};
    }
    this.exchangeRates[fromCurrency][toCurrency] = rate;

    // Update inverse rate
    if (!this.exchangeRates[toCurrency]) {
      this.exchangeRates[toCurrency] = {};
    }
    this.exchangeRates[toCurrency][fromCurrency] = 1 / rate;
  }

  getHistoricalRates(date: string): {[key: string]: number} {
    // Mock historical data
    const baseRates = this.exchangeRates['USD'];
    const variance = 0.02; // 2% variance for historical data
    
    return Object.keys(baseRates).reduce((acc, key) => {
      const varianceAmount = baseRates[key] * variance * (Math.random() - 0.5);
      acc[key] = baseRates[key] + varianceAmount;
      return acc;
    }, {} as {[key: string]: number});
  }
}
