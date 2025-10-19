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
    const directories = [
      'test_pipeline_results',
      'test_pipeline_results/job_12345',
      'test_pipeline_results/job_12345/unit_tests'
    ];

    for (const dir of directories) {
      await fs.mkdir(path.join(this.dataPath, dir), { recursive: true });
    }

    const files = [
      {
        path: 'test_pipeline_results/job_12345/test_summary.log',
        content: 'Test Summary\n============\nTotal Tests: 150\nPassed: 145\nFailed: 5'
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

  async getFileContent(filePath) {
    const fullPath = path.join(this.dataPath, filePath);
    return await fs.readFile(fullPath, 'utf8');
  }
}

module.exports = FileSystemService;
