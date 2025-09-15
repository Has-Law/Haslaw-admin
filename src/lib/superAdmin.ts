// lib/superAdmin.ts

import { apiCallWithAuth } from '@/utils/apiClient';

export interface Admin {
    id: number;
    username: string;
    email: string;
    role: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateAdminData {
    username: string;
    email: string;
    password: string;
    role: string;
}

export interface UpdateAdminData {
    username?: string;
    email?: string;
    password?: string;
    role?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// Fetch all admins - mencoba berbagai kemungkinan endpoint
export const fetchAdmins = async (): Promise<Admin[]> => {
    try {
        console.log('Fetching admins list...');
        
        // Coba berbagai kemungkinan endpoint berdasarkan Postman
        const possibleEndpoints = [
            '/api-proxy/api/v1/super-admin/admins',  // Sesuai dengan struktur /super-admin/admins di Postman
            '/api-proxy/api/v1/admins',              // Fallback jika tanpa super-admin prefix
            '/api-proxy/api/v1/admin/admins',        // Kemungkinan menggunakan /admin/ seperti members
        ];

        let lastError: Error | null = null;

        for (const endpoint of possibleEndpoints) {
            try {
                console.log(`Trying endpoint: ${endpoint}`);
                const response = await apiCallWithAuth(endpoint);

                console.log(`Response status for ${endpoint}: ${response.status}`);

                if (response.ok) {
                    const result: ApiResponse<Admin[]> = await response.json();

                    if (result.success) {
                        console.log('Admins fetched successfully with endpoint:', endpoint);
                        console.log('Data:', result.data);
                        return result.data || [];
                    } else {
                        throw new Error(result.message || 'Failed to fetch admins');
                    }
                } else if (response.status === 404) {
                    // Continue to next endpoint for 404
                    console.log(`404 for ${endpoint}, trying next endpoint...`);
                    continue;
                } else {
                    // For other errors, log and try next endpoint
                    const errorData = await response.json().catch(() => ({}));
                    lastError = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
                    console.log(`Error ${response.status} for ${endpoint}:`, lastError.message);
                    continue;
                }
            } catch (error) {
                console.error(`Error with endpoint ${endpoint}:`, error);
                lastError = error instanceof Error ? error : new Error('Unknown error');
                continue;
            }
        }

        // If all endpoints failed
        throw lastError || new Error('All endpoints returned 404 - endpoint not found on server');

    } catch (error) {
        console.error('Error fetching admins:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to fetch admins list');
    }
};

// Create new admin - mencoba berbagai endpoint
export const createAdmin = async (adminData: CreateAdminData): Promise<Admin> => {
    try {
        console.log('Creating admin:', adminData);
        
        const possibleEndpoints = [
            '/api-proxy/api/v1/super-admin/admins',
            '/api-proxy/api/v1/admins',
            '/api-proxy/api/v1/admin/admins',
        ];

        let lastError: Error | null = null;

        for (const endpoint of possibleEndpoints) {
            try {
                console.log(`Trying create endpoint: ${endpoint}`);
                const response = await apiCallWithAuth(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(adminData),
                });

                console.log(`Create response status for ${endpoint}: ${response.status}`);

                if (response.ok) {
                    const result: ApiResponse<Admin> = await response.json();

                    if (result.success) {
                        console.log('Admin created successfully with endpoint:', endpoint);
                        return result.data;
                    } else {
                        throw new Error(result.message || 'Failed to create admin');
                    }
                } else if (response.status === 404) {
                    console.log(`404 for create ${endpoint}, trying next endpoint...`);
                    continue;
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    lastError = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
                    console.log(`Create error ${response.status} for ${endpoint}:`, lastError.message);
                    continue;
                }
            } catch (error) {
                console.error(`Create error with endpoint ${endpoint}:`, error);
                lastError = error instanceof Error ? error : new Error('Unknown error');
                continue;
            }
        }

        throw lastError || new Error('All create endpoints returned 404');

    } catch (error) {
        console.error('Error creating admin:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to create admin');
    }
};

// Update admin - mencoba berbagai endpoint
export const updateAdmin = async (id: number, adminData: UpdateAdminData): Promise<Admin> => {
    try {
        console.log('Updating admin:', id, adminData);
        
        const possibleEndpoints = [
            `/api-proxy/api/v1/super-admin/admins/${id}`,
            `/api-proxy/api/v1/admins/${id}`,
            `/api-proxy/api/v1/admin/admins/${id}`,
        ];

        let lastError: Error | null = null;

        for (const endpoint of possibleEndpoints) {
            try {
                console.log(`Trying update endpoint: ${endpoint}`);
                const response = await apiCallWithAuth(endpoint, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(adminData),
                });

                console.log(`Update response status for ${endpoint}: ${response.status}`);

                if (response.ok) {
                    const result: ApiResponse<Admin> = await response.json();

                    if (result.success) {
                        console.log('Admin updated successfully with endpoint:', endpoint);
                        return result.data;
                    } else {
                        throw new Error(result.message || 'Failed to update admin');
                    }
                } else if (response.status === 404) {
                    console.log(`404 for update ${endpoint}, trying next endpoint...`);
                    continue;
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    lastError = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
                    console.log(`Update error ${response.status} for ${endpoint}:`, lastError.message);
                    continue;
                }
            } catch (error) {
                console.error(`Update error with endpoint ${endpoint}:`, error);
                lastError = error instanceof Error ? error : new Error('Unknown error');
                continue;
            }
        }

        throw lastError || new Error('All update endpoints returned 404');

    } catch (error) {
        console.error('Error updating admin:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to update admin');
    }
};

// Delete admin - mencoba berbagai endpoint
export const deleteAdmin = async (id: number): Promise<void> => {
    try {
        console.log('Deleting admin:', id);
        
        const possibleEndpoints = [
            `/api-proxy/api/v1/super-admin/admins/${id}`,
            `/api-proxy/api/v1/admins/${id}`,
            `/api-proxy/api/v1/admin/admins/${id}`,
        ];

        let lastError: Error | null = null;

        for (const endpoint of possibleEndpoints) {
            try {
                console.log(`Trying delete endpoint: ${endpoint}`);
                const response = await apiCallWithAuth(endpoint, {
                    method: 'DELETE',
                });

                console.log(`Delete response status for ${endpoint}: ${response.status}`);

                if (response.ok) {
                    const result = await response.json();

                    if (result.success) {
                        console.log('Admin deleted successfully with endpoint:', endpoint);
                        return;
                    } else {
                        throw new Error(result.message || 'Failed to delete admin');
                    }
                } else if (response.status === 404) {
                    console.log(`404 for delete ${endpoint}, trying next endpoint...`);
                    continue;
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    lastError = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
                    console.log(`Delete error ${response.status} for ${endpoint}:`, lastError.message);
                    continue;
                }
            } catch (error) {
                console.error(`Delete error with endpoint ${endpoint}:`, error);
                lastError = error instanceof Error ? error : new Error('Unknown error');
                continue;
            }
        }

        throw lastError || new Error('All delete endpoints returned 404');

    } catch (error) {
        console.error('Error deleting admin:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to delete admin');
    }
};