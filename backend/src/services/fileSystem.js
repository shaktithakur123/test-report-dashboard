const fs = require('fs-extra');
const path = require('path');
const { virtualToRealPath, realToVirtualPath, validateAndSanitizePath } = require('../utils/pathValidator');

class FileSystemService {
  constructor() {
    this.baseDir = '/tmp/test-report-data'; // Use /tmp for container compatibility
    this.initialized = false;
  }

  /**
   * Initialize the fabricated file system with sample data
   */
  async initialize() {
    if (this.initialized) {
      console.log('File system already initialized');
      return;
    }

    console.log('Creating fabricated file system...');
    
    try {
      // Ensure base directory exists
      await fs.ensureDir(this.baseDir);
      
      // Create the directory structure and files
      await this.createFabricatedData();
      
      this.initialized = true;
      console.log('Fabricated file system created successfully');
      
    } catch (error) {
      console.error('Failed to initialize file system:', error);
      throw error;
    }
  }

  /**
   * Create the fabricated directory structure and files
   */
  async createFabricatedData() {
    const structure = {
      'reports': {
        'daily': {
          '2024-01-15.html': this.generateDailyReport('2024-01-15'),
          '2024-01-16.html': this.generateDailyReport('2024-01-16'),
          '2024-01-17.html': this.generateDailyReport('2024-01-17')
        },
        'weekly': {
          'week_03_2024.pdf': 'PDF Report Content - Week 3 2024\nSummary of test results for the week...',
          'week_04_2024.pdf': 'PDF Report Content - Week 4 2024\nSummary of test results for the week...'
        },
        'monthly': {
          'january_2024_summary.md': this.generateMonthlySummary('January 2024')
        }
      },
      'configs': {
        'test_config.json': this.generateTestConfig(),
        'pipeline_settings.yml': this.generatePipelineSettings(),
        'environment_vars.env': this.generateEnvironmentVars(),
        'docker-compose.test.yml': this.generateDockerComposeTest()
      },
      'artifacts': {
        'screenshots': {
          'login_page.png': 'Binary PNG data - Login page screenshot',
          'dashboard.png': 'Binary PNG data - Dashboard screenshot',
          'error_state.png': 'Binary PNG data - Error state screenshot'
        },
        'logs': {
          'application.log': this.generateApplicationLog(),
          'error.log': this.generateErrorLog(),
          'access.log': this.generateAccessLog()
        }
      },
      'test_pipeline_results': {
        'job_12345': {
          'integration_test.log': this.generateIntegrationTestLog(),
          'unit_test.log': this.generateUnitTestLog(),
          'performance_test.log': this.generatePerformanceTestLog(),
          'build_output.txt': this.generateBuildOutput()
        },
        'job_12346': {
          'build.log': this.generateBuildLog(),
          'deployment.log': this.generateDeploymentLog(),
          'smoke_test.log': this.generateSmokeTestLog(),
          'config.json': this.generateConfigFile()
        },
        'job_12347': {
          'regression_test.log': this.generateRegressionTestLog(),
          'security_scan.log': this.generateSecurityScanLog(),
          'coverage_report.html': this.generateCoverageReport(),
          'test_results.xml': this.generateTestResultsXML()
        }
      },
    };

    await this.createStructure(this.baseDir, structure);
  }

  /**
   * Recursively create directory structure and files
   */
  async createStructure(basePath, structure) {
    for (const [name, content] of Object.entries(structure)) {
      const fullPath = path.join(basePath, name);
      
      if (typeof content === 'object' && content !== null) {
        await fs.ensureDir(fullPath);
        await this.createStructure(fullPath, content);
      } else {
        await fs.writeFile(fullPath, content, 'utf8');
      }
    }
  }

