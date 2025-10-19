import React, { useState } from 'react';
import { HiFolder, HiDocument, HiDownload, HiClipboardCopy, HiDotsVertical } from 'react-icons/hi';
import ContextMenu from './ContextMenu';
import { formatFileSize, formatDate, getFileIcon } from '../utils/fileUtils';
import { toast } from 'react-toastify';
import '../styles/FileItem.css';

const FileItem = ({ 
  item, 
  viewMode, 
  onFolderClick, 
  onFileClick, 
  onDownload, 
  disabled 
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const handleClick = () => {
    if (disabled) return;
    
    if (item.isFolder) {
      onFolderClick(item.path);
    } else {
      onFileClick(item.path);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (disabled) return;
    
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleDownloadClick = (e) => {
    e.stopPropagation();
    if (disabled) return;
    
    onDownload(item.path, item.name);
  };

  const closeContextMenu = () => {
    setShowContextMenu(false);
  };

  const copyPathToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(item.path);
     toast.success('Path copied to clipboard',{
                toastId: 'copy-success-path'
              });
    } catch (error) {
      toast.error('Failed to copy path to clipboard');
    }
  };

  const contextMenuItems = [
    {
      label: item.isFolder ? 'Open Folder' : 'View File',
      icon: item.isFolder ? <HiFolder /> : <HiDocument />,
      action: handleClick
    },
    {
      label: 'Download',
      icon: <HiDownload />,
      action: () => onDownload(item.path, item.name)
    },
    {
      label: 'Copy Path',
      icon: <HiClipboardCopy />,
      action: copyPathToClipboard
    }
  ];

  const fileIcon = getFileIcon(item.name, item.isFolder, item.type);
  const formattedSize = item.size ? formatFileSize(item.size) : '';
  const formattedDate = formatDate(item.lastModified);

  if (viewMode === 'grid') {
    return (
      <>
        <div
          className={`file-item grid ${item.isFolder ? 'folder' : 'file'} ${disabled ? 'disabled' : ''}`}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          title={item.name}
        >
          <div className="file-icon-container">
            <div className="file-icon">{fileIcon}</div>
            <button
              className="download-button"
              onClick={handleDownloadClick}
              title="Download"
              disabled={disabled}
            >
              <HiDownload />
            </button>
          </div>
          
          <div className="file-info">
            <div className="file-name" title={item.name}>
              {item.name}
            </div>
            {!item.isFolder && item.size && (
              <div className="file-size">{formattedSize}</div>
            )}
          </div>
        </div>

        {showContextMenu && (
          <ContextMenu
            items={contextMenuItems}
            position={contextMenuPosition}
            onClose={closeContextMenu}
          />
        )}
      </>
    );
  }

  // List view
  return (
    <>
      <div
        className={`file-item list ${item.isFolder ? 'folder' : 'file'} ${disabled ? 'disabled' : ''}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <div className="file-name-column">
          <div className="file-icon">{fileIcon}</div>
          <span className="file-name" title={item.name}>
            {item.name}
          </span>
        </div>
        
        <div className="file-size-column">
          {!item.isFolder && item.size ? formattedSize : '—'}
        </div>
        
        <div className="file-modified-column">
          {formattedDate}
        </div>
        
        <div className="file-actions-column">
          <button
            className="action-button download-button"
            onClick={handleDownloadClick}
            title="Download"
            disabled={disabled}
          >
            <HiDownload />
          </button>
          
          <button
            className="action-button menu-button"
            onClick={(e) => {
              e.stopPropagation();
              if (disabled) return;
              
              const rect = e.currentTarget.getBoundingClientRect();
              setContextMenuPosition({ 
                x: rect.left + rect.width / 2, 
                y: rect.bottom + 5 
              });
              setShowContextMenu(true);
            }}
            title="More options"
            disabled={disabled}
          >
            <HiDotsVertical />
          </button>
        </div>
      </div>

      {showContextMenu && (
        <ContextMenu
          items={contextMenuItems}
          position={contextMenuPosition}
          onClose={closeContextMenu}
        />
      )}
    </>
  );
};

export default FileItem;