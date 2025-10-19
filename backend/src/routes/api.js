const express = require('express');
const FileSystemService = require('../services/fileSystem');

const router = express.Router();
const fileService = new FileSystemService();

router.get('/list', async (req, res) => {
  try {
    const { path: dirPath = '' } = req.query;
    const items = await fileService.listDirectory(dirPath);
    res.json(items);
  } catch (error) {
    console.error('Error listing directory:', error);
    res.status(500).json({ error: 'Failed to list directory contents' });
  }
});

router.get('/file', async (req, res) => {
  try {
    const { path: filePath } = req.query;
    const content = await fileService.getFileContent(filePath);
    res.json({ content });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Failed to read file content' });
  }
});

module.exports = router;
