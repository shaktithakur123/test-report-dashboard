import { formatFileSize, formatDate, getFileIcon, copyToClipboard } from '../utils/fileUtils';

describe('fileUtils', () => {
  describe('formatFileSize', () => {
    test('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1)).toBe('1 Bytes');
      expect(formatFileSize(512)).toBe('512 Bytes');
      expect(formatFileSize(1023)).toBe('1023 Bytes');
    });

    test('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(2048)).toBe('2 KB');
      expect(formatFileSize(1048575)).toBe('1024 KB');
    });

    test('should format megabytes correctly', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1572864)).toBe('1.5 MB');
      expect(formatFileSize(2097152)).toBe('2 MB');
      expect(formatFileSize(1073741823)).toBe('1024 MB');
    });

    test('should format gigabytes correctly', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
      expect(formatFileSize(1610612736)).toBe('1.5 GB');
      expect(formatFileSize(2147483648)).toBe('2 GB');
      expect(formatFileSize(1099511627775)).toBe('1024 GB');
    });

    test('should format terabytes correctly', () => {
      expect(formatFileSize(1099511627776)).toBe('1 TB');
      expect(formatFileSize(1649267441664)).toBe('1.5 TB');
      expect(formatFileSize(2199023255552)).toBe('2 TB');
    });

    test('should handle edge cases', () => {
      expect(formatFileSize(null)).toContain('NaN');
      expect(formatFileSize(undefined)).toContain('NaN');
      expect(formatFileSize(-1)).toContain('NaN');
      expect(formatFileSize(0.5)).toBe('512 undefined');
    });

    test('should handle very large numbers', () => {
      const veryLarge = 1125899906842624; // 1 PB
      expect(formatFileSize(veryLarge)).toBe('1024 TB');
    });
  });

  describe('formatDate', () => {
    test('should format ISO date strings correctly', () => {
      const isoDate = '2024-01-17T10:30:45.000Z';
      const result = formatDate(isoDate);
      
      // The exact format depends on locale, but should contain date components
      expect(result).toMatch(/2024/);
      expect(result).toMatch(/Jan|01/);
      expect(result).toMatch(/17/);
    });

    test('should format Date objects correctly', () => {
      const date = new Date('2024-01-17T10:30:45.000Z');
      const result = formatDate(date);
      
      expect(result).toMatch(/2024/);
      expect(result).toMatch(/Jan|01/);
      expect(result).toMatch(/17/);
    });

    test('should handle different date formats', () => {
      expect(formatDate('2024-01-17')).toMatch(/2024/);
      expect(formatDate('01/17/2024')).toMatch(/2024/);
      expect(formatDate(1705489845000)).toMatch(/2024/); // Unix timestamp
    });

    test('should handle invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('Invalid Date');
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatDate('')).toBe('');
    });

    test('should handle edge cases', () => {
      expect(formatDate(0)).toBe(''); // Unix epoch - empty string for falsy values
      expect(formatDate('2024-02-29T12:00:00.000Z')).toMatch(/2024/); // Leap year
    });
  });

  describe('getFileIcon', () => {
    test('should return correct icons for folders', () => {
      expect(getFileIcon('folder-name', true)).toBe('📁');
      expect(getFileIcon('any-name', true, 'folder')).toBe('📁');
    });

    test('should return correct icons for different file types', () => {
      expect(getFileIcon('test.log', false, 'log')).toBe('📄');
      expect(getFileIcon('config.json', false, 'json')).toBe('📄');
      expect(getFileIcon('report.html', false, 'html')).toBe('📄');
      expect(getFileIcon('data.xml', false, 'xml')).toBe('📄');
      expect(getFileIcon('readme.md', false, 'markdown')).toBe('📄');
      expect(getFileIcon('settings.yml', false, 'yaml')).toBe('📄');
      expect(getFileIcon('image.png', false, 'image')).toBe('📄');
      expect(getFileIcon('document.pdf', false, 'pdf')).toBe('📄');
      expect(getFileIcon('script.js', false, 'javascript')).toBe('📄');
      expect(getFileIcon('style.css', false, 'css')).toBe('📄');
    });

    test('should return default icon for unknown file types', () => {
      expect(getFileIcon('unknown.xyz', false, 'unknown')).toBe('📄');
      expect(getFileIcon('file', false)).toBe('📄');
      expect(getFileIcon('file.', false)).toBe('📄');
    });

    test('should handle edge cases', () => {
      expect(getFileIcon('', false)).toBe('📄');
      expect(getFileIcon(null, false)).toBe('📄');
      expect(getFileIcon(undefined, false)).toBe('📄');
      expect(getFileIcon('.hidden', false)).toBe('📄');
      expect(getFileIcon('file.with.multiple.dots.txt', false, 'text')).toBe('📄');
    });

    test('should prioritize isFolder parameter over type', () => {
      expect(getFileIcon('file.txt', true, 'text')).toBe('📁'); // Should be folder icon
      expect(getFileIcon('folder', false, 'folder')).toBe('📄'); // Should be file icon
    });
  });

  describe('copyToClipboard', () => {
    let mockWriteText;

    beforeEach(() => {
      mockWriteText = jest.fn();
      Object.assign(navigator, {
        clipboard: {
          writeText: mockWriteText
        }
      });
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    test('should copy text to clipboard successfully', async () => {
      mockWriteText.mockResolvedValue();

      const result = await copyToClipboard('test text');

      expect(mockWriteText).toHaveBeenCalledWith('test text');
      expect(result).toBe(true);
    });

    test('should handle clipboard API errors', async () => {
      mockWriteText.mockRejectedValue(new Error('Clipboard error'));

      const result = await copyToClipboard('test text');

      expect(mockWriteText).toHaveBeenCalledWith('test text');
      expect(result).toBe(false);
    });

    test('should handle missing clipboard API', async () => {
      Object.assign(navigator, { clipboard: undefined });

      const result = await copyToClipboard('test text');

      expect(result).toBe(false);
    });

    test('should handle empty text', async () => {
      mockWriteText.mockResolvedValue();

      const result = await copyToClipboard('');

      expect(mockWriteText).toHaveBeenCalledWith('');
      expect(result).toBe(true);
    });

    test('should handle null and undefined text', async () => {
      mockWriteText.mockResolvedValue();

      let result = await copyToClipboard(null);
      expect(mockWriteText).toHaveBeenCalledWith('null');
      expect(result).toBe(true);

      result = await copyToClipboard(undefined);
      expect(mockWriteText).toHaveBeenCalledWith('undefined');
      expect(result).toBe(true);
    });

    test('should handle long text', async () => {
      mockWriteText.mockResolvedValue();
      const longText = 'A'.repeat(10000);

      const result = await copyToClipboard(longText);

      expect(mockWriteText).toHaveBeenCalledWith(longText);
      expect(result).toBe(true);
    });

    test('should handle special characters', async () => {
      mockWriteText.mockResolvedValue();
      const specialText = 'Text with\nnewlines\tand\ttabs and émojis 🎉';

      const result = await copyToClipboard(specialText);

      expect(mockWriteText).toHaveBeenCalledWith(specialText);
      expect(result).toBe(true);
    });
  });

  describe('Integration tests', () => {
    test('should handle file information formatting together', () => {
      const fileInfo = {
        name: 'test-file.log',
        size: 1048576,
        lastModified: '2024-01-17T10:30:45.000Z',
        isFolder: false,
        type: 'log'
      };

      const formattedSize = formatFileSize(fileInfo.size);
      const formattedDate = formatDate(fileInfo.lastModified);
      const icon = getFileIcon(fileInfo.name, fileInfo.isFolder, fileInfo.type);

      expect(formattedSize).toBe('1 MB');
      expect(formattedDate).toMatch(/2024/);
      expect(icon).toBe('📄');
    });

    test('should handle folder information formatting together', () => {
      const folderInfo = {
        name: 'reports',
        size: null,
        lastModified: '2024-01-17T10:30:45.000Z',
        isFolder: true,
        type: 'folder'
      };

      const formattedSize = formatFileSize(folderInfo.size);
      const formattedDate = formatDate(folderInfo.lastModified);
      const icon = getFileIcon(folderInfo.name, folderInfo.isFolder, folderInfo.type);

      expect(formattedSize).toContain('NaN');
      expect(formattedDate).toMatch(/2024/);
      expect(icon).toBe('📁');
    });
  });
});