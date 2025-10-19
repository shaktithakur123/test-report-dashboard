const express = require('express');
const FileSystemService = require('../services/fileSystem_basic');

const router = express.Router();
const fileService = new FileSystemService();

// List directory contents
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

module.exports = router;
