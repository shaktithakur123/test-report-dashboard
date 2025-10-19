import React, { useEffect, useRef } from 'react';
import { HiDocument, HiDownload, HiClipboard, HiX } from 'react-icons/hi';
import { toast } from 'react-toastify';
import '../styles/FileModal.css';

const FileModal = ({ file, onClose, onDownload }) => {
  const modalRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleBackdropClick = (event) => {
    if (event.target === modalRef.current) {
      onClose();
    }
  };

  const handleDownloadClick = () => {
    onDownload();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(file.content);
      toast.success('Content copied to clipboard', 
        {toastId: 'copy-success-content'}
      );
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getFileExtension = (filename) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const getLanguageFromExtension = (extension) => {
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'json': 'json',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'xml': 'xml',
      'yml': 'yaml',
      'yaml': 'yaml',
      'md': 'markdown',
      'log': 'log',
      'txt': 'text'
    };
    return languageMap[extension] || 'text';
  };

  const isTextFile = (filename) => {
    const textExtensions = [
      'txt', 'log', 'json', 'xml', 'html', 'css', 'js', 'jsx', 'ts', 'tsx',
      'py', 'java', 'cpp', 'c', 'h', 'md', 'yml', 'yaml', 'env', 'config',
      'ini', 'conf', 'sh', 'bat', 'sql', 'csv'
    ];
    const extension = getFileExtension(filename);
    return textExtensions.includes(extension);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const extension = getFileExtension(file.name);
  const language = getLanguageFromExtension(extension);
  const isText = isTextFile(file.name);
  const contentSize = new Blob([file.content]).size;

  return (
    <div
      ref={modalRef}
      className="file-modal-backdrop"
      onClick={handleBackdropClick}
    >
      <div className="file-modal">
        {/* Modal Header */}
        <div className="file-modal-header">
          <div className="modal-title">
            <span className="file-icon">
              <HiDocument />
            </span>
            <div className="title-info">
              <h2 className="file-name">{file.name}</h2>
              <p className="file-path">{file.path}</p>
            </div>
          </div>
          
          <div className="modal-actions">
            <button
              className="action-button copy-button"
              onClick={copyToClipboard}
              title="Copy content to clipboard"
            >
              <HiClipboard />
            </button>
            
            <button
              className="action-button download-button"
              onClick={handleDownloadClick}
              title="Download file"
            >
              <HiDownload />
            </button>
            
            <button
              className="action-button close-button"
              onClick={onClose}
              title="Close (Esc)"
            >
              <HiX />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="file-modal-content">
          {isText ? (
            <div className="text-content">
              <div className="content-info">
                <span className="content-type">{language.toUpperCase()}</span>
                <span className="content-size">{formatFileSize(contentSize)}</span>
                <span className="line-count">
                  {file.content.split('\n').length} lines
                </span>
              </div>
              
              <pre
                ref={contentRef}
                className={`code-content language-${language}`}
              >
                <code>{file.content}</code>
              </pre>
            </div>
          ) : (
            <div className="binary-content">
              <div className="binary-info">
                <div className="binary-icon">📄</div>
                <h3>Binary File</h3>
                <p>This file cannot be displayed as text.</p>
                <p>File size: {formatFileSize(contentSize)}</p>
                <button
                  className="download-binary-button"
                  onClick={handleDownloadClick}
                >
                  Download to view
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="file-modal-footer">
          <div className="footer-info">
            <span>Press Esc to close</span>
          </div>
          
          <div className="footer-actions">
            <button className="secondary-button" onClick={onClose}>
              Close
            </button>
            <button className="primary-button" onClick={handleDownloadClick}>
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileModal;