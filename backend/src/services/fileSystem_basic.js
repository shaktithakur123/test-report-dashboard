const fs = require('fs').promises;
const path = require('path');

class FileSystemService {
  constructor() {
    this.dataPath = path.join(__dirname, '../../data');
    this.initializeFileSystem();
  }

  async initializeFileSystem() {
    try {
      await fs.access(this.dataPath);
    } catch (error) {
      await this.createSampleData();
    }
  }

  async createSampleData() {
    // Create sample directory structure
    const directories = [
      'test_pipeline_results',
      'test_pipeline_results/job_12345',
      'test_pipeline_results/job_12346',
      'test_pipeline_results/job_12345/unit_tests',
      'test_pipeline_results/job_12345/integration_tests'
    ];

    for (const dir of directories) {
      await fs.mkdir(path.join(this.dataPath, dir), { recursive: true });
    }

    // Create sample files
    const files = [
      {
        path: 'test_pipeline_results/job_12345/test_summary.log',
        content: 'Test Summary\n============\nTotal Tests: 150\nPassed: 145\nFailed: 5\nSkipped: 0'
      },
      {
        path: 'test_pipeline_results/job_12345/unit_tests/results.xml',
        content: '<?xml version="1.0"?>\n<testsuites>\n  <testsuite name="Unit Tests" tests="100" failures="2"/>\n</testsuites>'
      }
    ];

    for (const file of files) {
      await fs.writeFile(path.join(this.dataPath, file.path), file.content);
    }
  }

  async listDirectory(dirPath = '') {
    const fullPath = path.join(this.dataPath, dirPath);
    const items = await fs.readdir(fullPath, { withFileTypes: true });
    
    return items.map(item => ({
      name: item.name,
      isFolder: item.isDirectory(),
      path: path.join(dirPath, item.name),
      size: item.isFile() ? 0 : undefined
    }));
  }
}

module.exports = FileSystemService;
