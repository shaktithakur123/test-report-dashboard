#!/bin/bash

# Test Report Dashboard - Demonstration Script
# This script demonstrates the functionality of the Test Report Dashboard

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:8000"
TIMEOUT=30

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a service is running
check_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    print_status "Checking $service_name at $url..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" > /dev/null 2>&1; then
            print_success "$service_name is running!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name is not responding after $((max_attempts * 2)) seconds"
    return 1
}

# Function to test API endpoints
test_api_endpoints() {
    print_status "Testing API endpoints..."
    
    # Test health endpoint
    print_status "Testing health endpoint..."
    if curl -s -f "$BACKEND_URL/health" | jq . > /dev/null 2>&1; then
        print_success "Health endpoint is working"
    else
        print_error "Health endpoint failed"
        return 1
    fi
    
    # Test root directory listing
    print_status "Testing directory listing (root)..."
    if curl -s -f "$BACKEND_URL/api/list?path=/" | jq . > /dev/null 2>&1; then
        print_success "Root directory listing is working"
        
        # Show what's in the root directory
        print_status "Root directory contents:"
        curl -s -f "$BACKEND_URL/api/list?path=/" | jq -r '.[] | "  - \(.name) (\(if .isFolder then "folder" else "file" end))"' 2>/dev/null || echo "  (Unable to parse directory contents)"
    else
        print_error "Root directory listing failed"
        return 1
    fi
    
    # Test specific directory listing
    print_status "Testing directory listing (test_pipeline_results)..."
    if curl -s -f "$BACKEND_URL/api/list?path=/test_pipeline_results" | jq . > /dev/null 2>&1; then
        print_success "Test pipeline results directory listing is working"
        
        # Show jobs in test_pipeline_results
        print_status "Available test jobs:"
        curl -s -f "$BACKEND_URL/api/list?path=/test_pipeline_results" | jq -r '.[] | "  - \(.name)"' 2>/dev/null || echo "  (Unable to parse job list)"
    else
        print_warning "Test pipeline results directory listing failed (may not exist yet)"
    fi
    
    # Test reports directory listing
    print_status "Testing directory listing (reports)..."
    if curl -s -f "$BACKEND_URL/api/list?path=/reports" | jq . > /dev/null 2>&1; then
        print_success "Reports directory listing is working"
    else
        print_warning "Reports directory listing failed"
    fi
    
    # Test file content retrieval
    print_status "Testing file content retrieval..."
    if curl -s -f "$BACKEND_URL/api/file?path=/test_pipeline_results/job_12345/integration_test.log" > /dev/null 2>&1; then
        print_success "File content retrieval is working"
        
        # Show first few lines of the file
        print_status "Sample file content (first 3 lines):"
        curl -s -f "$BACKEND_URL/api/file?path=/test_pipeline_results/job_12345/integration_test.log" | head -n 3 | sed 's/^/  /' 2>/dev/null || echo "  (Unable to retrieve file content)"
    else
        print_warning "File content retrieval failed (file may not exist yet)"
    fi
    
    # Test additional endpoints
    print_status "Testing item info endpoint..."
    if curl -s -f "$BACKEND_URL/api/info?path=/test_pipeline_results/job_12345" | jq . > /dev/null 2>&1; then
        print_success "Item info endpoint is working"
    else
        print_warning "Item info endpoint failed"
    fi
    
    print_success "API endpoint testing completed"
}

# Function to test file downloads
test_downloads() {
    print_status "Testing download functionality..."
    
    # Create temporary directory for downloads
    local temp_dir=$(mktemp -d)
    cd "$temp_dir"
    
    # Test file download
    print_status "Testing single file download..."
    if curl -s -f -o "test_file.log" "$BACKEND_URL/api/download?path=/test_pipeline_results/job_12345/integration_test.log"; then
        if [ -f "test_file.log" ] && [ -s "test_file.log" ]; then
            file_size=$(wc -c < "test_file.log")
            print_success "Single file download is working (${file_size} bytes)"
            
            # Show first line of downloaded file
            print_status "Downloaded file preview:"
            head -n 1 "test_file.log" | sed 's/^/  /' 2>/dev/null || echo "  (Unable to preview file)"
        else
            print_warning "File downloaded but appears empty"
        fi
    else
        print_warning "Single file download failed (file may not exist)"
    fi
    
    # Test directory download
    print_status "Testing directory download..."
    if curl -s -f -o "test_directory.tar.gz" "$BACKEND_URL/api/download?path=/test_pipeline_results/job_12345"; then
        if [ -f "test_directory.tar.gz" ] && [ -s "test_directory.tar.gz" ]; then
            archive_size=$(wc -c < "test_directory.tar.gz")
            print_success "Directory download is working (${archive_size} bytes)"
            
            # Test archive extraction and show contents
            if tar -tzf "test_directory.tar.gz" > /dev/null 2>&1; then
                print_success "Downloaded archive is valid"
                
                print_status "Archive contents:"
                tar -tzf "test_directory.tar.gz" | head -n 5 | sed 's/^/  /' 2>/dev/null || echo "  (Unable to list archive contents)"
                
                file_count=$(tar -tzf "test_directory.tar.gz" | wc -l)
                print_status "Archive contains ${file_count} items"
            else
                print_warning "Downloaded archive may be corrupted"
            fi
        else
            print_warning "Directory downloaded but appears empty"
        fi
    else
        print_warning "Directory download failed (directory may not exist)"
    fi
    
    # Test different file types
    print_status "Testing different file type downloads..."
    
    # Test JSON file download
    if curl -s -f -o "config.json" "$BACKEND_URL/api/download?path=/test_pipeline_results/job_12346/config.json" 2>/dev/null; then
        if [ -f "config.json" ] && [ -s "config.json" ]; then
            print_success "JSON file download is working"
        fi
    fi
    
    # Test HTML report download
    if curl -s -f -o "report.html" "$BACKEND_URL/api/download?path=/reports/daily/2024-01-15.html" 2>/dev/null; then
        if [ -f "report.html" ] && [ -s "report.html" ]; then
            print_success "HTML report download is working"
        fi
    fi
    
    # Cleanup
    cd - > /dev/null
    rm -rf "$temp_dir"
    
    print_success "Download testing completed"
}

