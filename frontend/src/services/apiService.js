import axios from 'axios';
import { toast } from 'react-toastify';

class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || '';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ API Response Error:', error);
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.error || error.response.data?.message || 'Server error';
      
      switch (status) {
        case 404:
          toast.error(`Not found: ${message}`);
          break;
        case 500:
          toast.error(`Server error: ${message}`);
          break;
        default:
          toast.error(`Error ${status}: ${message}`);
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error: Unable to connect to server');
    } else {
      // Other error
      toast.error(`Error: ${error.message}`);
    }
  }

  /**
   * List directory contents
   * @param {string} path - Directory path to list
   * @returns {Promise<Array>} Array of file/folder objects
   */
  async listDirectory(path = '/') {
    try {
      const response = await this.client.get('/api/list', {
        params: { path }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to list directory: ${path}`);
    }
  }

  /**
   * Get file content
   * @param {string} path - File path to read
   * @returns {Promise<string>} File content as text
   */
  async getFileContent(path) {
    try {
      const response = await this.client.get('/api/file', {
        params: { path },
        responseType: 'text'
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to read file: ${path}`);
    }
  }

  /**
   * Get item information
   * @param {string} path - Item path
   * @returns {Promise<Object>} Item metadata
   */
  async getItemInfo(path) {
    try {
      const response = await this.client.get('/api/info', {
        params: { path }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get item info: ${path}`);
    }
  }

  /**
   * Download file or folder
   * @param {string} path - Item path to download
   * @param {string} filename - Optional filename for download
   */
  async downloadItem(path, filename = null) {
    try {
      const response = await this.client.get('/api/download', {
        params: { path },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from response headers or use provided filename
      const contentDisposition = response.headers['content-disposition'];
      let downloadFilename = filename;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          downloadFilename = filenameMatch[1];
        }
      }
      
      if (!downloadFilename) {
        // Fallback to path basename
        downloadFilename = path.split('/').pop() || 'download';
      }
      
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Downloaded: ${downloadFilename}`);
      
    } catch (error) {
      throw new Error(`Failed to download: ${path}`);
    }
  }

  /**
   * Check backend health
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('Backend health check failed');
    }
  }

  /**
   * Get backend info
   * @returns {Promise<Object>} Backend information
   */
  async getBackendInfo() {
    try {
      const response = await this.client.get('/');
      return response.data;
    } catch (error) {
      throw new Error('Failed to get backend info');
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;