  /**
   * List directory contents
   */
  async listDirectory(virtualPath) {
    const realPath = virtualToRealPath(virtualPath, this.baseDir);
    
    try {
      const items = await fs.readdir(realPath);
      const result = [];
      
      for (const item of items) {
        const itemPath = path.join(realPath, item);
        const stats = await fs.stat(itemPath);
        const virtualItemPath = realToVirtualPath(itemPath, this.baseDir);
        
        result.push({
          name: item,
          path: virtualItemPath,
          isDirectory: stats.isDirectory(),
          size: stats.isDirectory() ? null : stats.size,
          lastModified: stats.mtime.toISOString(),
          type: this.getFileType(item, stats.isDirectory())
        });
      }
      
      // Sort: directories first, then files, both alphabetically
      result.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      
      return result;
      
    } catch (error) {
      throw new Error(`Directory not found: ${virtualPath}`);
    }
  }

  /**
   * Read file content
   */
  async readFile(virtualPath) {
    const realPath = virtualToRealPath(virtualPath, this.baseDir);
    
    try {
      const stats = await fs.stat(realPath);
      if (stats.isDirectory()) {
        throw new Error('Path is a directory, not a file');
      }
      
      return await fs.readFile(realPath, 'utf8');
      
    } catch (error) {
      throw new Error(`File not found: ${virtualPath}`);
    }
  }

  /**
   * Get item information
   */
  async getItem(virtualPath) {
    const realPath = virtualToRealPath(virtualPath, this.baseDir);
    
    try {
      const stats = await fs.stat(realPath);
      const name = path.basename(realPath);
      
      return {
        name,
        path: virtualPath,
        isDirectory: stats.isDirectory(),
        size: stats.isDirectory() ? null : stats.size,
        lastModified: stats.mtime.toISOString(),
        type: this.getFileType(name, stats.isDirectory())
      };
      
    } catch (error) {
      throw new Error(`Item not found: ${virtualPath}`);
    }
  }

  /**
   * Add directory contents to archive
   */
  async addToArchive(archive, virtualPath) {
    const realPath = virtualToRealPath(virtualPath, this.baseDir);
    
    try {
      const stats = await fs.stat(realPath);
      
      if (stats.isDirectory()) {
        archive.directory(realPath, path.basename(realPath));
      } else {
        archive.file(realPath, { name: path.basename(realPath) });
      }
      
    } catch (error) {
      throw new Error(`Failed to add to archive: ${virtualPath}`);
    }
  }

  /**
   * Determine file type based on extension
   */
  getFileType(filename, isDirectory) {
    if (isDirectory) return 'folder';
    
    const ext = path.extname(filename).toLowerCase();
    const typeMap = {
      '.log': 'log',
      '.txt': 'text',
      '.json': 'json',
      '.yml': 'yaml',
      '.yaml': 'yaml',
      '.xml': 'xml',
      '.html': 'html',
      '.md': 'markdown',
      '.pdf': 'pdf',
      '.png': 'image',
      '.jpg': 'image',
      '.jpeg': 'image',
      '.gif': 'image',
      '.env': 'config'
    };
    
    return typeMap[ext] || 'file';
  }

  // Content generators for fabricated files
  generateIntegrationTestLog() {
    return `Integration Test Log - Job 12345
========================================
Timestamp: ${new Date().toISOString()}
Test Suite: Integration Tests
Environment: staging

[10:00:01] Starting integration test suite...
[10:00:02] ✅ Database connection test - PASSED
[10:00:05] ✅ API endpoint /api/users - PASSED
[10:00:08] ✅ API endpoint /api/products - PASSED
[10:00:12] ✅ Authentication flow test - PASSED
[10:00:15] ✅ User registration test - PASSED
[10:00:18] ✅ Password reset test - PASSED
[10:00:22] ✅ File upload test - PASSED
[10:00:25] ✅ Email notification test - PASSED

Test Results:
- Total Tests: 8
- Passed: 8
- Failed: 0
- Duration: 24 seconds

All integration tests completed successfully!
`;
  }

