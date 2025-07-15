#!/bin/bash

# AARAMBH AI Mobile Build Script
# This script handles building the mobile application for different platforms and environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="AARAMBH AI Mobile"
BUILD_DIR="./build"
LOGS_DIR="./logs"

# Create directories if they don't exist
mkdir -p $BUILD_DIR
mkdir -p $LOGS_DIR

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

# Function to check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check for Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js and try again."
        exit 1
    fi
    
    # Check for npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    # Check for Expo CLI
    if ! command -v npx expo &> /dev/null; then
        print_error "Expo CLI is not installed. Please install Expo CLI and try again."
        exit 1
    fi
    
    # Check for EAS CLI
    if ! command -v eas &> /dev/null; then
        print_warning "EAS CLI is not installed. Installing..."
        npm install -g @expo/eas-cli
    fi
    
    print_success "All dependencies are installed."
}

# Function to install project dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    
    if npm install; then
        print_success "Dependencies installed successfully."
    else
        print_error "Failed to install dependencies."
        exit 1
    fi
}

# Function to run pre-build checks
pre_build_checks() {
    print_status "Running pre-build checks..."
    
    # Check TypeScript
    if npx tsc --noEmit; then
        print_success "TypeScript check passed."
    else
        print_error "TypeScript check failed."
        exit 1
    fi
    
    # Run linting
    if npm run lint; then
        print_success "Linting check passed."
    else
        print_warning "Linting check failed. Consider fixing linting issues."
    fi
    
    # Run tests
    if npm test; then
        print_success "Tests passed."
    else
        print_warning "Tests failed. Consider fixing test issues."
    fi
}

# Function to build for development
build_development() {
    print_status "Building for development..."
    
    # Build development client
    if eas build --platform all --profile development; then
        print_success "Development build completed successfully."
    else
        print_error "Development build failed."
        exit 1
    fi
}

# Function to build for preview
build_preview() {
    print_status "Building for preview..."
    
    # Build preview version
    if eas build --platform all --profile preview; then
        print_success "Preview build completed successfully."
    else
        print_error "Preview build failed."
        exit 1
    fi
}

# Function to build for production
build_production() {
    print_status "Building for production..."
    
    # Build production version
    if eas build --platform all --profile production; then
        print_success "Production build completed successfully."
    else
        print_error "Production build failed."
        exit 1
    fi
}

# Function to build for specific platform
build_platform() {
    local platform=$1
    local profile=$2
    
    print_status "Building for $platform with $profile profile..."
    
    if eas build --platform $platform --profile $profile; then
        print_success "$platform build completed successfully."
    else
        print_error "$platform build failed."
        exit 1
    fi
}

# Function to optimize bundle
optimize_bundle() {
    print_status "Optimizing bundle..."
    
    # Run Metro bundler optimization
    if npx expo export --platform all; then
        print_success "Bundle optimization completed."
    else
        print_warning "Bundle optimization failed."
    fi
}

# Function to generate build report
generate_build_report() {
    print_status "Generating build report..."
    
    local report_file="$LOGS_DIR/build-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "=================================="
        echo "AARAMBH AI Mobile Build Report"
        echo "=================================="
        echo "Build Date: $(date)"
        echo "Node Version: $(node --version)"
        echo "npm Version: $(npm --version)"
        echo "Expo CLI Version: $(npx expo --version)"
        echo "EAS CLI Version: $(eas --version)"
        echo "=================================="
        echo "Project Information:"
        echo "Name: $PROJECT_NAME"
        echo "Version: $(node -p "require('./package.json').version")"
        echo "=================================="
        echo "Build Status: SUCCESS"
        echo "=================================="
    } > "$report_file"
    
    print_success "Build report generated: $report_file"
}

# Function to clean build artifacts
clean_build() {
    print_status "Cleaning build artifacts..."
    
    rm -rf $BUILD_DIR
    rm -rf .expo
    rm -rf node_modules/.cache
    npm cache clean --force
    
    print_success "Build artifacts cleaned."
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  dev, development    Build for development"
    echo "  preview            Build for preview"
    echo "  prod, production   Build for production"
    echo "  ios                Build for iOS only"
    echo "  android            Build for Android only"
    echo "  optimize           Optimize bundle"
    echo "  clean              Clean build artifacts"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev             Build development version"
    echo "  $0 production      Build production version"
    echo "  $0 ios preview     Build iOS preview version"
    echo "  $0 android prod    Build Android production version"
}

# Main script logic
main() {
    print_status "Starting build process for $PROJECT_NAME..."
    
    # Check dependencies
    check_dependencies
    
    # Install dependencies
    install_dependencies
    
    # Handle command line arguments
    case $1 in
        "dev"|"development")
            pre_build_checks
            build_development
            ;;
        "preview")
            pre_build_checks
            build_preview
            ;;
        "prod"|"production")
            pre_build_checks
            build_production
            ;;
        "ios")
            pre_build_checks
            build_platform "ios" "${2:-production}"
            ;;
        "android")
            pre_build_checks
            build_platform "android" "${2:-production}"
            ;;
        "optimize")
            optimize_bundle
            ;;
        "clean")
            clean_build
            ;;
        "help"|"--help"|"-h")
            show_help
            exit 0
            ;;
        *)
            print_error "Invalid option. Use 'help' for usage information."
            exit 1
            ;;
    esac
    
    # Generate build report
    generate_build_report
    
    print_success "Build process completed successfully!"
}

# Run main function with all arguments
main "$@"