const request = require('supertest');
const express = require('express');
const apiRoutes = require('../src/routes/api');

// Mock the FileSystemService
jest.mock('../src/services/fileSystem');

describe('API Routes', () => {
  let app;
  let mockFileSystemService;

  beforeAll(() => {
    // Create Express app
    app = express();
    app.use(express.json());
    
    // Create mock FileSystemService instance
    mockFileSystemService = {
      listDirectory: jest.fn(),
      readFile: jest.fn(),
      getItem: jest.fn(),
      addToArchive: jest.fn(),
      initialize: jest.fn()
    };
    
    // Properly inject the mock service into app.locals
    app.locals.fileSystemService = mockFileSystemService;
    
    // Add health endpoint before API routes
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'Test Report Dashboard API'
      });
    });
    
    // Use the API routes
    app.use('/api', apiRoutes);
    
    // Add general info endpoint AFTER API routes to avoid conflict
    app.get('/api/about', (req, res) => {
      res.json({
        name: 'Test Report Dashboard API',
        version: '1.0.0',
        description: 'Backend API for Test Report Dashboard'
      });
    });
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'Test Report Dashboard API');
    });
  });

  describe('GET /api/about', () => {
    test('should return API information', async () => {
      const response = await request(app)
        .get('/api/about')
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Test Report Dashboard API');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('description');
    });
  });

  describe('GET /api/list', () => {
    test('should return directory listing for root path', async () => {
      const mockItems = [
        {
          name: 'reports',
          path: '/reports',
          isDirectory: true,
          size: null,
          lastModified: '2024-01-17T10:00:00.000Z',
          type: 'folder'
        },
        {
          name: 'test.log',
          path: '/test.log',
          isDirectory: false,
          size: 1234,
          lastModified: '2024-01-17T10:00:00.000Z',
          type: 'log'
        }
      ];

      mockFileSystemService.listDirectory.mockResolvedValue(mockItems);

      const response = await request(app)
        .get('/api/list')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        isFolder: true,
        name: 'reports',
        path: '/reports',
        size: null,
        type: 'folder'
      });
      expect(response.body[1]).toMatchObject({
        isFolder: false,
        name: 'test.log',
        path: '/test.log',
        size: 1234,
        type: 'log'
      });

      expect(mockFileSystemService.listDirectory).toHaveBeenCalledWith('/');
    });

    test('should handle directory not found error', async () => {
      mockFileSystemService.listDirectory.mockRejectedValue(new Error('Directory not found'));

      const response = await request(app)
        .get('/api/list?path=/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('path', '/non-existent');
    });
  });

  describe('GET /api/file', () => {
    test('should return file content', async () => {
      const mockContent = 'Test file content\nLine 2\nLine 3';
      mockFileSystemService.readFile.mockResolvedValue(mockContent);

      const response = await request(app)
        .get('/api/file?path=/test.log')
        .expect(200);

      expect(response.text).toBe(mockContent);
      expect(response.headers['content-type']).toContain('text/plain');
      expect(mockFileSystemService.readFile).toHaveBeenCalledWith('/test.log');
    });

    test('should return 400 when path parameter is missing', async () => {
      const response = await request(app)
        .get('/api/file')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Path parameter is required');
    });

    test('should handle file not found error', async () => {
      mockFileSystemService.readFile.mockRejectedValue(new Error('File not found'));

      const response = await request(app)
        .get('/api/file?path=/non-existent.log')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('path', '/non-existent.log');
    });
  });

  describe('GET /api/info (item info)', () => {
    test('should return item information', async () => {
      const mockItem = {
        name: 'test.log',
        path: '/test.log',
        isDirectory: false,
        size: 1234,
        lastModified: '2024-01-17T10:00:00.000Z',
        type: 'log'
      };

      mockFileSystemService.getItem.mockResolvedValue(mockItem);

      const response = await request(app)
        .get('/api/info?path=/test.log')
        .expect(200);

      expect(response.body).toMatchObject({
        name: 'test.log',
        path: '/test.log',
        isDirectory: false,
        size: 1234,
        type: 'log',
        parent: '/'
      });

      expect(mockFileSystemService.getItem).toHaveBeenCalledWith('/test.log');
    });

    test('should return 400 when path parameter is missing for item info', async () => {
      const response = await request(app)
        .get('/api/info')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Path parameter is required');
    });
  });

  describe('Error handling', () => {
    test('should handle unexpected errors gracefully', async () => {
      mockFileSystemService.listDirectory.mockRejectedValue(new Error('Unexpected error'));

      const response = await request(app)
        .get('/api/list?path=/test')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Path validation integration', () => {
    test('should handle paths with special characters', async () => {
      mockFileSystemService.listDirectory.mockResolvedValue([]);

      await request(app)
        .get('/api/list?path=/test%20folder')
        .expect(200);

      // The path should be decoded and sanitized
      expect(mockFileSystemService.listDirectory).toHaveBeenCalledWith('/test folder');
    });
  });
});