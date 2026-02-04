import { ApiResponse } from '../types/api.types';

const API_BASE_URL = 'http://localhost:5000/api';

export class ApiService {
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return response.json();
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  async uploadFile<T>(endpoint: string, file: File): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  }

  async downloadFile(endpoint: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return response.blob();
  }
}