  generateUnitTestLog() {
    return `Unit Test Log - Job 12345
===========================
Timestamp: ${new Date().toISOString()}
Test Framework: Jest
Coverage Target: 80%

Running test suites...

 PASS  src/utils/validation.test.js
 PASS  src/components/UserForm.test.js
 PASS  src/services/api.test.js
 PASS  src/hooks/useAuth.test.js
 PASS  src/utils/formatting.test.js

Test Suites: 5 passed, 5 total
Tests:       150 passed, 150 total
Snapshots:   0 total
Time:        15.234 s
Coverage:    85.4% of statements (target: 80%)

All unit tests passed with excellent coverage!
`;
  }

  generatePerformanceTestLog() {
    return `Performance Test Log - Job 12345
==================================
Timestamp: ${new Date().toISOString()}
Tool: Apache JMeter
Target: https://staging.example.com

Test Configuration:
- Virtual Users: 100
- Ramp-up Period: 60 seconds
- Test Duration: 300 seconds

Results:
┌─────────────────┬──────────┬──────────┬──────────┐
│ Endpoint        │ Avg (ms) │ 95% (ms) │ Errors   │
├─────────────────┼──────────┼──────────┼──────────┤
│ /api/login      │ 145      │ 230      │ 0.1%     │
│ /api/dashboard  │ 89       │ 156      │ 0.0%     │
│ /api/users      │ 234      │ 445      │ 0.2%     │
│ /api/reports    │ 567      │ 890      │ 0.5%     │
└─────────────────┴──────────┴──────────┴──────────┘

Warning: /api/reports endpoint exceeds 500ms target
Overall performance within acceptable limits
`;
  }

  generateBuildOutput() {
    return `Build Output - Job 12345
========================
Build #: 12345
Branch: main
Commit: a1b2c3d4e5f6
Timestamp: ${new Date().toISOString()}

[Step 1/5] Installing dependencies...
npm install completed in 45.2s

[Step 2/5] Running linter...
ESLint: 0 errors, 2 warnings
Prettier: All files formatted correctly

[Step 3/5] Running tests...
Unit tests: ✅ PASSED (150/150)
Integration tests: ✅ PASSED (8/8)

[Step 4/5] Building application...
Webpack build completed in 67.8s
Bundle size: 2.4MB (gzipped: 890KB)

[Step 5/5] Creating Docker image...
Docker image built successfully
Image size: 145MB
Tagged as: test-app:12345

Build completed successfully!
Total time: 3m 42s
`;
  }

  generateBuildLog() {
    return `Build Log - Job 12346
=====================
Started: ${new Date(Date.now() - 300000).toISOString()}
Completed: ${new Date().toISOString()}
Status: SUCCESS

> npm run build

Creating an optimized production build...
Compiled successfully in 45.67s

File sizes after gzip:
  890.12 KB  build/static/js/main.a1b2c3d4.js
  234.56 KB  build/static/css/main.e5f6g7h8.css
  45.78 KB   build/static/js/vendor.i9j0k1l2.js

The build folder is ready to be deployed.
`;
  }

  generateDeploymentLog() {
    return `Deployment Log - Job 12346
===========================
Target Environment: staging
Deployment Strategy: blue-green
Timestamp: ${new Date().toISOString()}

[12:00:01] Starting deployment process...
[12:00:02] ✅ Pre-deployment health check passed
[12:00:05] ✅ Database migration completed
[12:00:08] ✅ Static assets uploaded to CDN
[12:00:12] ✅ Application containers started
[12:00:15] ✅ Load balancer updated
[12:00:18] ✅ Post-deployment health check passed
[12:00:20] ✅ Smoke tests completed

Deployment Summary:
- Duration: 19 seconds
- Zero downtime achieved
- All health checks passed
- Rollback plan: Available

Deployment completed successfully!
Application is now live at: https://staging.example.com
`;
  }

  generateSmokeTestLog() {
    return `Smoke Test Log - Job 12346
===========================
Environment: staging
Timestamp: ${new Date().toISOString()}

Running critical path tests...

✅ Homepage loads correctly
✅ User can log in
✅ Dashboard displays data
✅ API endpoints respond
✅ Database connectivity OK
✅ External services reachable

All smoke tests passed! 
Application is ready for use.
`;
  }

