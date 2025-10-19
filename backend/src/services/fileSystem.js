const fs = require('fs').promises;
const path = require('path');

class FileSystemService {
  constructor() {
    this.dataPath = path.join(__dirname, '../../data');
  }

  async listDirectory(dirPath = '') {
    const fullPath = path.join(this.dataPath, dirPath);
    const items = await fs.readdir(fullPath, { withFileTypes: true });
    
    return items.map(item => ({
      name: item.name,
      isFolder: item.isDirectory(),
      path: path.join(dirPath, item.name)
    }));
  }
}

module.exports = FileSystemService;
