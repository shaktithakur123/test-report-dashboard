const path = require('path');

/**
 * Validates and sanitizes file paths to prevent directory traversal attacks
 * @param {string} inputPath - The input path to validate
 * @returns {string} - The sanitized path
 * @throws {Error} - If the path is invalid or contains malicious patterns
 */
function validateAndSanitizePath(inputPath) {
  if (!inputPath || typeof inputPath !== 'string') {
    throw new Error('Invalid path parameter: must be a non-empty string');
  }

  // Remove any null bytes
  if (inputPath.includes('\0')) {
    throw new Error('Invalid path parameter: contains null bytes');
  }

  // Normalize the path to handle different separators and resolve . and ..
  let sanitized = path.posix.normalize(inputPath);

  // Remove any remaining path traversal attempts
  if (sanitized.includes('..')) {
    throw new Error('Invalid path parameter: path traversal not allowed');
  }

  // Ensure path starts with /
  if (!sanitized.startsWith('/')) {
    sanitized = '/' + sanitized;
  }

  // Remove duplicate slashes
  sanitized = sanitized.replace(/\/+/g, '/');

  // Remove trailing slash unless it's the root
  if (sanitized.length > 1 && sanitized.endsWith('/')) {
    sanitized = sanitized.slice(0, -1);
  }

  // Additional security checks
  const forbiddenPatterns = [
    /\.\./,           // Double dots
    /[<>:"|?*]/,      // Windows forbidden characters
    /[\x00-\x1f]/,    // Control characters
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i  // Windows reserved names
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(sanitized)) {
      throw new Error(`Invalid path parameter: contains forbidden pattern ${pattern}`);
    }
  }

  return sanitized;
}

/**
 * Checks if a path is within the allowed base directory
 * @param {string} inputPath - The path to check
 * @param {string} baseDir - The base directory (default: '/data')
 * @returns {boolean} - True if path is safe
 */
function isPathSafe(inputPath, baseDir = '/data') {
  try {
    const sanitized = validateAndSanitizePath(inputPath);
    const fullPath = path.posix.join(baseDir, sanitized);
    const resolved = path.posix.resolve(fullPath);
    const basePath = path.posix.resolve(baseDir);
    
    return resolved.startsWith(basePath);
  } catch (error) {
    return false;
  }
}

/**
 * Converts a virtual path to a real file system path
 * @param {string} virtualPath - The virtual path from the API
 * @param {string} baseDir - The base directory (default: '/data')
 * @returns {string} - The real file system path
 */
function virtualToRealPath(virtualPath, baseDir = '/data') {
  const sanitized = validateAndSanitizePath(virtualPath);
  
  // Remove leading slash for joining
  const relativePath = sanitized.startsWith('/') ? sanitized.slice(1) : sanitized;
  
  return path.posix.join(baseDir, relativePath);
}

/**
 * Converts a real file system path to a virtual path
 * @param {string} realPath - The real file system path
 * @param {string} baseDir - The base directory (default: '/data')
 * @returns {string} - The virtual path for the API
 */
function realToVirtualPath(realPath, baseDir = '/data') {
  const relativePath = path.posix.relative(baseDir, realPath);
  
  // Ensure it starts with /
  return '/' + relativePath;
}

/**
 * Extracts the filename from a path
 * @param {string} filePath - The file path
 * @returns {string} - The filename
 */
function getFileName(filePath) {
  return path.posix.basename(filePath);
}

/**
 * Gets the parent directory of a path
 * @param {string} filePath - The file path
 * @returns {string} - The parent directory path
 */
function getParentDir(filePath) {
  const parent = path.posix.dirname(filePath);
  return parent === '.' ? '/' : parent;
}

/**
 * Joins multiple path segments safely
 * @param {...string} segments - Path segments to join
 * @returns {string} - The joined path
 */
function safePath(...segments) {
  const joined = path.posix.join(...segments);
  return validateAndSanitizePath(joined);
}

module.exports = {
  validateAndSanitizePath,
  isPathSafe,
  virtualToRealPath,
  realToVirtualPath,
  getFileName,
  getParentDir,
  safePath
};