  generateConfigFile() {
    return JSON.stringify({
      "environment": "staging",
      "database": {
        "host": "db.staging.example.com",
        "port": 5432,
        "name": "testapp_staging"
      },
      "api": {
        "baseUrl": "https://api.staging.example.com",
        "timeout": 30000,
        "retries": 3
      },
      "features": {
        "enableLogging": true,
        "enableMetrics": true,
        "enableDebug": false
      }
    }, null, 2);
  }

  generateRegressionTestLog() {
    return `Regression Test Log - Job 12347
=================================
Test Suite: Full Regression
Browser: Chrome 120.0
Timestamp: ${new Date().toISOString()}

Test Results:
✅ Login functionality - PASSED
✅ User registration - PASSED
❌ Password reset - FAILED (timeout after 30s)
✅ Profile update - PASSED
✅ File upload - PASSED
❌ Email notifications - FAILED (SMTP connection error)
✅ Search functionality - PASSED
✅ Data export - PASSED

Summary:
- Total: 8 tests
- Passed: 6 tests
- Failed: 2 tests
- Success Rate: 75%

2 tests failed - requires investigation
`;
  }

  generateSecurityScanLog() {
    return `Security Scan Log - Job 12347
==============================
Scanner: OWASP ZAP
Target: https://staging.example.com
Timestamp: ${new Date().toISOString()}

Scan Results:
┌──────────────────┬───────┬─────────────────────────┐
│ Severity         │ Count │ Examples                │
├──────────────────┼───────┼─────────────────────────┤
│ High             │ 0     │ -                       │
│ Medium           │ 2     │ Missing CSRF tokens     │
│ Low              │ 5     │ Missing security headers│
│ Informational    │ 12    │ Version disclosure      │
└──────────────────┴───────┴─────────────────────────┘

Recommendations:
1. Implement CSRF protection
2. Add security headers (CSP, HSTS)
3. Hide server version information

Overall Security Score: B+ (Good)
`;
  }

  generateCoverageReport() {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Code Coverage Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f0f0f0; padding: 15px; border-radius: 5px; }
        .high { color: green; }
        .medium { color: orange; }
        .low { color: red; }
    </style>
</head>
<body>
    <h1>Code Coverage Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p>Generated: ${new Date().toISOString()}</p>
        <p>Overall Coverage: <span class="high">85.4%</span></p>
        <ul>
            <li>Lines: 1,234 / 1,445 (85.4%)</li>
            <li>Functions: 156 / 178 (87.6%)</li>
            <li>Branches: 89 / 112 (79.5%)</li>
        </ul>
    </div>
    
