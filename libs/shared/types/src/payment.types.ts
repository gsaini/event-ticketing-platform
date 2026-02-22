export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  bookingId: string;
  provider: string;
  providerTxnId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentIntentDTO {
  bookingId: string;
  amount: number;
  currency?: string;
}

export interface PaymentIntentResponse {
  id: string;
  bookingId: string;
  provider: string;
  providerTxnId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  clientSecret: string;
  createdAt: string;
}
