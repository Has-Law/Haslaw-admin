import { apiCallWithAuth } from '@/utils/apiClient';

export interface ApiNews {
    id: number;
    news_title: string;
    slug: string;
    category: string;
    status: "Posted" | "Drafted";
    content: string;
    image: string;
    created_at: string;
    updated_at: string;
}

export const fetchNewsList = async (): Promise<ApiNews[]> => {
    try {
        const response = await apiCallWithAuth('/api-proxy/api/v1/admin/news', { 
        cache: 'no-store' 
    });
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Gagal mengambil daftar berita');
        }
        
        return result.data;
    } catch (error) {
        console.error('Error fetching news list:', error);
        throw error;
    }
};

export const fetchNewsById = async (id: number): Promise<ApiNews> => {
    try {
        const response = await apiCallWithAuth(`/api-proxy/api/v1/admin/news/${id}`);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Gagal mengambil detail berita');
        }
        
        return result.data;
    } catch (error) {
        console.error('Error fetching news by ID:', error);
        throw error;
    }
};

export const createNews = async (formData: FormData) => {
    try {
        const response = await apiCallWithAuth('/api-proxy/api/v1/admin/news', {
            method: 'POST',
            body: formData,
            headers: {} 
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Gagal membuat berita');
        }
        
        return result;
    } catch (error) {
        console.error('Error creating news:', error);
        throw error;
    }
};

export const updateNews = async (id: number, formData: FormData) => {
    try {
        console.log('Updating news ID:', id);
        console.log('FormData entries:');
        for (const pair of formData.entries()) {
            console.log(pair[0], pair[1]);
        }

        const response = await apiCallWithAuth(`/api-proxy/api/v1/admin/news/${id}`, {
            method: 'PATCH',
            body: formData,
            headers: {} 
        });
        
        if (!response.ok) {
            console.log('PATCH failed, trying PUT...');
            const putResponse = await apiCallWithAuth(`/api-proxy/api/v1/admin/news/${id}`, {
                method: 'PUT', 
                body: formData,
                headers: {}
            });
            
            if (!putResponse.ok) {
                console.log('PUT failed, trying POST with _method...');
                formData.append('_method', 'PUT');
                
                const postResponse = await apiCallWithAuth(`/api-proxy/api/v1/admin/news/${id}`, {
                    method: 'POST',
                    body: formData,
                    headers: {}
                });
                
                const postResult = await postResponse.json();
                
                if (!postResponse.ok) {
                    throw new Error(postResult.message || 'Gagal mengupdate berita dengan semua metode');
                }
                
                return postResult;
            }
            
            return await putResponse.json();
        }
        
        return await response.json();
        
    } catch (error) {
        console.error('Error updating news:', error);
        throw error;
    }
};

export const deleteNews = async (id: number) => {
    try {
        const response = await apiCallWithAuth(`/api-proxy/api/v1/admin/news/${id}`, {
            method: 'DELETE',
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Gagal menghapus berita');
        }
        
        return result;
    } catch (error) {
        console.error('Error deleting news:', error);
        throw error;
    }
};