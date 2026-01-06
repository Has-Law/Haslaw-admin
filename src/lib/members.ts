import { apiCallWithAuth } from '@/utils/apiClient';

export interface ApiMember {
    id: number;
    full_name: string;
    title_position: string;
    email: string;
    phone_number: string;
    linkedin: string;
    business_card: string;
    display_image: string;
    detail_image: string;
    biography: string;
    practice_focus: string[];
    education: string[];
    language: string[];
    created_at: string;
    updated_at: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface CreateMemberData {
    full_name: string;
    title_position: string;
    email: string;
    phone_number: string;
    linkedin?: string;
    biography?: string;
    practice_focus?: string[];
    education?: string[];
    language?: string[];
    display_image?: File;
    detail_image?: File;
    business_card?: File;
}

// Helper function untuk translate error dari server ke bahasa yang user-friendly
const translateMemberError = (errorMessage: string): string => {
    const message = errorMessage?.toLowerCase() || '';

    if (message.includes('failed to save business card') || message.includes('business_card')) {
        return 'Gagal menyimpan business card. Business card harus berupa file PDF.';
    }
    if (message.includes('invalid file extension') && message.includes('pdf')) {
        return 'Format file tidak valid. Business card harus berupa file PDF.';
    }
    if (message.includes('failed to save display image') || message.includes('display_image')) {
        return 'Gagal menyimpan foto display. Pastikan format gambar valid (JPEG/PNG/WebP) dan ukuran tidak lebih dari 5MB.';
    }
    if (message.includes('failed to save detail image') || message.includes('detail_image')) {
        return 'Gagal menyimpan foto detail. Pastikan format gambar valid (JPEG/PNG/WebP) dan ukuran tidak lebih dari 5MB.';
    }
    if (message.includes('email') && (message.includes('exists') || message.includes('duplicate') || message.includes('unique'))) {
        return 'Email sudah terdaftar. Silakan gunakan email lain.';
    }
    if (message.includes('phone') && (message.includes('exists') || message.includes('duplicate') || message.includes('unique'))) {
        return 'Nomor telepon sudah terdaftar. Silakan gunakan nomor lain.';
    }
    if (message.includes('invalid') && message.includes('email')) {
        return 'Format email tidak valid.';
    }
    if (message.includes('invalid') && message.includes('phone')) {
        return 'Format nomor telepon tidak valid.';
    }
    if (message.includes('required')) {
        return 'Mohon lengkapi semua field yang wajib diisi.';
    }
    if (message.includes('unauthorized') || message.includes('401')) {
        return 'Sesi Anda telah berakhir. Silakan login kembali.';
    }
    if (message.includes('forbidden') || message.includes('403')) {
        return 'Anda tidak memiliki izin untuk melakukan aksi ini.';
    }
    if (message.includes('file too large') || message.includes('size')) {
        return 'Ukuran file terlalu besar. Maksimal 5MB per file.';
    }
    if (message.includes('invalid file type') || message.includes('mime') || message.includes('format')) {
        return 'Format file tidak didukung. Gunakan JPEG, PNG, atau WebP.';
    }
    if (message.includes('invalid file extension')) {
        return 'Format file tidak valid. Business card harus berupa file PDF.';
    }

    return errorMessage || 'Terjadi kesalahan. Silakan coba lagi.';
};

export const fetchMembersList = async (): Promise<ApiMember[]> => {
    try {
        console.log('Fetching members list...');
        const response = await apiCallWithAuth('/api-proxy/api/v1/admin/members?limit=100&page=1');

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const result: ApiResponse<ApiMember[]> = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch members');
        }

        console.log('Members fetched successfully:', result.data);
        return result.data || [];

    } catch (error) {
        console.error('Error fetching members list:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to fetch members list');
    }
};

