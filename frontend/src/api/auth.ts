import qs from 'qs';

import { api, apiAuth } from './index';
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../types/auth'

export async function login(requestData: LoginRequest): Promise<LoginResponse> {
    const data = qs.stringify({ username: requestData.email, password: requestData.password });
    const response = await api.post<LoginResponse>('/auth/login', data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
}

export async function register(requestData: RegisterRequest): Promise<RegisterResponse> {
    const data = { username: requestData.username, email: requestData.email, password: requestData.password, confirm_password: requestData.confirm_password };
    const response = await api.post<RegisterResponse>('/creator/create', data);
    return response.data;
}

export async function refreshAccessToken(): Promise<void> {
    const response = await api.post('/auth/refresh');
    return response.data;
}

export async function logout(): Promise<void> {
    const response = await apiAuth.post('/auth/logout');
    return response.data;
}