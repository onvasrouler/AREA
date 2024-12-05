import process from 'process';

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL.endsWith("/") ? baseURL : `${baseURL}/`
    this.accessToken = null;
  }

  setAccessToken(token) {
    this.accessToken = token;
  }

  getHeaders(headers = {}, isFormData = false) {
    const defaultHeaders = {
      ...headers,
    };

    if (!isFormData) {
      defaultHeaders["Content-Type"] = "application/json";
    }

    if (this.accessToken) {
      defaultHeaders["Authorization"] = `Bearer ${this.accessToken}`;
    }

    return defaultHeaders;
  }

  async request(endpoint, method = "GET", body, headers = {}, isFormData = false) {
    const url = `${this.baseURL}${endpoint}`;

    const options = {
      method,
      headers: this.getHeaders(headers, isFormData),
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    };

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorData = await response.json();
        throw {
          status: response.status,
          message: errorData.message || "An error occurred",
        };
      }

      return response;
    } catch (error) {
      const formattedError = {
        status: error.status || 500,
        message: error.message || "An unexpected error occurred",
      };
      console.error("Error fetching data:", formattedError);
      throw formattedError;
    }
  }

  get(endpoint, headers) {
    return this.request(endpoint, "GET", undefined, headers);
  }

  post = (endpoint, body, headers, isFormData = false) => {
    return this.request(endpoint, "POST", body, headers, isFormData);
  };

  put(endpoint, body, headers, isFormData = false) {
    return this.request(endpoint, "PUT", body, headers, isFormData);
  }

  delete(endpoint, headers) {
    return this.request(endpoint, "DELETE", undefined, headers);
  }

  patch = (endpoint, body, headers = {}, isFormData = false) => {
    return this.request(endpoint, "PATCH", body, headers, isFormData);
  };
}

export function getApiClient() {
  const token = localStorage.getItem('token');
  const apiClient = new ApiClient(import.meta.env.VITE_BACKEND_URL);
  if (token) {
    apiClient.setAccessToken(token);
  }
  return apiClient;
}