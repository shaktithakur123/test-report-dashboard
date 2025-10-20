const FileSystemService = require('../src/services/fileSystem');

describe('FileSystemService', () => {
  let fileSystemService;

  beforeEach(() => {
    // Create a fresh instance for each test
    fileSystemService = new FileSystemService();
  });

  describe('Constructor and Basic Methods', () => {
    test('should create FileSystemService instance', () => {
      expect(fileSystemService).toBeInstanceOf(FileSystemService);
      expect(fileSystemService.initialized).toBe(false);
      expect(fileSystemService.baseDir).toBe('/tmp/test-report-data');
    });

    test('should have required methods', () => {
      expect(typeof fileSystemService.initialize).toBe('function');
      expect(typeof fileSystemService.listDirectory).toBe('function');
      expect(typeof fileSystemService.readFile).toBe('function');
      expect(typeof fileSystemService.getItem).toBe('function');
      expect(typeof fileSystemService.getFileType).toBe('function');
      expect(typeof fileSystemService.addToArchive).toBe('function');
    });
  });

  describe('initialize', () => {
    test('should mark service as initialized', async () => {
      await fileSystemService.initialize();
      expect(fileSystemService.initialized).toBe(true);
    });

    test('should not reinitialize if already initialized', async () => {
      await fileSystemService.initialize();
      const firstInitTime = fileSystemService.initialized;

      await fileSystemService.initialize();
      expect(fileSystemService.initialized).toBe(firstInitTime);
    });
  });

  describe('getFileType', () => {
    test('should return correct file types based on actual implementation', () => {
      // Test the actual file type mappings from the implementation
      expect(fileSystemService.getFileType('test.log', false)).toBe('log');
      expect(fileSystemService.getFileType('config.json', false)).toBe('json');
      expect(fileSystemService.getFileType('report.html', false)).toBe('html');
      expect(fileSystemService.getFileType('data.xml', false)).toBe('xml');
      expect(fileSystemService.getFileType('readme.md', false)).toBe('markdown');
      expect(fileSystemService.getFileType('settings.yml', false)).toBe('yaml');
      expect(fileSystemService.getFileType('settings.yaml', false)).toBe('yaml');
      expect(fileSystemService.getFileType('image.png', false)).toBe('image');
      expect(fileSystemService.getFileType('image.jpg', false)).toBe('image');
      expect(fileSystemService.getFileType('image.jpeg', false)).toBe('image');
      expect(fileSystemService.getFileType('image.gif', false)).toBe('image');
      expect(fileSystemService.getFileType('config.env', false)).toBe('config');
      expect(fileSystemService.getFileType('document.pdf', false)).toBe('pdf');
      expect(fileSystemService.getFileType('readme.txt', false)).toBe('text');
      
      // Files not in the type map should return 'file'
      expect(fileSystemService.getFileType('script.js', false)).toBe('file');
      expect(fileSystemService.getFileType('style.css', false)).toBe('file');
      expect(fileSystemService.getFileType('data.csv', false)).toBe('file');
      expect(fileSystemService.getFileType('unknown.xyz', false)).toBe('file');
    });

    test('should return folder type for directories', () => {
      expect(fileSystemService.getFileType('any-name', true)).toBe('folder');
      expect(fileSystemService.getFileType('test.log', true)).toBe('folder');
    });

    test('should handle edge cases', () => {
      expect(fileSystemService.getFileType('', false)).toBe('file');
      expect(() => fileSystemService.getFileType(null, false)).toThrow();
      expect(() => fileSystemService.getFileType(undefined, false)).toThrow();
    });

    test('should handle files without extensions', () => {
      expect(fileSystemService.getFileType('README', false)).toBe('file');
      expect(fileSystemService.getFileType('Dockerfile', false)).toBe('file');
    });

    test('should handle case sensitivity', () => {
      expect(fileSystemService.getFileType('TEST.LOG', false)).toBe('log');
      expect(fileSystemService.getFileType('CONFIG.JSON', false)).toBe('json');
      expect(fileSystemService.getFileType('IMAGE.PNG', false)).toBe('image');
    });
  });

  describe('Content Generators', () => {
    test('should generate integration test log with correct format', () => {
      const content = fileSystemService.generateIntegrationTestLog();

      expect(typeof content).toBe('string');
      expect(content).toContain('Integration Test Log - Job 12345');
      expect(content).toContain('Test Results:');
      expect(content).toContain('Total Tests: 8');
      expect(content).toContain('Passed: 8');
      expect(content).toContain('Failed: 0');
      expect(content).toContain('Duration: 24 seconds');
    });

    test('should generate unit test log with correct format', () => {
      const content = fileSystemService.generateUnitTestLog();

      expect(typeof content).toBe('string');
      expect(content).toContain('Unit Test Log - Job 12345');
      expect(content).toContain('Jest');
      expect(content).toContain('Coverage Target: 80%');
      expect(content).toContain('Tests:       150 passed');
      expect(content).toContain('Test Suites: 5 passed');
    });

    test('should generate performance test log', () => {
      const content = fileSystemService.generatePerformanceTestLog();

      expect(typeof content).toBe('string');
      expect(content).toContain('Performance Test Log - Job 12345');
      expect(content).toContain('Apache JMeter');
      expect(content).toContain('Virtual Users: 100');
    });

    test('should generate build output', () => {
      const content = fileSystemService.generateBuildOutput();

      expect(typeof content).toBe('string');
      expect(content).toContain('Build Output - Job 12345');
      expect(content).toContain('Build completed successfully!');
    });

    test('should generate build log', () => {
      const content = fileSystemService.generateBuildLog();

      expect(typeof content).toBe('string');
      expect(content).toContain('Build Log - Job 12346');
      expect(content).toContain('SUCCESS');
      expect(content).toContain('Compiled successfully');
    });

    test('should generate deployment log', () => {
      const content = fileSystemService.generateDeploymentLog();

      expect(typeof content).toBe('string');
      expect(content).toContain('Deployment Log - Job 12346');
      expect(content).toContain('Deployment completed successfully!');
      // The actual content doesn't contain "DEPLOYED", it contains "Deployment completed successfully!"
    });

    test('should generate smoke test log', () => {
      const content = fileSystemService.generateSmokeTestLog();

      expect(typeof content).toBe('string');
      expect(content).toContain('Smoke Test Log - Job 12346');
      expect(content).toContain('All smoke tests passed!');
    });

    test('should generate config file', () => {
      const content = fileSystemService.generateConfigFile();

      expect(typeof content).toBe('string');
      expect(() => JSON.parse(content)).not.toThrow();
      
      const config = JSON.parse(content);
      expect(config).toHaveProperty('environment', 'staging');
      expect(config).toHaveProperty('database');
      expect(config).toHaveProperty('api');
    });

    test('should generate regression test log', () => {
      const content = fileSystemService.generateRegressionTestLog();

      expect(typeof content).toBe('string');
      expect(content).toContain('Regression Test Log - Job 12347');
      expect(content).toContain('Success Rate: 75%');
    });

    test('should generate security scan log', () => {
      const content = fileSystemService.generateSecurityScanLog();

      expect(typeof content).toBe('string');
      expect(content).toContain('Security Scan Log - Job 12347');
      expect(content).toContain('OWASP ZAP');
      expect(content).toContain('Overall Security Score: B+');
    });

    test('should generate coverage report', () => {
      const content = fileSystemService.generateCoverageReport();

      expect(typeof content).toBe('string');
      expect(content).toContain('<!DOCTYPE html>');
      expect(content).toContain('Code Coverage Report');
      expect(content).toContain('Overall Coverage');
    });

    test('should generate test results XML', () => {
      const content = fileSystemService.generateTestResultsXML();

      expect(typeof content).toBe('string');
      expect(content).toContain('<?xml version="1.0"');
      expect(content).toContain('<testsuites');
      expect(content).toContain('</testsuites>');
    });

    test('should generate valid JSON test config', () => {
      const content = fileSystemService.generateTestConfig();

      expect(typeof content).toBe('string');
      expect(() => JSON.parse(content)).not.toThrow();
      
      const config = JSON.parse(content);
      expect(config).toHaveProperty('testFramework', 'jest');
      expect(config).toHaveProperty('coverageThreshold');
      expect(config.coverageThreshold.global.lines).toBe(80);
      expect(config.coverageThreshold.global.functions).toBe(80);
      expect(config.coverageThreshold.global.branches).toBe(80);
      expect(config.coverageThreshold.global.statements).toBe(80);
    });

    test('should generate pipeline settings', () => {
      const content = fileSystemService.generatePipelineSettings();

      expect(typeof content).toBe('string');
      expect(content).toContain('Pipeline Configuration');
      expect(content).toContain('stages:');
      expect(content).toContain('- build');
    });

    test('should generate environment vars', () => {
      const content = fileSystemService.generateEnvironmentVars();

      expect(typeof content).toBe('string');
      expect(content).toContain('NODE_ENV=test');
      expect(content).toContain('DATABASE_URL=');
    });

    test('should generate docker compose test', () => {
      const content = fileSystemService.generateDockerComposeTest();

      expect(typeof content).toBe('string');
      expect(content).toContain("version: '3.8'");
      expect(content).toContain('services:');
      expect(content).toContain('app:');
    });

    test('should generate application log', () => {
      const content = fileSystemService.generateApplicationLog();

      expect(typeof content).toBe('string');
      expect(content).toContain('Application started on port 3000');
      expect(content).toContain('INFO');
    });

    test('should generate error log with correct format', () => {
      const content = fileSystemService.generateErrorLog();

      expect(typeof content).toBe('string');
      expect(content).toContain('ERROR');
      expect(content).toContain('Database connection timeout');
      expect(content).toContain('SMTP connection failed');
      expect(content).toContain('Rate limit exceeded');
      // The actual content doesn't have "Error Log" as a title, just error entries
    });

    test('should generate access log', () => {
      const content = fileSystemService.generateAccessLog();

      expect(typeof content).toBe('string');
      expect(content).toContain('192.168.1.100');
      expect(content).toContain('POST /api/login');
      expect(content).toContain('Mozilla/5.0');
    });

    test('should generate valid HTML daily report', () => {
      const content = fileSystemService.generateDailyReport('2024-01-15');

      expect(typeof content).toBe('string');
      expect(content).toContain('<!DOCTYPE html>');
      expect(content).toContain('<title>Daily Test Report - 2024-01-15</title>');
      expect(content).toContain('Total Tests');
      expect(content).toContain('Success Rate');
      expect(content).toContain('</html>');
    });

    test('should generate HTML report with different dates', () => {
      const content1 = fileSystemService.generateDailyReport('2024-01-01');
      const content2 = fileSystemService.generateDailyReport('2024-12-31');

      expect(content1).toContain('2024-01-01');
      expect(content2).toContain('2024-12-31');
      expect(content1).not.toContain('2024-12-31');
      expect(content2).not.toContain('2024-01-01');
    });

    test('should generate monthly summary', () => {
      const content = fileSystemService.generateMonthlySummary('January 2024');

      expect(typeof content).toBe('string');
      expect(content).toContain('# Monthly Test Summary - January 2024');
      expect(content).toContain('## Overview');
      expect(content).toContain('Total Builds');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid file types gracefully', () => {
      expect(fileSystemService.getFileType('', false)).toBe('file');
      expect(() => fileSystemService.getFileType(null, false)).toThrow();
      expect(() => fileSystemService.getFileType(undefined, false)).toThrow();
    });

    test('should handle directory flag correctly', () => {
      expect(fileSystemService.getFileType('test.log', true)).toBe('folder');
      expect(fileSystemService.getFileType('test.log', false)).toBe('log');
    });

    test('should handle content generation errors gracefully', () => {
      // Test that content generators don't throw errors
      expect(() => fileSystemService.generateIntegrationTestLog()).not.toThrow();
      expect(() => fileSystemService.generateUnitTestLog()).not.toThrow();
      expect(() => fileSystemService.generateTestConfig()).not.toThrow();
      expect(() => fileSystemService.generateDailyReport('2024-01-01')).not.toThrow();
      expect(() => fileSystemService.generateErrorLog()).not.toThrow();
    });
  });

  describe('Service Properties', () => {
    test('should have baseDir property', () => {
      expect(fileSystemService).toHaveProperty('baseDir');
      expect(fileSystemService.baseDir).toBe('/tmp/test-report-data');
    });

    test('should have initialized property', () => {
      expect(fileSystemService).toHaveProperty('initialized');
      expect(fileSystemService.initialized).toBe(false);
    });

    test('should allow setting baseDir', () => {
      const customDir = '/custom/test/dir';
      fileSystemService.baseDir = customDir;
      expect(fileSystemService.baseDir).toBe(customDir);
    });
  });

  describe('Content Generation Variations', () => {
    test('should generate different content for different dates', () => {
      const report1 = fileSystemService.generateDailyReport('2024-01-01');
      const report2 = fileSystemService.generateDailyReport('2024-12-31');
      
      expect(report1).not.toBe(report2);
      expect(report1).toContain('2024-01-01');
      expect(report2).toContain('2024-12-31');
    });

    test('should generate consistent content for same parameters', () => {
      const report1 = fileSystemService.generateDailyReport('2024-01-15');
      const report2 = fileSystemService.generateDailyReport('2024-01-15');
      
      expect(report1).toBe(report2);
    });

    test('should generate different monthly summaries', () => {
      const summary1 = fileSystemService.generateMonthlySummary('January 2024');
      const summary2 = fileSystemService.generateMonthlySummary('February 2024');
      
      expect(summary1).not.toBe(summary2);
      expect(summary1).toContain('January 2024');
      expect(summary2).toContain('February 2024');
    });
  });
});