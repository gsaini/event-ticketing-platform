import type { Payment, CreatePaymentIntentDTO, PaymentIntentResponse } from '@ticketing/types';
import { apiClient } from './client';

export const paymentsApi = {
  createIntent: async (data: CreatePaymentIntentDTO): Promise<PaymentIntentResponse> => {
    const response = await apiClient.post<PaymentIntentResponse>('/api/v1/payments/intent', data);
    return response.data;
  },

  getById: async (id: string): Promise<Payment> => {
    const response = await apiClient.get<Payment>(`/api/v1/payments/${id}`);
    return response.data;
  },

  getByBooking: async (bookingId: string): Promise<Payment> => {
    const response = await apiClient.get<Payment>(`/api/v1/payments/booking/${bookingId}`);
    return response.data;
  },

  refund: async (id: string): Promise<Payment> => {
    const response = await apiClient.post<Payment>(`/api/v1/payments/${id}/refund`);
    return response.data;
  },
};
