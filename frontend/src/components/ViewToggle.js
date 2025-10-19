import React from 'react';
import { HiViewGrid, HiViewList } from 'react-icons/hi';
import '../styles/ViewToggle.css';

const ViewToggle = ({ viewMode, onToggle }) => {
  const handleGridClick = () => {
    if (viewMode !== 'grid') {
      onToggle();
    }
  };

  const handleListClick = () => {
    if (viewMode !== 'list') {
      onToggle();
    }
  };

  return (
    <div className="view-toggle segmented-toggle">
      <div className="toggle-group">
        <button
          className={`toggle-option ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={handleGridClick}
          title="Grid view (Ctrl+G)"
          aria-label="Switch to grid view"
          aria-pressed={viewMode === 'grid'}
        >
          <span className="view-icon">
            <HiViewGrid />
          </span>
          <span className="view-text">Grid</span>
        </button>
        
        <button
          className={`toggle-option ${viewMode === 'list' ? 'active' : ''}`}
          onClick={handleListClick}
          title="List view (Ctrl+G)"
          aria-label="Switch to list view"
          aria-pressed={viewMode === 'list'}
        >
          <span className="view-icon">
            <HiViewList />
          </span>
          <span className="view-text">List</span>
        </button>
      </div>
    </div>
  );
};

export default ViewToggle;