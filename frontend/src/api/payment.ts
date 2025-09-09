import { apiAuth, api } from './index';
import type { CheckoutBankRequest, CheckoutBankResponse, ConnectBankRequest, ConnectBankResponse } from '../types/payment.js';

export async function getConnectBankUrl(requestData: ConnectBankRequest): Promise<ConnectBankResponse> {
  const response = await apiAuth.post('/stripe/connect', requestData);
  return response.data;
}

export async function getCheckoutUrl(requestData: CheckoutBankRequest): Promise<CheckoutBankResponse> {
  console.log(requestData)
  const response = await api.post('/stripe/checkout', requestData);
  return response.data;
}