    <h2>File Coverage</h2>
    <table border="1">
        <tr><th>File</th><th>Coverage</th></tr>
        <tr><td>src/utils/validation.js</td><td class="high">95.2%</td></tr>
        <tr><td>src/components/UserForm.js</td><td class="high">88.7%</td></tr>
        <tr><td>src/services/api.js</td><td class="medium">76.3%</td></tr>
        <tr><td>src/hooks/useAuth.js</td><td class="low">65.1%</td></tr>
    </table>
</body>
</html>`;
  }

  generateTestResultsXML() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="Test Results" tests="158" failures="2" errors="0" time="45.234">
  <testsuite name="Unit Tests" tests="150" failures="0" errors="0" time="15.234">
    <testcase name="validation.test.js" classname="utils" time="0.123"/>
    <testcase name="UserForm.test.js" classname="components" time="0.456"/>
    <testcase name="api.test.js" classname="services" time="0.789"/>
  </testsuite>
  <testsuite name="Integration Tests" tests="8" failures="2" errors="0" time="30.000">
    <testcase name="login flow" classname="integration" time="2.345"/>
    <testcase name="password reset" classname="integration" time="30.000">
      <failure message="Timeout after 30 seconds">Test timed out waiting for email</failure>
    </testcase>
    <testcase name="email notifications" classname="integration" time="5.000">
      <failure message="SMTP connection failed">Unable to connect to mail server</failure>
    </testcase>
  </testsuite>
</testsuites>`;
  }

  generateDailyReport(date) {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Daily Test Report - ${date}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #2196F3; color: white; padding: 20px; }
        .metric { display: inline-block; margin: 10px; padding: 15px; background: #f5f5f5; }
        .success { color: green; }
        .warning { color: orange; }
        .error { color: red; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Daily Test Report</h1>
        <p>Date: ${date}</p>
    </div>
    
    <h2>Test Summary</h2>
    <div class="metric">
        <h3>Total Tests</h3>
        <p class="success">158</p>
    </div>
    <div class="metric">
        <h3>Passed</h3>
        <p class="success">156</p>
    </div>
    <div class="metric">
        <h3>Failed</h3>
        <p class="error">2</p>
    </div>
    <div class="metric">
        <h3>Success Rate</h3>
        <p class="success">98.7%</p>
    </div>
    
    <h2>Build Status</h2>
    <ul>
        <li class="success">✅ Build #12345 - SUCCESS</li>
        <li class="success">✅ Build #12346 - SUCCESS</li>
        <li class="warning">⚠️ Build #12347 - UNSTABLE (2 test failures)</li>
    </ul>
</body>
</html>`;
  }

  generateMonthlySummary(month) {
    return `# Monthly Test Summary - ${month}

## Overview
This report summarizes the test activities and results for ${month}.

## Key Metrics
- **Total Builds**: 124
- **Successful Builds**: 118 (95.2%)
- **Failed Builds**: 6 (4.8%)
- **Average Build Time**: 3m 42s
- **Test Coverage**: 85.4%

## Test Results
- **Unit Tests**: 4,650 total, 4,598 passed (98.9%)
- **Integration Tests**: 248 total, 241 passed (97.2%)
- **Performance Tests**: 31 total, 29 passed (93.5%)

## Issues Identified
1. **Flaky Tests**: 3 tests showing intermittent failures
2. **Performance Degradation**: API response times increased by 15%
3. **Coverage Gaps**: 5 modules below 80% coverage threshold

## Recommendations
1. Investigate and fix flaky tests
2. Optimize database queries for better performance
3. Add tests for uncovered code paths
4. Implement automated performance monitoring

## Trends
- Build success rate improved from 92% to 95.2%
- Test execution time reduced by 8%
- Code coverage increased from 82% to 85.4%

Generated on: ${new Date().toISOString()}
`;
  }

  generateTestConfig() {
    return JSON.stringify({
      "testFramework": "jest",
      "testEnvironment": "jsdom",
      "coverageThreshold": {
        "global": {
          "branches": 80,
          "functions": 80,
          "lines": 80,
          "statements": 80
        }
      },
      "testMatch": [
        "**/__tests__/**/*.js",
        "**/?(*.)+(spec|test).js"
      ],
      "collectCoverageFrom": [
        "src/**/*.js",
        "!src/index.js",
        "!src/serviceWorker.js"
      ],
      "setupFilesAfterEnv": [
        "<rootDir>/src/setupTests.js"
      ],
      "moduleNameMapping": {
        "\\.(css|less|scss)$": "identity-obj-proxy"
      }
    }, null, 2);
  }

  generatePipelineSettings() {
    return `# Pipeline Configuration
version: '2.1'

stages:
  - build
  - test
  - security
  - deploy

variables:
  NODE_VERSION: "18"
  DOCKER_REGISTRY: "registry.example.com"
  
build:
  stage: build
  image: node:18-alpine
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

test:
  stage: test
  image: node:18-alpine
  script:
    - npm run test:unit
    - npm run test:integration
  coverage: '/Coverage: \\d+\\.\\d+%/'
  
security:
  stage: security
  image: owasp/zap2docker-stable
  script:
    - zap-baseline.py -t $TARGET_URL
  allow_failure: true

deploy:
  stage: deploy
  image: docker:latest
  script:
    - docker build -t $DOCKER_REGISTRY/app:$CI_COMMIT_SHA .
    - docker push $DOCKER_REGISTRY/app:$CI_COMMIT_SHA
  only:
    - main
`;
  }

  generateEnvironmentVars() {
    return `# Environment Variables for Testing
NODE_ENV=test
PORT=3000
DATABASE_URL=postgresql://test:test@localhost:5432/testdb
REDIS_URL=redis://localhost:6379
API_BASE_URL=https://api.staging.example.com
JWT_SECRET=test-secret-key-do-not-use-in-production
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=test@example.com
SMTP_PASS=test-password
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test-key
AWS_SECRET_ACCESS_KEY=test-secret
ENABLE_LOGGING=true
LOG_LEVEL=debug
`;
  }

  generateDockerComposeTest() {
    return `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=test
      - DATABASE_URL=postgresql://postgres:password@db:5432/testdb
    depends_on:
      - db
      - redis
    volumes:
      - ./src:/app/src
      - ./tests:/app/tests

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: testdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
`;
  }

  generateApplicationLog() {
    return `[2024-01-17 10:00:01] INFO  Application started on port 3000
[2024-01-17 10:00:02] INFO  Database connection established
[2024-01-17 10:00:03] INFO  Redis connection established
[2024-01-17 10:05:15] INFO  User login: user@example.com
[2024-01-17 10:05:16] INFO  Session created: sess_abc123
[2024-01-17 10:07:22] INFO  API request: GET /api/users
[2024-01-17 10:07:23] INFO  Database query executed in 45ms
[2024-01-17 10:12:45] WARN  Slow query detected: 2.3s
[2024-01-17 10:15:30] INFO  User logout: user@example.com
[2024-01-17 10:15:31] INFO  Session destroyed: sess_abc123
[2024-01-17 10:20:00] INFO  Health check: OK
[2024-01-17 10:25:12] INFO  Cache cleared: user_data
[2024-01-17 10:30:00] INFO  Scheduled task: cleanup_sessions
`;
  }

  generateErrorLog() {
    return `[2024-01-17 09:45:23] ERROR Database connection timeout
  at Connection.connect (/app/src/db.js:45:12)
  at async connectToDatabase (/app/src/db.js:23:5)
  Stack trace: ...

[2024-01-17 11:23:45] ERROR Unhandled promise rejection
  TypeError: Cannot read property 'id' of undefined
  at UserService.getUser (/app/src/services/user.js:67:23)
  at async /app/src/routes/api.js:45:18

[2024-01-17 14:56:12] ERROR SMTP connection failed
  Error: connect ECONNREFUSED 127.0.0.1:587
  at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1141:16)

[2024-01-17 16:34:28] ERROR Rate limit exceeded for IP: 192.168.1.100
  Request: POST /api/login
  Attempts: 15 in 5 minutes
`;
  }

  generateAccessLog() {
    return `192.168.1.100 - - [17/Jan/2024:10:05:15 +0000] "POST /api/login" 200 1234 "-" "Mozilla/5.0"
192.168.1.100 - - [17/Jan/2024:10:05:16 +0000] "GET /api/dashboard" 200 5678 "-" "Mozilla/5.0"
192.168.1.101 - - [17/Jan/2024:10:07:22 +0000] "GET /api/users" 200 2345 "-" "Mozilla/5.0"
192.168.1.102 - - [17/Jan/2024:10:12:45 +0000] "POST /api/upload" 413 0 "-" "Mozilla/5.0"
192.168.1.100 - - [17/Jan/2024:10:15:30 +0000] "POST /api/logout" 200 123 "-" "Mozilla/5.0"
192.168.1.103 - - [17/Jan/2024:10:20:00 +0000] "GET /health" 200 45 "-" "HealthChecker/1.0"
192.168.1.104 - - [17/Jan/2024:10:25:12 +0000] "GET /api/reports" 500 234 "-" "Mozilla/5.0"
192.168.1.100 - - [17/Jan/2024:10:30:00 +0000] "GET /api/profile" 200 1567 "-" "Mozilla/5.0"
`;
  }
}

module.exports = FileSystemService;