
import { apiCallWithAuth } from '@/utils/apiClient';

export interface FormField {
  id: number;
  batch_id: number;
  field_label: string;
  input_type: string;
  is_required: boolean;
  field_order: number;
}

export interface Batch {
  id: number;
  batch_name: string;
  batch_type: 'Internship' | 'Lawyers' | 'Staff';
  application_start: string;
  application_end: string;
  status: 'Open' | 'Closed';
  created_at: string;
  updated_at: string;
  applicant_count?: number;
  applicants?: Applicant[];
  formFields?: FormField[]; 
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface CreateBatchData {
  batch_name: string;
  batch_type: 'Internship' | 'Lawyers' | 'Staff';
  application_start: string;
  application_end: string;
  status: 'Open' | 'Closed';
}

const formatDateForAPI = (dateString: string): string => {
  try {
    if (dateString.includes('T') || dateString.includes(' ')) {
      return dateString;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    return date.toISOString();
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    throw new Error(`Invalid date format: ${dateString}`);
  }
};

const formatDateTimeForServer = (dateTimeString: string | undefined): string | undefined => {
  if (!dateTimeString) return undefined;
  return dateTimeString.replace('T', ' ') + ':00';
};

export const createBatch = async (batchData: CreateBatchData): Promise<Batch> => {
  try {
    console.log('Creating new batch with payload:', batchData);

    const response = await apiCallWithAuth('/api-proxy/api/v1/admin/careers/batches', {
      method: 'POST',
      body: JSON.stringify(batchData), 
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('SERVER CREATE ERROR:', { error: errorData, sentData: batchData });
      throw new Error(errorData.message || 'Failed to create batch');
    }
    const result: ApiResponse<Batch> = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error in createBatch function:', error);
    throw error;
  }
};

export const updateBatch = async (id: number, batchData: Partial<CreateBatchData>): Promise<Batch> => {
  try {

    console.log(`Updating batch ${id} with payload:`, batchData);

    const response = await apiCallWithAuth(`/api-proxy/api/v1/admin/careers/batches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(batchData), // Langsung kirim data
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('SERVER UPDATE ERROR:', { error: errorData, sentData: batchData });
      throw new Error(errorData.message || 'Failed to update batch');
    }
    const result: ApiResponse<Batch> = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error in updateBatch function:', error);
    throw error;
  }
};



export const validateBatchData = (batchData: CreateBatchData): string[] => {
  const errors: string[] = [];

  if (!batchData.batch_name?.trim()) {
    errors.push('Batch name is required');
  } else if (batchData.batch_name.trim().length < 3) {
    errors.push('Batch name must be at least 3 characters long');
  }

  if (!batchData.batch_type?.trim()) {
    errors.push('Batch type is required');
  } else if (!['Internship', 'Lawyers', 'Staff'].includes(batchData.batch_type)) {
    errors.push('Invalid batch type');
  }

  if (!batchData.application_start?.trim()) {
    errors.push('Application start date is required');
  } else {
    try {
      const startDate = new Date(batchData.application_start);
      if (isNaN(startDate.getTime())) {
        errors.push('Invalid application start date');
      }
    } catch (error) {
      errors.push('Invalid application start date format');
    }
  }

  if (!batchData.application_end?.trim()) {
    errors.push('Application end date is required');
  } else {
    try {
      const endDate = new Date(batchData.application_end);
      if (isNaN(endDate.getTime())) {
        errors.push('Invalid application end date');
      }
    } catch (error) {
      errors.push('Invalid application end date format');
    }
  }

  if (batchData.application_start && batchData.application_end) {
    try {
      const startDate = new Date(batchData.application_start);
      const endDate = new Date(batchData.application_end);
      
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        if (startDate >= endDate) {
          errors.push('Application end date must be after start date');
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (startDate < today) {
          errors.push('Application start date should not be in the past');
        }
      }
    } catch (error) {
      errors.push('Error validating dates');
    }
  }

  if (!batchData.status?.trim()) {
    errors.push('Status is required');
  } else if (!['Open', 'Closed'].includes(batchData.status)) {
    errors.push('Invalid status');
  }

  return errors;
};

export const getAllBatches = async (): Promise<Batch[]> => {
  try {
    console.log('Fetching all batches...');
    const response = await apiCallWithAuth('/api-proxy/api/v1/admin/careers/batches?limit=100&page=1');

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<Batch[]> = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch batches');
    }

    console.log('Batches fetched successfully:', result.data);
    return result.data.map(batch => ({
      ...batch,
      applicants: []
    })) || [];

  } catch (error) {
    console.error('Error fetching all batches:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch batches list');
  }
};

export const getBatchesByType = async (batchType: 'Internship' | 'Lawyers' | 'Staff'): Promise<Batch[]> => {
  try {
    console.log(`Fetching all batches to filter for type: ${batchType}`);
    
    const allBatches = await getAllBatches();

    const filteredBatches = allBatches.filter(
      batch => batch.batch_type === batchType
    );

    console.log(`Batches for ${batchType} filtered successfully:`, filteredBatches);
    
    return filteredBatches;

  } catch (error) {
    console.error(`Error fetching and filtering batches for type ${batchType}:`, error);
    throw new Error(error instanceof Error ? error.message : `Failed to fetch ${batchType} batches`);
  }
};

export const getBatchById = async (id: number): Promise<Batch> => {
  try {
    console.log(`Fetching batch with ID: ${id}`);
    const response = await apiCallWithAuth(`/api-proxy/api/v1/admin/careers/batches/${id}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result: ApiResponse<Batch> = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch batch details');
    }

    console.log('Batch fetched successfully:', result.data);
    return {
      ...result.data,
      applicants: []
    };

  } catch (error) {
    console.error('Error fetching batch by ID:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch batch details');
  }
};

export const deleteBatch = async (id: number): Promise<boolean> => {
  try {
    console.log(`Deleting batch with ID: ${id}`);

    const response = await apiCallWithAuth(`/api-proxy/api/v1/admin/careers/batches/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to delete batch');
    }

    console.log('Batch deleted successfully');
    return true;

  } catch (error) {
    console.error('Error deleting batch:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete batch');
  }
};

export const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  };
  
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
};

export interface BatchFilters {
  search?: string;
  batch_type?: string;
  status?: string;
  sortBy?: 'batch_name' | 'batch_type' | 'status' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export const filterBatches = (batches: Batch[], filters: BatchFilters): Batch[] => {
  let filtered = [...batches];

  if (filters.search?.trim()) {
    const searchTerm = filters.search.toLowerCase().trim();
    filtered = filtered.filter(batch =>
      batch.batch_name?.toLowerCase().includes(searchTerm) ||
      batch.batch_type?.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.batch_type?.trim()) {
    filtered = filtered.filter(batch =>
      batch.batch_type?.toLowerCase() === filters.batch_type!.toLowerCase()
    );
  }

  if (filters.status?.trim()) {
    filtered = filtered.filter(batch =>
      batch.status?.toLowerCase() === filters.status!.toLowerCase()
    );
  }

  if (filters.sortBy) {
    filtered.sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;

      switch (filters.sortBy) {
        case 'batch_name':
          aValue = a.batch_name?.toLowerCase() || '';
          bValue = b.batch_name?.toLowerCase() || '';
          break;
        case 'batch_type':
          aValue = a.batch_type?.toLowerCase() || '';
          bValue = b.batch_type?.toLowerCase() || '';
          break;
        case 'status':
          aValue = a.status?.toLowerCase() || '';
          bValue = b.status?.toLowerCase() || '';
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

export const getFieldsByBatchId = async (batchId: number): Promise<FormField[]> => {
  try {
    const response = await apiCallWithAuth(`/api-proxy/api/v1/admin/careers/batches/${batchId}/fields`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch form fields');
    }
    const result: ApiResponse<FormField[]> = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'API request failed');
    }
    return result.data.sort((a, b) => a.field_order - b.field_order) || [];
  } catch (error) {
    console.error('Error fetching fields by batch ID:', error);
    throw error;
  }
};

export interface CreateFieldData {
  field_label: string;
  input_type: string;
  is_required: boolean;
}

export const createField = async (batchId: number, fieldData: CreateFieldData): Promise<FormField> => {
  try {
    const response = await apiCallWithAuth(`/api-proxy/api/v1/admin/careers/batches/${batchId}/fields`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fieldData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create form field');
    }
    const result: ApiResponse<FormField> = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'API request failed');
    }
    return result.data;
  } catch (error) {
    console.error('Error creating field:', error);
    throw error;
  }
};

export const deleteField = async (fieldId: number): Promise<boolean> => {
  try {
    const response = await apiCallWithAuth(`/api-proxy/api/v1/admin/careers/fields/${fieldId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete form field');
    }
    const result = await response.json();
    if (!result.success) throw new Error(result.message || 'API request failed');
    return true;
  } catch (error) {
    console.error('Error deleting field:', error);
    throw error;
  }
};

export type UpdateFieldData = Partial<CreateFieldData>;

export const updateField = async (fieldId: number, fieldData: UpdateFieldData): Promise<FormField> => {
  try {
    const response = await apiCallWithAuth(`/api-proxy/api/v1/admin/careers/fields/${fieldId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fieldData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update form field');
    }
    const result: ApiResponse<FormField> = await response.json();
    if (!result.success) throw new Error(result.message || 'API request failed');
    return result.data;
  } catch (error) {
    console.error('Error updating field:', error);
    throw error;
  }
};

export interface ApplicationValue {
  id: number;
  application_id: number;
  form_field_id: number;
  value: string;
  file_url: string;
  form_field: FormField;
}

export interface Applicant {
  id: number;
  batch_id: number;
  applicant_name: string;
  email: string;
  university: string;
  current_status: string; 
  application_date: string;
  status: 'New' | 'Viewed' | 'Contacted' | 'Rejected'; 
  application_values: ApplicationValue[];
}

export const getApplicantsByBatchId = async (batchId: number, status?: string): Promise<Applicant[]> => {
  try {
    let url = `/api-proxy/api/v1/admin/careers/batches/${batchId}/applications?limit=100&page=1`;
    if (status) {
      url += `&status=${status}`;
    }
    const response = await apiCallWithAuth(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch applicants');
    }
    const result: ApiResponse<Applicant[]> = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'API request failed for applicants');
    }
    return result.data || [];
  } catch (error) {
    console.error(`Error fetching applicants for batch ${batchId}:`, error);
    throw error;
  }
};

export const getApplicantById = async (applicantId: number): Promise<Applicant> => {
  try {
    const response = await apiCallWithAuth(`/api-proxy/api/v1/admin/careers/applications/${applicantId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch applicant details');
    }
    const result: ApiResponse<Applicant> = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'API request failed for applicant details');
    }
    return result.data;
  } catch (error) {
    console.error(`Error fetching applicant ${applicantId}:`, error);
    throw error;
  }
};

export const updateApplicantStatus = async (applicantId: number, status: string): Promise<boolean> => {
  try {
    const response = await apiCallWithAuth(`/api-proxy/api/v1/admin/careers/applications/${applicantId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update applicant status');
    }
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error(`Error updating status for applicant ${applicantId}:`, error);
    throw error;
  }
};

export const deleteApplicant = async (applicantId: number): Promise<boolean> => {
  try {
    const response = await apiCallWithAuth(`/api-proxy/api/v1/admin/careers/applications/${applicantId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete applicant');
    }
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error(`Error deleting applicant ${applicantId}:`, error);
    throw error;
  }
};