export const fetchMemberById = async (id: number): Promise<ApiMember> => {
    try {
        console.log(`Fetching member with ID: ${id}`);
        const response = await apiCallWithAuth(`/api-proxy/api/v1/admin/members/${id}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const result: ApiResponse<ApiMember> = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Failed to fetch member details');
        }

        console.log('Member fetched successfully:', result.data);
        return result.data;

    } catch (error) {
        console.error('Error fetching member by ID:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to fetch member details');
    }
};

export const createMember = async (memberData: CreateMemberData) => {
    try {
        const formData = new FormData();
        formData.append('full_name', memberData.full_name);
        formData.append('title_position', memberData.title_position);
        formData.append('email', memberData.email);
        formData.append('phone_number', memberData.phone_number);

        if (memberData.linkedin) formData.append('linkedin', memberData.linkedin);
        if (memberData.biography) formData.append('biography', memberData.biography);

        const filteredPracticeFocus = memberData.practice_focus?.filter(item => item.trim() !== '') || [];
        if (filteredPracticeFocus.length > 0) {
            formData.append('practice_focus', filteredPracticeFocus.join(','));
        }

        const filteredEducation = memberData.education?.filter(item => item.trim() !== '') || [];
        if (filteredEducation.length > 0) {
            formData.append('education', filteredEducation.join(','));
        }

        const filteredLanguage = memberData.language?.filter(item => item.trim() !== '') || [];
        if (filteredLanguage.length > 0) {
            formData.append('language', filteredLanguage.join(','));
        }

        // Log file info untuk debugging
        if (memberData.display_image) {
            console.log('Display image:', memberData.display_image.name, memberData.display_image.type, memberData.display_image.size);
            formData.append('display_image', memberData.display_image);
        }
        if (memberData.detail_image) {
            console.log('Detail image:', memberData.detail_image.name, memberData.detail_image.type, memberData.detail_image.size);
            formData.append('detail_image', memberData.detail_image);
        }
        if (memberData.business_card) {
            const file = memberData.business_card;
            console.log('Business card file:', file.name, file.type, file.size);
            formData.append('business_card', file, file.name);
        }

        // Debug: Log semua FormData entries
        console.log('=== FormData entries ===');
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`  ${key}: File(name=${value.name}, type=${value.type}, size=${value.size})`);
            } else {
                console.log(`  ${key}: ${value}`);
            }
        }
        console.log('========================');

        const response = await apiCallWithAuth('/api-proxy/api/v1/admin/members', {
            method: 'POST',
            body: formData,
            headers: {}  // Penting: biarkan browser set Content-Type dengan boundary
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Server error response:', errorData);
            const friendlyMessage = translateMemberError(errorData.message || errorData.error);
            throw new Error(friendlyMessage);
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating member:', error);
        throw error;
    }
};

export const updateMember = async (id: number, memberData: CreateMemberData) => {
    try {
        const formData = new FormData();
        formData.append('full_name', memberData.full_name);
        formData.append('title_position', memberData.title_position);
        formData.append('email', memberData.email);
        formData.append('phone_number', memberData.phone_number);

        if (memberData.linkedin) formData.append('linkedin', memberData.linkedin);
        if (memberData.biography) formData.append('biography', memberData.biography);

        const filteredPracticeFocus = memberData.practice_focus?.filter(item => item.trim() !== '') || [];
        if (filteredPracticeFocus.length > 0) {
            formData.append('practice_focus', filteredPracticeFocus.join(','));
        }

        const filteredEducation = memberData.education?.filter(item => item.trim() !== '') || [];
        if (filteredEducation.length > 0) {
            formData.append('education', filteredEducation.join(','));
        }

        const filteredLanguage = memberData.language?.filter(item => item.trim() !== '') || [];
        if (filteredLanguage.length > 0) {
            formData.append('language', filteredLanguage.join(','));
        }
        
        // Log file info untuk debugging
        if (memberData.display_image) {
            console.log('Display image:', memberData.display_image.name, memberData.display_image.type, memberData.display_image.size);
            formData.append('display_image', memberData.display_image);
        }
        if (memberData.detail_image) {
            console.log('Detail image:', memberData.detail_image.name, memberData.detail_image.type, memberData.detail_image.size);
            formData.append('detail_image', memberData.detail_image);
        }
        if (memberData.business_card) {
            console.log('Business card:', memberData.business_card.name, memberData.business_card.type, memberData.business_card.size);
            formData.append('business_card', memberData.business_card);
        }

        const response = await apiCallWithAuth(`/api-proxy/api/v1/admin/members/${id}`, {
            method: 'PUT',
            body: formData,
            headers: {}  // Penting: biarkan browser set Content-Type dengan boundary
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Server error response:', errorData);
            const friendlyMessage = translateMemberError(errorData.message || errorData.error);
            throw new Error(friendlyMessage);
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating member:', error);
        throw error;
    }
}
export const deleteMember = async (id: number) => {
    try {
        console.log(`Deleting member with ID: ${id}`);

        const response = await apiCallWithAuth(`/api-proxy/api/v1/admin/members/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'Failed to delete member');
        }

        console.log('Member deleted successfully');
        return result;

    } catch (error) {
        console.error('Error deleting member:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to delete member');
    }
};