# Function to demonstrate frontend functionality
test_frontend() {
    print_status "Testing frontend accessibility..."
    
    if curl -s -f "$FRONTEND_URL" > /dev/null 2>&1; then
        print_success "Frontend is accessible"
        print_status "You can now open $FRONTEND_URL in your browser to test the UI"
        print_status "Frontend features to test manually:"
        echo "  • Navigate through directories by clicking folders"
        echo "  • View file contents by clicking files"
        echo "  • Download files using the download button"
        echo "  • Download entire folders (creates tar.gz archives)"
        echo "  • Switch between grid and list views"
        echo "  • Use breadcrumb navigation"
        echo "  • Right-click for context menus"
    else
        print_error "Frontend is not accessible"
        return 1
    fi
}

# Function to show system information
show_system_info() {
    print_status "System Information:"
    echo "  • Docker version: $(docker --version 2>/dev/null || echo 'Not installed')"
    echo "  • Docker Compose version: $(docker-compose --version 2>/dev/null || echo 'Not installed')"
    echo "  • curl version: $(curl --version 2>/dev/null | head -n1 || echo 'Not installed')"
    echo "  • jq version: $(jq --version 2>/dev/null || echo 'Not installed (optional)')"
    echo ""
}

# Function to show running containers
show_containers() {
    print_status "Docker containers status:"
    if command -v docker > /dev/null 2>&1; then
        docker ps --filter "name=test-report" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
        print_warning "Docker not available"
    fi
    echo ""
}

# Main execution
main() {
    echo "=============================================="
    echo "  Test Report Dashboard - Demo Script"
    echo "=============================================="
    echo ""
    
    show_system_info
    show_containers
    
    # Check if services are running
    print_status "Checking if services are running..."
    
    if ! check_service "$BACKEND_URL/health" "Backend Service"; then
        print_error "Backend service is not running!"
        print_status "Please start the services with: docker-compose up -d"
        exit 1
    fi
    
    if ! check_service "$FRONTEND_URL" "Frontend Service"; then
        print_error "Frontend service is not running!"
        print_status "Please start the services with: docker-compose up -d"
        exit 1
    fi
    
    echo ""
    print_success "Both services are running!"
    echo ""
    
    # Run tests
    test_api_endpoints
    echo ""
    
    test_downloads
    echo ""
    
    test_frontend
    echo ""
    
    # Show final status
    echo "=============================================="
    print_success "Demo completed successfully!"
    echo "=============================================="
    echo ""
    print_status "Next steps:"
    echo "  1. Open $FRONTEND_URL in your browser"
    echo "  2. Navigate through the test directories:"
    echo "     • /reports - Daily, weekly, and monthly test reports"
    echo "     • /test_pipeline_results - Job results and logs"
    echo "     • /configs - Configuration files"
    echo "     • /artifacts - Screenshots and logs"
    echo "  3. View file contents by clicking on files"
    echo "  4. Download files and folders (folders become .tar.gz archives)"
    echo "  5. Try switching between grid and list views"
    echo "  6. Use breadcrumb navigation to move between directories"
    echo "  7. Right-click items for context menu options"
    echo ""
    print_status "Sample files to explore:"
    echo "  • /test_pipeline_results/job_12345/integration_test.log"
    echo "  • /reports/daily/2024-01-15.html"
    echo "  • /configs/test_config.json"
    echo "  • /artifacts/logs/application.log"
    echo ""
    print_status "To stop the services:"
    echo "  docker-compose down"
    echo ""
    print_status "To view logs:"
    echo "  docker-compose logs -f"
    echo ""
    print_status "To rebuild and restart:"
    echo "  docker-compose down && docker-compose up --build -d"
    echo ""
}

# Check dependencies
check_dependencies() {
    local missing_deps=()
    
    if ! command -v curl > /dev/null 2>&1; then
        missing_deps+=("curl")
    fi
    
    if ! command -v docker > /dev/null 2>&1; then
        missing_deps+=("docker")
    fi
    
    if ! command -v docker-compose > /dev/null 2>&1; then
        missing_deps+=("docker-compose")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing required dependencies: ${missing_deps[*]}"
        print_status "Please install the missing dependencies and try again"
        exit 1
    fi
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Test Report Dashboard Demo Script"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --check-deps   Check if required dependencies are installed"
        echo "  --api-only     Test only API endpoints"
        echo "  --no-download  Skip download tests"
        echo ""
        echo "This script tests the functionality of the Test Report Dashboard"
        echo "by making HTTP requests to the backend API and checking the frontend."
        echo ""
        exit 0
        ;;
    --check-deps)
        check_dependencies
        print_success "All required dependencies are installed"
        exit 0
        ;;
    --api-only)
        check_dependencies
        show_system_info
        check_service "$BACKEND_URL/health" "Backend Service"
        test_api_endpoints
        exit 0
        ;;
    --no-download)
        check_dependencies
        show_system_info
        check_service "$BACKEND_URL/health" "Backend Service"
        check_service "$FRONTEND_URL" "Frontend Service"
        test_api_endpoints
        test_frontend
        exit 0
        ;;
    "")
        check_dependencies
        main
        ;;
    *)
        print_error "Unknown option: $1"
        print_status "Use --help for usage information"
        exit 1
        ;;
esac