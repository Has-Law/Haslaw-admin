import { getValidAccessToken, removeAuthTokens } from '@/lib/auth';

/**
 * Membuat panggilan API ke endpoint yang memerlukan otorisasi.
 * Fungsi ini secara otomatis akan me-refresh access token jika sudah kedaluwarsa.
 * @param url - URL endpoint API yang akan dipanggil.
 * @param options - Opsi konfigurasi untuk `fetch` (method, body, dll.).
 * @returns Promise<Response>
 */
export const apiCallWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {

    const token = await getValidAccessToken();

    if (!token) {
        removeAuthTokens();
        if (typeof window !== 'undefined') {
            window.location.href = '/'; // Arahkan ke halaman login
        }
        throw new Error('Sesi kedaluwarsa. Silakan login kembali.');
    }

    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    
    if (!(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });


    if (response.status === 401) {
        console.error('API returned 401 Unauthorized. Token might be revoked. Logging out.');
        removeAuthTokens();
        if (typeof window !== 'undefined') {
            window.location.href = '/';
        }
        throw new Error('Sesi Anda tidak lagi valid.');
    }

    return response;
};