export const validateMemberData = (memberData: CreateMemberData): string[] => {
    const errors: string[] = [];

    if (!memberData.full_name?.trim()) {
        errors.push('Full name is required');
    }

    if (!memberData.title_position?.trim()) {
        errors.push('Title/Position is required');
    }

    if (!memberData.email?.trim()) {
        errors.push('Email is required');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(memberData.email)) {
            errors.push('Please enter a valid email address');
        }
    }

    if (!memberData.phone_number?.trim()) {
        errors.push('Phone number is required');
    }

    if (memberData.linkedin?.trim()) {
        const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/.+$/;
        if (!linkedinRegex.test(memberData.linkedin)) {
            errors.push('Please enter a valid LinkedIn URL');
        }
    }

    const maxFileSize = 5 * 1024 * 1024; 

    if (memberData.display_image && memberData.display_image.size > maxFileSize) {
        errors.push('Display image must be smaller than 5MB');
    }

    if (memberData.detail_image && memberData.detail_image.size > maxFileSize) {
        errors.push('Detail image must be smaller than 5MB');
    }

    if (memberData.business_card && memberData.business_card.size > maxFileSize) {
        errors.push('Business card file must be smaller than 5MB');
    }

    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (memberData.display_image && !allowedImageTypes.includes(memberData.display_image.type)) {
        errors.push('Display image must be JPEG, PNG, or WebP format');
    }

    if (memberData.detail_image && !allowedImageTypes.includes(memberData.detail_image.type)) {
        errors.push('Detail image must be JPEG, PNG, or WebP format');
    }

    // Business card harus PDF
    const allowedBusinessCardTypes = ['application/pdf'];
    if (memberData.business_card && !allowedBusinessCardTypes.includes(memberData.business_card.type)) {
        errors.push('Business card harus berupa file PDF');
    }

    return errors;
};

export const getImageUrl = (imagePath: string, baseUrl = 'https://api.has-law.com'): string => {
    if (!imagePath) return '/default-avatar.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `${baseUrl}/${imagePath}`;
};

export interface MemberFilters {
    search?: string;
    position?: string;
    sortBy?: 'name' | 'position' | 'created_at';
    sortOrder?: 'asc' | 'desc';
}

export const filterMembers = (members: ApiMember[], filters: MemberFilters): ApiMember[] => {
    let filtered = [...members];

    if (filters.search?.trim()) {
        const searchTerm = filters.search.toLowerCase().trim();
        filtered = filtered.filter(member =>
            member.full_name?.toLowerCase().includes(searchTerm) ||
            member.title_position?.toLowerCase().includes(searchTerm) ||
            member.email?.toLowerCase().includes(searchTerm) ||
            member.practice_focus?.some(focus => focus.toLowerCase().includes(searchTerm))
        );
    }

    if (filters.position?.trim()) {
        filtered = filtered.filter(member =>
            member.title_position?.toLowerCase().includes(filters.position!.toLowerCase())
        );
    }

    if (filters.sortBy) {
        filtered.sort((a, b) => {
            let aValue: string | Date;
            let bValue: string | Date;

            switch (filters.sortBy) {
                case 'name':
                    aValue = a.full_name?.toLowerCase() || '';
                    bValue = b.full_name?.toLowerCase() || '';
                    break;
                case 'position':
                    aValue = a.title_position?.toLowerCase() || '';
                    bValue = b.title_position?.toLowerCase() || '';
                    break;
                case 'created_at':
                    aValue = new Date(a.created_at);
                    bValue = new Date(b.created_at);
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return filters.sortOrder === 'desc' ? 1 : -1;
            if (aValue > bValue) return filters.sortOrder === 'desc' ? -1 : 1;
            return 0;
        });
    }

    return filtered;
};