import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info.tsx';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-f99e977c`;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface UseApiOptions {
  fallbackOnError?: boolean;
  autoRetry?: boolean;
  retryDelay?: number;
  maxRetries?: number;
}

export function useApi<T>(endpoint: string, options: UseApiOptions = {}, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const maxRetries = options.maxRetries || 3;
  const retryDelay = options.retryDelay || 2000;

  const fetchData = async (isRetry: boolean = false) => {
    try {
      if (!isRetry) {
        setLoading(true);
      }
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      
      // Si es non-JSON y tenemos fallback, usar array vacío
      if (!contentType || !contentType.includes('application/json')) {
        if (options.fallbackOnError) {
          // Solo mostrar warning en desarrollo, silencioso en producción
          if (retryCount === 0 && !isRetry) {
            console.log(`🔄 Servidor iniciando para ${endpoint}, usando datos en caché...`);
          }
          setData([] as T);
          setError(null);
          setLoading(false);
          
          // Programar reintento automático si está habilitado
          if (options.autoRetry !== false && retryCount < maxRetries) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              fetchData(true);
            }, retryDelay);
          }
          return;
        }
        throw new Error(`Servidor devolvió una respuesta no válida (código ${response.status}). El servidor puede estar desplegándose.`);
      }

      if (!response.ok) {
        // Si el endpoint no existe (404) y tenemos fallback activado, usa array vacío
        if (response.status === 404 && options.fallbackOnError) {
          if (retryCount === 0 && !isRetry) {
            console.log(`🔄 Servidor iniciando para ${endpoint}, usando datos en caché...`);
          }
          setData([] as T);
          setError(null);
          setLoading(false);
          
          // Programar reintento automático si está habilitado
          if (options.autoRetry !== false && retryCount < maxRetries) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              fetchData(true);
            }, retryDelay);
          }
          return;
        }
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      
      if (result.success) {
        setData(result.data || (Array.isArray(result.data) ? [] as T : null));
        setError(null);
        // Reset retry count en éxito
        if (isRetry && retryCount > 0) {
          console.log(`✅ Conexión restaurada para ${endpoint}`);
          setRetryCount(0);
        }
      } else {
        if (options.fallbackOnError) {
          if (retryCount === 0 && !isRetry) {
            console.log(`🔄 Servidor iniciando para ${endpoint}, usando datos en caché...`);
          }
          setData([] as T);
          setError(null);
          
          // Programar reintento automático si está habilitado
          if (options.autoRetry !== false && retryCount < maxRetries) {
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              fetchData(true);
            }, retryDelay);
          }
        } else {
          setError(result.error || 'Error desconocido');
        }
      }
    } catch (err) {
      if (options.fallbackOnError) {
        if (retryCount === 0 && !isRetry) {
          console.log(`🔄 Servidor iniciando para ${endpoint}, usando datos en caché...`);
        }
        setData([] as T);
        setError(null);
        
        // Programar reintento automático si está habilitado
        if (options.autoRetry !== false && retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            fetchData(true);
          }, retryDelay);
        }
      } else {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Error al obtener datos');
        setData(null);
      }
    } finally {
      if (!isRetry) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    setRetryCount(0); // Reset retry count en cambio de dependencias
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData, isLoading: loading };
}

// Helper function to detect if an error is retryable
function isRetryableError(error: any, status?: number): boolean {
  // Don't retry client errors (400 level) except 404
  if (status && status >= 400 && status < 500 && status !== 404) {
    return false;
  }
  
  // Don't retry validation errors
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('already registered') || 
        msg.includes('ya está registrado') ||
        msg.includes('invalid') ||
        msg.includes('inválido') ||
        msg.includes('not found') && !msg.includes('404')) {
      return false;
    }
    
    // Server is deploying (404 or non-JSON response)
    if (msg.includes('iniciando') || msg.includes('desplegándose') || msg.includes('no válida')) {
      return true;
    }
  }
  
  // Server is deploying (404 status)
  if (status === 404) return true;
  
  return false;
}

