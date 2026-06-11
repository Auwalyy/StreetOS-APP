import api from './api';

export const authService = {
  register: (data: {
    phone: string;
    password: string;
    firstName: string;
    lastName: string;
    businessName?: string;
    businessType?: string;
    language?: string;
  }) => api.post('/auth/register', data),

  login: (phone: string, password: string) =>
    api.post('/auth/login', { phone, password }),

  verifyOTP: (phone: string, otp: string) =>
    api.post('/auth/verify-otp', { phone, otp }),

  resendOTP: (phone: string) =>
    api.post('/auth/resend-otp', { phone }),

  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh-token', { refreshToken }),

  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),

  getMe: () => api.get('/auth/me'),

  updateFCMToken: (fcmToken: string) =>
    api.put('/auth/fcm-token', { fcmToken }),
};
