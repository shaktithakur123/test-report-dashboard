import React from 'react';
import { HiFolderOpen } from 'react-icons/hi';
import FileItem from './FileItem';
import LoadingSpinner from './LoadingSpinner';
import '../styles/FileList.css';

const FileList = ({ 
  items, 
  viewMode, 
  onFolderClick, 
  onFileClick, 
  onDownload, 
  loading 
}) => {
  if (!items || items.length === 0) {
    return (
      <div className="file-list-empty">
        <div className="empty-state">
          <div className="empty-icon">
            <HiFolderOpen />
          </div>
          <h3>No items found</h3>
          <p>This directory appears to be empty.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`file-list ${viewMode}`}>
      <div className="file-list-container">
        {viewMode === 'list' && (
          <div className="file-list-header">
            <div className="header-name">Name</div>
            <div className="header-size">Size</div>
            <div className="header-modified">Modified</div>
            <div className="header-actions">Actions</div>
          </div>
        )}
        
        <div className="file-list-content">
          {items.map((item) => (
            <FileItem
              key={item.path}
              item={item}
              viewMode={viewMode}
              onFolderClick={onFolderClick}
              onFileClick={onFileClick}
              onDownload={onDownload}
              disabled={loading}
            />
          ))}
        </div>
      </div>
      
      {loading && (
        <div className="file-list-loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Loading...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileList;