const express = require('express');
const path = require('path');
const archiver = require('archiver');
const { validateAndSanitizePath } = require('../utils/pathValidator');

const router = express.Router();

// GET /api/list - List directory contents
router.get('/list', async (req, res) => {
  try {
    const requestedPath = req.query.path || '/';
    const sanitizedPath = validateAndSanitizePath(requestedPath);
    const fileSystemService = req.app.locals.fileSystemService;
    
    console.log(`Listing directory: ${sanitizedPath}`);
    
    const items = await fileSystemService.listDirectory(sanitizedPath);
    
    const response = items.map(item => ({
      isFolder: item.isDirectory,
      name: item.name,
      path: item.path,
      size: item.isDirectory ? null : item.size,
      lastModified: item.lastModified,
      type: item.type
    }));
    
    console.log(`Found ${response.length} items in ${sanitizedPath}`);
    res.json(response);
    
  } catch (error) {
    console.error('Error listing directory:', error.message);
    res.status(404).json({ 
      error: 'Directory not found',
      path: req.query.path,
      message: error.message
    });
  }
});

// GET /api/file - Get file content
router.get('/file', async (req, res) => {
  try {
    const filePath = req.query.path;
    if (!filePath) {
      return res.status(400).json({ error: 'Path parameter is required' });
    }
    
    const sanitizedPath = validateAndSanitizePath(filePath);
    const fileSystemService = req.app.locals.fileSystemService;
    
    console.log(`Reading file: ${sanitizedPath}`);
    
    const content = await fileSystemService.readFile(sanitizedPath);
    
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(content);
    
  } catch (error) {
    console.error('Error reading file:', error.message);
    res.status(404).json({ 
      error: 'File not found',
      path: req.query.path,
      message: error.message
    });
  }
});

// GET /api/download - Download file or folder
router.get('/download', async (req, res) => {
  try {
    const itemPath = req.query.path;
    if (!itemPath) {
      return res.status(400).json({ error: 'Path parameter is required' });
    }
    
    const sanitizedPath = validateAndSanitizePath(itemPath);
    const fileSystemService = req.app.locals.fileSystemService;
    
    console.log(`Download request for: ${sanitizedPath}`);
    
    const item = await fileSystemService.getItem(sanitizedPath);
    
    if (item.isDirectory) {
      // Create and stream archive for directory
      const archiveName = `${item.name}.tar.gz`;
      
      res.setHeader('Content-Type', 'application/gzip');
      res.setHeader('Content-Disposition', `attachment; filename="${archiveName}"`);
      
      const archive = archiver('tar', {
        gzip: true,
        gzipOptions: {
          level: 1,
          chunkSize: 1024,
          windowBits: 15,
          level: 9,
          memLevel: 8
        }
      });
      
      archive.on('error', (err) => {
        console.error('Archive error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to create archive' });
        }
      });
      
      archive.on('end', () => {
        console.log(`Archive created successfully: ${archiveName}`);
      });
      
      archive.pipe(res);
      
      // Add directory contents to archive
      await fileSystemService.addToArchive(archive, sanitizedPath);
      
      await archive.finalize();
      
    } else {
      // Download single file
      const content = await fileSystemService.readFile(sanitizedPath);
      const fileName = path.basename(sanitizedPath);
      
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', Buffer.byteLength(content, 'utf8'));
      
      res.send(content);
      console.log(`File downloaded: ${fileName}`);
    }
    
  } catch (error) {
    console.error('Error downloading item:', error.message);
    if (!res.headersSent) {
      res.status(404).json({ 
        error: 'Item not found',
        path: req.query.path,
        message: error.message
      });
    }
  }
});

// GET /api/info - Get item information
router.get('/info', async (req, res) => {
  try {
    const itemPath = req.query.path;
    if (!itemPath) {
      return res.status(400).json({ error: 'Path parameter is required' });
    }
    
    const sanitizedPath = validateAndSanitizePath(itemPath);
    const fileSystemService = req.app.locals.fileSystemService;
    
    const item = await fileSystemService.getItem(sanitizedPath);
    
    res.json({
      name: item.name,
      path: item.path,
      isDirectory: item.isDirectory,
      size: item.size,
      lastModified: item.lastModified,
      type: item.type,
      parent: path.dirname(item.path)
    });
    
  } catch (error) {
    console.error('Error getting item info:', error.message);
    res.status(404).json({ 
      error: 'Item not found',
      path: req.query.path,
      message: error.message
    });
  }
});

module.exports = router;