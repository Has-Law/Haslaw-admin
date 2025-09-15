

'use client';

interface RefreshResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string;
    expires_in: number;
  };
}

export interface ProfileData {
    id: number;
    username: string;
    email: string;
    role: string;
}

export interface UpdateProfilePayload {
    username?: string;
    email?: string;
    password?: string;
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

export const removeAuthTokens = () => {
  document.cookie = 'accessToken=; path=/; max-age=-1;';
  document.cookie = 'refreshToken=; path=/; max-age=-1;';
  document.cookie = 'tokenExpiry=; path=/; max-age=-1;';
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
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
      headers: { 'Content-Type': 'application/json' },
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
  if (!currentToken) return null;
  if (!isTokenExpired()) return currentToken;
  
  console.log('Access token expired, attempting to refresh...');
  return await refreshAccessToken();
};



export const apiCallWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = await getValidAccessToken();
    if (!token) {
        console.error('Sesi kedaluwarsa atau tidak valid. Logout...');
        removeAuthTokens();
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
        throw new Error('Sesi kedaluwarsa. Silakan login kembali.');
    }
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    if (!(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
        console.error('API returned 401 Unauthorized. Logging out.');
        removeAuthTokens();
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
        throw new Error('Sesi Anda tidak lagi valid.');
    }
    return response;
};


export const fetchProfile = async (): Promise<ProfileData> => {
    const response = await apiCallWithAuth('/api-proxy/api/v1/auth/profile');
    if (!response.ok) {
        throw new Error('Gagal mengambil data profil');
    }
    const result = await response.json();
    if (result.success) {
        return result.data;
    }
    throw new Error(result.message || 'Gagal mengambil data profil');
};


export const updateProfile = async (data: UpdateProfilePayload): Promise<ProfileData> => {
    const response = await apiCallWithAuth('/api-proxy/api/v1/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal memperbarui profil');
    }
    const result = await response.json();
    if (result.success) {
        return result.data;
    }
    throw new Error(result.message || 'Gagal memperbarui profil');
};


export const logoutUser = async () => {
    try {
        await apiCallWithAuth('/api-proxy/api/v1/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error("API logout call failed, proceeding with client-side logout:", error);
    } finally {
        removeAuthTokens();
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
    }
};  