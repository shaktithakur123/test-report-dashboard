const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  async listDirectory(path = '') {
    const response = await fetch(`${API_BASE_URL}/list?path=${encodeURIComponent(path)}`);
    return await response.json();
  }
}

export default new ApiService();
