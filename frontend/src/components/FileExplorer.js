import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const FileExplorer = () => {
  const [items, setItems] = useState([]);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath]);

  const loadDirectory = async (path) => {
    try {
      const data = await apiService.listDirectory(path);
      setItems(data);
    } catch (error) {
      console.error('Error loading directory:', error);
    }
  };

  const handleItemClick = (item) => {
    if (item.isFolder) {
      setCurrentPath(item.path);
    }
  };

  return (
    <div className="file-explorer">
      <div>Current path: /{currentPath}</div>
      <div>
        {items.map((item, index) => (
          <div key={index} onClick={() => handleItemClick(item)}>
            {item.isFolder ? '📁' : '📄'} {item.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;
