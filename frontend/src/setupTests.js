// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

// Mock window.URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.URL.revokeObjectURL = jest.fn();

// Mock console methods to reduce noise in tests
const originalError = console.error;
const originalLog = console.log;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is deprecated') ||
       args[0].includes('Failed to copy to clipboard') ||
       args[0].includes('Warning: `ReactDOMTestUtils.act` is deprecated') ||
       args[0].includes('Warning: An update to FileExplorer inside a test was not wrapped in act') ||
       args[0].includes('Failed to load directory'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  // Also filter out console.log messages from components during testing
  console.log = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Loading directory:') ||
       args[0].includes('Loaded') ||
       args[0].includes('Opening file:') ||
       args[0].includes('File opened:') ||
       args[0].includes('Downloading:') ||
       args[0].includes('Download started:'))
    ) {
      return;
    }
    originalLog.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.log = originalLog;
});