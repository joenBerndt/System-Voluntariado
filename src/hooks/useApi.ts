import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info.tsx';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-f99e977c`;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function useApi<T>(endpoint: string, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      
      if (result.success) {
        setData(result.data || (Array.isArray(result.data) ? [] as T : null));
        setError(null);
      } else {
        setError(result.error || 'Unknown error occurred');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

export async function apiPost<T>(endpoint: string, body: any): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const result: ApiResponse<T> = await response.json();

  if (!response.ok) {
    // Throw error with the server's error message
    throw new Error(result.error || `HTTP error! status: ${response.status}`);
  }
  
  if (!result.success) {
    throw new Error(result.error || 'API request failed');
  }

  return result.data as T;
}

export async function apiPut<T>(endpoint: string, body: any): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: ApiResponse<T> = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'API request failed');
  }

  return result.data as T;
}

export async function apiDelete(endpoint: string): Promise<void> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: ApiResponse<void> = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'API request failed');
  }
}

export async function initializeData(): Promise<void> {
  await apiPost('/initialize', {});
}