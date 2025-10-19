import React from 'react';
import { toast } from 'react-toastify';
import '../styles/Breadcrumb.css';

const Breadcrumb = ({ currentPath, onNavigate }) => {
  // Parse path into segments
  const getPathSegments = (path) => {
    if (path === '/') return [{ name: 'Home', path: '/' }];
    
    const segments = path.split('/').filter(segment => segment !== '');
    const breadcrumbs = [{ name: 'Home', path: '/' }];
    
    let currentSegmentPath = '';
    segments.forEach(segment => {
      currentSegmentPath += '/' + segment;
      breadcrumbs.push({
        name: segment,
        path: currentSegmentPath
      });
    });
    
    return breadcrumbs;
  };

  const pathSegments = getPathSegments(currentPath);

  const handleSegmentClick = (segmentPath) => {
    if (segmentPath !== currentPath) {
      onNavigate(segmentPath);
    }
  };

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb navigation">
      <ol className="breadcrumb-list">
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          const isClickable = !isLast && segment.path !== currentPath;
          
          return (
            <li key={segment.path} className="breadcrumb-item">
              {index > 0 && (
                <span className="breadcrumb-separator" aria-hidden="true">
                  /
                </span>
              )}
              
              {isClickable ? (
                <button
                  className="breadcrumb-link"
                  onClick={() => handleSegmentClick(segment.path)}
                  title={`Navigate to ${segment.name}`}
                >
                  {segment.name === 'Home' ? (
                    <span className="home-icon">🏠</span>
                  ) : (
                    segment.name
                  )}
                </button>
              ) : (
                <span className="breadcrumb-current">
                  {segment.name === 'Home' ? (
                    <span className="home-icon">🏠</span>
                  ) : (
                    segment.name
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      
      {/* Copy path button */}
      <button
        className="copy-path-button"
        onClick={async () => {
            try {
              await navigator.clipboard.writeText(currentPath);
              toast.success('Path copied to clipboard',{
                toastId: 'copy-success-path'
              });
            } catch (error) {
              toast.error('Failed to copy to clipboard');
            }
          }}
        
        title="Copy current path"
      >
        📋
      </button>
    </nav>
  );
};

export default Breadcrumb;