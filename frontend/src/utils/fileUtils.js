/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes < 0) {
    return 'NaN undefined';
  }
  
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  if (i >= sizes.length) {
    return Math.floor(bytes / Math.pow(k, sizes.length - 1)) + ' ' + sizes[sizes.length - 1];
  }
  
  const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return formattedSize + ' ' + sizes[i];
};

/**
 * Format date in human readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // If less than 24 hours ago, show relative time
  if (diffDays <= 1) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffHours < 1) {
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
    }
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }
  
  // If less than 7 days ago, show days
  if (diffDays < 7) {
    return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
  }
  
  // Otherwise show formatted date
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get file icon based on file type
 * @param {string} filename - File name
 * @param {boolean} isFolder - Whether item is a folder
 * @param {string} type - File type from backend
 * @returns {string} Emoji icon
 */
export const getFileIcon = (filename, isFolder, type) => {
  if (isFolder) {
    return '📁';
  }else{
    return '📄'
  }
  }

/**
 * Get file type category
 * @param {string} filename - File name
 * @returns {string} File category
 */
export const getFileCategory = (filename) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  const categories = {
    code: ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'scss', 'sass', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs'],
    document: ['txt', 'md', 'pdf', 'doc', 'docx', 'rtf'],
    data: ['json', 'xml', 'yml', 'yaml', 'csv', 'sql'],
    config: ['env', 'config', 'conf', 'ini', 'toml'],
    log: ['log', 'out', 'err'],
    image: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp', 'webp', 'ico'],
    archive: ['zip', 'tar', 'gz', 'rar', '7z'],
    media: ['mp3', 'wav', 'flac', 'mp4', 'avi', 'mov', 'mkv']
  };
  
  for (const [category, extensions] of Object.entries(categories)) {
    if (extensions.includes(extension)) {
      return category;
    }
  }
  
  return 'other';
};

/**
 * Check if file is viewable in browser
 * @param {string} filename - File name
 * @returns {boolean} Whether file can be viewed
 */
export const isViewableFile = (filename) => {
  const viewableExtensions = [
    'txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'jsx', 'ts', 'tsx',
    'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs', 'yml', 'yaml',
    'log', 'env', 'config', 'conf', 'ini', 'sql', 'csv'
  ];
  
  const extension = filename.split('.').pop()?.toLowerCase();
  return viewableExtensions.includes(extension);
};

/**
 * Get syntax highlighting language for code files
 * @param {string} filename - File name
 * @returns {string} Language identifier for syntax highlighting
 */
export const getSyntaxLanguage = (filename) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  const languageMap = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'php': 'php',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'json': 'json',
    'xml': 'xml',
    'yml': 'yaml',
    'yaml': 'yaml',
    'md': 'markdown',
    'sql': 'sql',
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    'ps1': 'powershell',
    'dockerfile': 'dockerfile'
  };
  
  return languageMap[extension] || 'text';
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(String(text));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};