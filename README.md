# Test Report Dashboard

A web-based dashboard for browsing and managing test pipeline results.

## Overview

This project provides a file browser interface for viewing test logs and results from internal testing pipelines. The application simulates a file system browser that allows users to navigate directories, view file contents, and download files or folders.

Built during a development sprint to address the need for better access to test pipeline data that was previously scattered across different systems.

## Features

- Browse files and directories through a web interface
- View file contents in a modal dialog
- Download individual files or entire folders as compressed archives
- Switch between grid and list view modes
- Navigate using breadcrumb navigation
- Right-click context menus for quick actions
- Responsive design for different screen sizes

## Technology Stack

**Backend:**
- Node.js with Express framework
- File system operations using fs-extra
- Archive creation with archiver library
- CORS enabled for cross-origin requests

**Frontend:**
- React 18 with functional components
- Custom CSS for styling
- Toast notifications for user feedback
- Modal dialogs for file viewing

**Infrastructure:**
- Docker containers for both services
- Nginx for serving static files
- Docker Compose for orchestration

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd test-report-dashboard
```

2. Start the application:
```bash
docker-compose up --build
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### Local Development

#### Backend Setup
```bash
cd backend
npm install
npm start
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## API Documentation

### Base URL
```
http://localhost:8000/api
```

### Endpoints

#### List Directory Contents
```
GET /api/list?path={directory_path}
```

Example:
```bash
curl "http://localhost:8000/api/list?path=/reports"
```

Response:
```json
[
  {
    "isFolder": true,
    "name": "daily",
    "path": "/reports/daily",
    "size": null,
    "lastModified": "2024-01-17T10:00:00.000Z",
    "type": "folder"
  },
  {
    "isFolder": false,
    "name": "summary.log",
    "path": "/reports/summary.log",
    "size": 1234,
    "lastModified": "2024-01-17T10:00:00.000Z",
    "type": "log"
  }
]
```

#### Get File Content
```
GET /api/file?path={file_path}
```

Example:
```bash
curl "http://localhost:8000/api/file?path=/reports/summary.log"
```

#### Download File or Folder
```
GET /api/download?path={item_path}
```

Files are returned as-is, folders are compressed into tar.gz archives.

#### Get Item Information
```
GET /api/info?path={item_path}
```

Returns metadata about a file or folder.

### Error Responses

API returns standard HTTP status codes:
- 200: Success
- 400: Bad Request (missing parameters)
- 404: Not Found
- 500: Internal Server Error

## Project Structure

```
test-report-dashboard/
├── backend/
│   ├── src/
│   │   ├── routes/api.js
│   │   ├── services/fileSystem.js
│   │   ├── utils/pathValidator.js
│   │   └── app.js
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── utils/
│   │   └── App.js
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── test_dashboard.sh
├── SYSTEM_DESIGN.md
└── README.md
```

## Documentation

- **README.md** - This file, contains setup and usage instructions
- **SYSTEM_DESIGN.md** - Detailed system architecture and design decisions

## Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

### Integration Testing
Run the demonstration script:
```bash
./test_dashboard.sh
```

## Development

### Code Style
- ESLint for JavaScript linting
- Prettier for code formatting
- Conventional commit messages

### Adding New Features
1. Create feature branch from main
2. Implement changes with tests
3. Update documentation if needed
4. Submit pull request for review

## Deployment

### Production Build
```bash
docker-compose -f docker-compose.prod.yml up --build
```

### Environment Variables
- `NODE_ENV`: Set to 'production' for production builds
- `PORT`: Backend server port (default: 8000)
- `REACT_APP_API_URL`: Frontend API endpoint URL

## Architecture

The application follows a standard client-server architecture:

- **Frontend**: React SPA served by Nginx
- **Backend**: Express.js API server
- **Data**: Fabricated file system created at startup
- **Communication**: REST API over HTTP

### Security
- Path validation to prevent directory traversal
- Input sanitization for all user inputs
- CORS configuration for cross-origin requests

### Performance
- Efficient file streaming for downloads
- Archive creation for folder downloads
- Client-side caching for API responses

## Troubleshooting

### Common Issues

**Services not starting:**
- Check if ports 3000 and 8000 are available
- Verify Docker is running
- Check container logs: `docker-compose logs`

**API errors:**
- Verify backend service is running
- Check network connectivity between containers
- Review backend logs for error details

**File download issues:**
- Ensure sufficient disk space
- Check browser download settings
- Verify file permissions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Make changes with appropriate tests
4. Commit changes (`git commit -am 'Add new feature'`)
5. Push to branch (`git push origin feature/new-feature`)
6. Submit a pull request

## License

MIT License

