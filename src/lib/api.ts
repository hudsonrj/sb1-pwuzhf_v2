export class ApiError extends Error {
  public status: number;
  public details?: string;
  public timestamp?: string;

  constructor(message: string, status: number, details?: string, timestamp?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.timestamp = timestamp;
  }
}

const API_URL = 'http://localhost:3000/api';
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const checkServerHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    const data = await response.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
};

const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  attempts: number = RETRY_ATTEMPTS
): Promise<T> => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === attempts - 1) throw error;
      await sleep(RETRY_DELAY * Math.pow(2, i));
    }
  }
  throw new Error('All retry attempts failed');
};

export const analyzeImage = async (file: File): Promise<any> => {
  try {
    if (!file.type.startsWith('image/')) {
      throw new ApiError('Invalid file type', 400, 'Please provide a valid image file');
    }

    // Check server health with retries
    const isServerHealthy = await retryWithBackoff(checkServerHealth);
    if (!isServerHealthy) {
      throw new ApiError(
        'Server unavailable',
        503,
        'The server is currently unavailable. Please try again in a few moments'
      );
    }

    const formData = new FormData();
    formData.append('image', file);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(`${API_URL}/analyze-image`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: 'Unknown error',
          details: 'An unexpected error occurred'
        }));

        throw new ApiError(
          errorData.error || 'Server error',
          response.status,
          errorData.details || 'Failed to process the image'
        );
      }

      const data = await response.json();
      
      if (!data.result) {
        throw new ApiError('Invalid response', 500, 'The server returned an empty result');
      }

      return data.result;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408, 'The request took too long to complete');
      }
      
      if (!navigator.onLine) {
        throw new ApiError('Network error', 0, 'Please check your internet connection');
      }

      throw new ApiError(
        'Network error',
        500,
        'Failed to communicate with the server. Please try again'
      );
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Unknown error', 500, 'An unexpected error occurred');
  }
};