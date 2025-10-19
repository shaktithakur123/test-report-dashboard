import React, { useState, useEffect } from 'react';
import { HiDocumentReport } from 'react-icons/hi';
import FileExplorer from './components/FileExplorer';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch('/health');
      if (response.ok) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('error');
      }
    } catch (error) {
      console.error('Backend health check failed:', error);
      setBackendStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <div className="loading-text">Connecting to Test Report Dashboard...</div>
        </div>
      </div>
    );
  }

  if (backendStatus === 'error') {
    return (
      <div className="app-error">
        <div className="error-container">
          <div className="error-icon">!</div>
          <h2>Backend Connection Failed</h2>
          <p>Unable to connect to the Test Report Dashboard backend server.</p>
          <p>Please ensure the backend service is running and try again.</p>
          <button 
            className="retry-button"
            onClick={() => {
              setIsLoading(true);
              setBackendStatus('checking');
              checkBackendHealth();
            }}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="App">
        <header className="app-header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="app-title">
                <span className="title-icon">
                  <HiDocumentReport />
                </span>
                Test Report Dashboard
              </h1>
            </div>
          </div>
        </header>

        <main className="app-main">
          <FileExplorer />
        </main>

       
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;