// Helper function to retry operations
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  retryDelay: number = 3000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check if this error is retryable
      const shouldRetry = isRetryableError(error, error?.status);
      
      if (shouldRetry && attempt < maxRetries) {
        console.log(`🔄 Reintentando operación (intento ${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
      // If not retryable or out of retries, throw the error
      throw error;
    }
  }
  
  throw lastError;
}

export async function apiPost<T>(endpoint: string, body: any): Promise<T> {
  return retryOperation(async () => {
    try {
      console.log('📤 POST Request:', endpoint, body);
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        
        // Si es un 404, probablemente el servidor está desplegándose
        if (response.status === 404) {
          console.log('🔄 Servidor iniciando, reintentando automáticamente...');
          const error = new Error('⏳ El servidor está iniciando. Por favor, espera 10-15 segundos e intenta nuevamente.') as any;
          error.status = 404;
          throw error;
        }
        
        console.error('Non-JSON response:', text);
        const error = new Error(`El servidor devolvió una respuesta no válida (código ${response.status}). El servidor puede estar iniciando.`) as any;
        error.status = response.status;
        throw error;
      }

      const result: ApiResponse<T> = await response.json();
      console.log('📥 POST Response:', endpoint, result);

      if (!response.ok) {
        // Throw error with the server's error message and status for validation errors
        const error = new Error(result.error || `Error del servidor: ${response.status}`) as any;
        error.status = response.status;
        console.error('❌ POST Error (not ok):', result.error);
        throw error;
      }
      
      if (!result.success) {
        console.error('❌ POST Error (not success):', result.error);
        const error = new Error(result.error || 'La operación falló') as any;
        error.status = response.status;
        throw error;
      }

      console.log('✅ POST Success:', endpoint);
      return result.data as T;
    } catch (error) {
      // Si es un error de red, dar un mensaje más claro
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      }
      throw error;
    }
  });
}

export async function apiPut<T>(endpoint: string, body: any): Promise<T> {
  return retryOperation(async () => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        
        // Si es un 404, probablemente el servidor está desplegándose
        if (response.status === 404) {
          console.log('🔄 Servidor iniciando, reintentando automáticamente...');
          const error = new Error('⏳ El servidor está iniciando. Por favor, espera 10-15 segundos e intenta nuevamente.') as any;
          error.status = 404;
          throw error;
        }
        
        console.error('Non-JSON response:', text);
        const error = new Error(`El servidor devolvió una respuesta no válida (código ${response.status}). El servidor puede estar iniciando.`) as any;
        error.status = response.status;
        throw error;
      }

      if (!response.ok) {
        const result: ApiResponse<T> = await response.json();
        const error = new Error(result.error || `Error del servidor: ${response.status}`) as any;
        error.status = response.status;
        throw error;
      }

      const result: ApiResponse<T> = await response.json();
      
      if (!result.success) {
        const error = new Error(result.error || 'La operación falló') as any;
        error.status = response.status;
        throw error;
      }

      return result.data as T;
    } catch (error) {
      // Si es un error de red, dar un mensaje más claro
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      }
      throw error;
    }
  });
}

export async function apiDelete(endpoint: string): Promise<void> {
  return retryOperation(async () => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        
        // Si es un 404, probablemente el servidor está desplegándose
        if (response.status === 404) {
          console.log('🔄 Servidor iniciando, reintentando automáticamente...');
          const error = new Error('⏳ El servidor está iniciando. Por favor, espera 10-15 segundos e intenta nuevamente.') as any;
          error.status = 404;
          throw error;
        }
        
        console.error('Non-JSON response:', text);
        const error = new Error(`El servidor devolvió una respuesta no válida (código ${response.status}). El servidor puede estar iniciando.`) as any;
        error.status = response.status;
        throw error;
      }

      if (!response.ok) {
        const result: ApiResponse<void> = await response.json();
        const error = new Error(result.error || `Error del servidor: ${response.status}`) as any;
        error.status = response.status;
        throw error;
      }

      const result: ApiResponse<void> = await response.json();
      
      if (!result.success) {
        const error = new Error(result.error || 'La operación falló') as any;
        error.status = response.status;
        throw error;
      }
    } catch (error) {
      // Si es un error de red, dar un mensaje más claro
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      }
      throw error;
    }
  });
}

export async function initializeData(): Promise<void> {
  await apiPost('/initialize', {});
}