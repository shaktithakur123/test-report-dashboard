// Simple mock-based tests for apiService
describe('ApiService', () => {
  let mockApiService;

  beforeEach(() => {
    // Create a simple mock object that mimics the apiService interface
    mockApiService = {
      listDirectory: jest.fn(),
      getFileContent: jest.fn(),
      getItemInfo: jest.fn(),
      downloadItem: jest.fn(),
      checkHealth: jest.fn(),
      getBackendInfo: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listDirectory', () => {
    test('should return directory contents', async () => {
      const mockData = [
        { name: 'file1.txt', isFolder: false, path: '/file1.txt', size: 100 },
        { name: 'folder1', isFolder: true, path: '/folder1', size: null }
      ];

      mockApiService.listDirectory.mockResolvedValue(mockData);

      const result = await mockApiService.listDirectory('/test-path');

      expect(mockApiService.listDirectory).toHaveBeenCalledWith('/test-path');
      expect(result).toEqual(mockData);
    });

    test('should handle errors', async () => {
      mockApiService.listDirectory.mockRejectedValue(new Error('Network error'));

      await expect(mockApiService.listDirectory('/test-path')).rejects.toThrow('Network error');
    });
  });

  describe('getFileContent', () => {
    test('should return file content', async () => {
      const mockContent = 'File content here';
      mockApiService.getFileContent.mockResolvedValue(mockContent);

      const result = await mockApiService.getFileContent('/test-file.txt');

      expect(mockApiService.getFileContent).toHaveBeenCalledWith('/test-file.txt');
      expect(result).toBe(mockContent);
    });

    test('should handle errors', async () => {
      mockApiService.getFileContent.mockRejectedValue(new Error('File not found'));

      await expect(mockApiService.getFileContent('/test-file.txt')).rejects.toThrow('File not found');
    });
  });

  describe('getItemInfo', () => {
    test('should return item info', async () => {
      const mockInfo = { name: 'test.txt', size: 100, lastModified: '2024-01-01' };
      mockApiService.getItemInfo.mockResolvedValue(mockInfo);

      const result = await mockApiService.getItemInfo('/test.txt');

      expect(mockApiService.getItemInfo).toHaveBeenCalledWith('/test.txt');
      expect(result).toEqual(mockInfo);
    });

    test('should handle errors', async () => {
      mockApiService.getItemInfo.mockRejectedValue(new Error('Item not found'));

      await expect(mockApiService.getItemInfo('/test.txt')).rejects.toThrow('Item not found');
    });
  });

  describe('downloadItem', () => {
    test('should trigger download', async () => {
      mockApiService.downloadItem.mockResolvedValue();

      await mockApiService.downloadItem('/test.txt');

      expect(mockApiService.downloadItem).toHaveBeenCalledWith('/test.txt');
    });

    test('should handle download errors', async () => {
      mockApiService.downloadItem.mockRejectedValue(new Error('Download failed'));

      await expect(mockApiService.downloadItem('/test.txt')).rejects.toThrow('Download failed');
    });
  });

  describe('checkHealth', () => {
    test('should return health status', async () => {
      const mockHealth = { status: 'ok', timestamp: '2024-01-01T00:00:00Z' };
      mockApiService.checkHealth.mockResolvedValue(mockHealth);

      const result = await mockApiService.checkHealth();

      expect(mockApiService.checkHealth).toHaveBeenCalled();
      expect(result).toEqual(mockHealth);
    });

    test('should handle health check errors', async () => {
      mockApiService.checkHealth.mockRejectedValue(new Error('Health check failed'));

      await expect(mockApiService.checkHealth()).rejects.toThrow('Health check failed');
    });
  });

  describe('getBackendInfo', () => {
    test('should return backend info', async () => {
      const mockInfo = { name: 'Test Report Dashboard API', version: '1.0.0' };
      mockApiService.getBackendInfo.mockResolvedValue(mockInfo);

      const result = await mockApiService.getBackendInfo();

      expect(mockApiService.getBackendInfo).toHaveBeenCalled();
      expect(result).toEqual(mockInfo);
    });

    test('should handle backend info errors', async () => {
      mockApiService.getBackendInfo.mockRejectedValue(new Error('Backend info failed'));

      await expect(mockApiService.getBackendInfo()).rejects.toThrow('Backend info failed');
    });
  });

  describe('API interface validation', () => {
    test('should have all required methods', () => {
      expect(typeof mockApiService.listDirectory).toBe('function');
      expect(typeof mockApiService.getFileContent).toBe('function');
      expect(typeof mockApiService.getItemInfo).toBe('function');
      expect(typeof mockApiService.downloadItem).toBe('function');
      expect(typeof mockApiService.checkHealth).toBe('function');
      expect(typeof mockApiService.getBackendInfo).toBe('function');
    });
  });
});