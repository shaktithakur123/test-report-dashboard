import React, { useState, useEffect, useCallback } from 'react';
import { HiFolderOpen, HiRefresh } from 'react-icons/hi';
import Breadcrumb from './Breadcrumb';
import ViewToggle from './ViewToggle';
import FileList from './FileList';
import FileModal from './FileModal';
import LoadingSpinner from './LoadingSpinner';
import apiService from '../services/apiService';
import { toast } from 'react-toastify';
import '../styles/FileExplorer.css';

const FileExplorer = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [items, setItems] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  // Load directory contents
  const loadDirectory = useCallback(async (path) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Loading directory: ${path}`);
      const directoryItems = await apiService.listDirectory(path);
      setItems(directoryItems);
      setCurrentPath(path);
      console.log(`Loaded ${directoryItems.length} items from ${path}`);
    } catch (error) {
      console.error('Failed to load directory:', error);
      setError(`Failed to load directory: ${path}`);
      toast.error(`Failed to load directory: ${path}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadDirectory('/');
  }, [loadDirectory]);

  // Handle folder navigation
  const handleFolderClick = useCallback((folderPath) => {
    loadDirectory(folderPath);
  }, [loadDirectory]);

  // Handle file click (view content)
  const handleFileClick = useCallback(async (filePath) => {
    try {
      console.log(`Opening file: ${filePath}`);
      const content = await apiService.getFileContent(filePath);
      setSelectedFile({
        path: filePath,
        name: filePath.split('/').pop(),
        content: content
      });
      setShowModal(true);
      console.log(`File opened: ${filePath}`);
    } catch (error) {
      console.error('Failed to open file:', error);
      toast.error(`Failed to open file: ${filePath.split('/').pop()}`);
    }
  }, []);

  // Handle download
  const handleDownload = useCallback(async (itemPath, itemName) => {
    try {
      console.log(`Downloading: ${itemPath}`);
      await apiService.downloadItem(itemPath, itemName);
      console.log(`Download started: ${itemName}`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(`Failed to download: ${itemName}`);
    }
  }, []);

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = useCallback((path) => {
    loadDirectory(path);
  }, [loadDirectory]);

  // Handle view mode toggle
  const handleViewModeToggle = useCallback(() => {
    setViewMode(prevMode => prevMode === 'grid' ? 'list' : 'grid');
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setSelectedFile(null);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    loadDirectory(currentPath);
  }, [loadDirectory, currentPath]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Escape key to close modal
      if (event.key === 'Escape' && showModal) {
        handleModalClose();
      }
      
      // F5 or Ctrl+R to refresh
      if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
        event.preventDefault();
        handleRefresh();
      }
      
      // Ctrl+G to toggle view mode
      if (event.ctrlKey && event.key === 'g') {
        event.preventDefault();
        handleViewModeToggle();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showModal, handleModalClose, handleRefresh, handleViewModeToggle]);

  if (error && items.length === 0) {
    return (
      <div className="file-explorer-error">
        <div className="error-content">
          <div className="error-icon">!</div>
          <h3>Failed to Load Directory</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={() => loadDirectory(currentPath)}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="file-explorer">
      {/* Header with breadcrumb and controls */}
      <div className="file-explorer-header">
        <div className="header-left">
          <Breadcrumb 
            currentPath={currentPath} 
            onNavigate={handleBreadcrumbClick}
          />
        </div>
        
        <div className="header-right">
          <button 
            className="refresh-button"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh (F5)"
          >
            <HiRefresh />
          </button>
          
          <ViewToggle 
            viewMode={viewMode} 
            onToggle={handleViewModeToggle}
          />
        </div>
      </div>

      {/* Main content area */}
      <div className="file-explorer-content">
        {loading && items.length === 0 ? (
          <LoadingSpinner message="Loading directory contents..." />
        ) : (
          <>
            {items.length === 0 ? (
              <div className="empty-directory">
                <div className="empty-icon">
                  <HiFolderOpen />
                </div>
                <h3>Empty Directory</h3>
                <p>This directory contains no files or folders.</p>
              </div>
            ) : (
              <FileList
                items={items}
                viewMode={viewMode}
                onFolderClick={handleFolderClick}
                onFileClick={handleFileClick}
                onDownload={handleDownload}
                loading={loading}
              />
            )}
          </>
        )}
      </div>

      {/* Status bar */}
      <div className="file-explorer-status">
        <div className="status-left">
          <span className="item-count">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </span>
          {loading && (
            <span className="loading-indicator">
              Loading...
            </span>
          )}
        </div>
        
        <div className="status-right">
          <span className="current-path">{currentPath}</span>
        </div>
      </div>

      {/* File content modal */}
      {showModal && selectedFile && (
        <FileModal
          file={selectedFile}
          onClose={handleModalClose}
          onDownload={() => handleDownload(selectedFile.path, selectedFile.name)}
        />
      )}
    </div>
  );
};

export default FileExplorer;