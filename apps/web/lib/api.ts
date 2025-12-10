/**
 * API client for making requests to the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface ApiOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

interface ApiError {
  message: string;
  status: number;
  data?: unknown;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(endpoint: string, params?: ApiOptions["params"]): string {
    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = {
        message: "An error occurred",
        status: response.status,
      };

      try {
        const data = await response.json();
        error.message = data.error || data.message || error.message;
        error.data = data;
      } catch {
        error.message = response.statusText;
      }

      throw error;
    }

    return response.json();
  }

  async get<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      ...fetchOptions,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options: ApiOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      ...fetchOptions,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options: ApiOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      ...fetchOptions,
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      ...fetchOptions,
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });

    return this.handleResponse<T>(response);
  }

  async upload<T>(
    endpoint: string,
    formData: FormData,
    options: ApiOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      ...fetchOptions,
      method: "POST",
      // Browser will set the Content-Type header with boundary
      body: formData,
    });

    return this.handleResponse<T>(response);
  }
}

export const api = new ApiClient("/api");
export { ApiClient };
export type { ApiError, ApiOptions };
