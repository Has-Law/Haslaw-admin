'use client';

import { apiCallWithAuth } from '@/utils/apiClient';

interface RefreshResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    expires_in: number;
  };
}

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

export const getAccessToken = (): string | null => {
  return getCookie('accessToken');
};

export const getRefreshToken = (): string | null => {
  return getCookie('refreshToken');
};

export const isTokenExpired = (): boolean => {
  const expiry = getCookie('tokenExpiry');
  if (!expiry) return true;
  
  return Date.now() > parseInt(expiry);
};

export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    console.error('No refresh token available');
    return null;
  }

  try {
    const response = await fetch('/api-proxy/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const result: RefreshResponse = await response.json();

    if (response.ok && result.success) {
      const newAccessToken = result.data.access_token;
      const expiresIn = result.data.expires_in;
      
      const expirationTime = new Date(Date.now() + expiresIn * 1000);
      document.cookie = `accessToken=${newAccessToken}; path=/; expires=${expirationTime.toUTCString()}; SameSite=Lax`;
      document.cookie = `tokenExpiry=${expirationTime.getTime()}; path=/; expires=${expirationTime.toUTCString()}; SameSite=Lax`;
      
      return newAccessToken;
    } else {
      console.error('Failed to refresh token:', result.message);
      removeAuthTokens();
      return null;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    removeAuthTokens();
    return null;
  }
};

export const getValidAccessToken = async (): Promise<string | null> => {
  const currentToken = getAccessToken();
  
  if (!currentToken) {
    return null;
  }
  
  if (!isTokenExpired()) {
    return currentToken;
  }
  
  console.log('Access token expired, attempting to refresh...');
  return await refreshAccessToken();
};

export const removeAuthTokens = () => {
  document.cookie = 'accessToken=; path=/; max-age=-1;';
  document.cookie = 'refreshToken=; path=/; max-age=-1;';
  document.cookie = 'tokenExpiry=; path=/; max-age=-1;';
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
};

export const logoutUser = async () => {
    try {
        // Panggil API logout, tidak perlu pedulikan responsnya
        // karena kita akan selalu membersihkan token di sisi klien.
        await apiCallWithAuth('/api-proxy/api/v1/auth/logout', {
            method: 'POST',
        });
    } catch (error) {
        console.error("API logout call failed, proceeding with client-side logout:", error);
    } finally {
        // Selalu bersihkan token dan arahkan ke halaman login
        removeAuthTokens();
        if (typeof window !== 'undefined') {
            window.location.href = '/'; // Arahkan ke halaman login/root
        }
    }
};