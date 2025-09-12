import { Country } from '../types/country'

export interface ConnectBankRequest {
  country: keyof typeof Country;
}

export interface ConnectBankResponse {
  url: string;
}

export interface CheckoutBankRequest {
  username: string
  payment_amount: number
  name: string | null
  message: string | null
}

export interface CheckoutBankResponse {
  url: string;
}


