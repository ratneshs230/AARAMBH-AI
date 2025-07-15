#!/bin/bash

# AARAMBH AI Mobile Deployment Script
# This script handles deployment to app stores and distribution platforms

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="AARAMBH AI Mobile"
DEPLOY_DIR="./deploy"
LOGS_DIR="./logs"

# Create directories if they don't exist
mkdir -p $DEPLOY_DIR
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

# Function to check deployment prerequisites
check_deployment_prerequisites() {
    print_status "Checking deployment prerequisites..."
    
    # Check for EAS CLI
    if ! command -v eas &> /dev/null; then
        print_error "EAS CLI is not installed. Please install EAS CLI and try again."
        exit 1
    fi
    
    # Check if user is logged in to EAS
    if ! eas whoami &> /dev/null; then
        print_error "You are not logged in to EAS. Please run 'eas login' first."
        exit 1
    fi
    
    # Check for required environment variables
    if [[ -z "$EXPO_TOKEN" && -z "$EAS_BUILD_AUTOCOMMIT" ]]; then
        print_warning "No authentication tokens found. Make sure you're logged in."
    fi
    
    print_success "Prerequisites check completed."
}

# Function to validate build before deployment
validate_build() {
    print_status "Validating build configuration..."
    
    # Check app.json configuration
    if ! node -e "require('./app.json')"; then
        print_error "Invalid app.json configuration."
        exit 1
    fi
    
    # Check eas.json configuration
    if ! node -e "require('./eas.json')"; then
        print_error "Invalid eas.json configuration."
        exit 1
    fi
    
    print_success "Build configuration validated."
}

# Function to deploy to TestFlight (iOS)
deploy_testflight() {
    print_status "Deploying to TestFlight..."
    
    # Build and submit to TestFlight
    if eas build --platform ios --profile production --auto-submit; then
        print_success "Successfully submitted to TestFlight."
    else
        print_error "Failed to submit to TestFlight."
        exit 1
    fi
}

# Function to deploy to Google Play Console (Android)
deploy_play_console() {
    print_status "Deploying to Google Play Console..."
    
    # Build and submit to Google Play Console
    if eas build --platform android --profile production --auto-submit; then
        print_success "Successfully submitted to Google Play Console."
    else
        print_error "Failed to submit to Google Play Console."
        exit 1
    fi
}

# Function to deploy to both app stores
deploy_app_stores() {
    print_status "Deploying to both app stores..."
    
    # Deploy to iOS App Store
    deploy_testflight
    
    # Deploy to Google Play Store
    deploy_play_console
    
    print_success "Deployed to both app stores successfully."
}

# Function to deploy update via EAS Update
deploy_update() {
    print_status "Deploying OTA update..."
    
    # Create and publish update
    if eas update --auto; then
        print_success "OTA update published successfully."
    else
        print_error "Failed to publish OTA update."
        exit 1
    fi
}

# Function to deploy to internal distribution
deploy_internal() {
    print_status "Deploying to internal distribution..."
    
    # Build for internal distribution
    if eas build --platform all --profile preview; then
        print_success "Internal distribution build completed."
        
        # Get build URLs
        print_status "Getting build URLs..."
        eas build:list --limit 2
        
    else
        print_error "Failed to build for internal distribution."
        exit 1
    fi
}

# Function to create release notes
create_release_notes() {
    local version=$1
    local notes_file="$DEPLOY_DIR/release-notes-$version.md"
    
    print_status "Creating release notes..."
    
    {
        echo "# AARAMBH AI Mobile v$version"
        echo ""
        echo "## Release Date"
        echo "$(date '+%Y-%m-%d')"
        echo ""
        echo "## What's New"
        echo "- Bug fixes and performance improvements"
        echo "- Enhanced AI learning experience"
        echo "- Improved offline functionality"
        echo "- Better user interface and experience"
        echo ""
        echo "## Technical Details"
        echo "- Platform: iOS & Android"
        echo "- Minimum iOS: 13.0"
        echo "- Minimum Android: API 21"
        echo "- Build Date: $(date)"
        echo ""
        echo "## Support"
        echo "For support, please contact support@aarambhai.com"
    } > "$notes_file"
    
    print_success "Release notes created: $notes_file"
}

# Function to tag release in git
tag_release() {
    local version=$1
    
    print_status "Tagging release v$version..."
    
    if git tag -a "v$version" -m "Release v$version"; then
        print_success "Release tagged successfully."
        
        # Push tags to remote
        if git push origin --tags; then
            print_success "Tags pushed to remote repository."
        else
            print_warning "Failed to push tags to remote repository."
        fi
    else
        print_warning "Failed to tag release."
    fi
}

# Function to notify deployment completion
notify_deployment() {
    local platform=$1
    local version=$2
    
    print_status "Sending deployment notification..."
    
    # Here you would typically send notifications to Slack, Discord, etc.
    # For now, we'll just create a log entry
    
    local log_file="$LOGS_DIR/deployment-$(date +%Y%m%d-%H%M%S).log"
    
    {
        echo "=================================="
        echo "DEPLOYMENT NOTIFICATION"
        echo "=================================="
        echo "Project: $PROJECT_NAME"
        echo "Version: $version"
        echo "Platform: $platform"
        echo "Deployment Date: $(date)"
        echo "Status: SUCCESS"
        echo "=================================="
    } > "$log_file"
    
    print_success "Deployment logged: $log_file"
}

# Function to rollback deployment
rollback_deployment() {
    local version=$1
    
    print_status "Rolling back to version $version..."
    
    # This would typically involve rolling back to a previous EAS Update
    if eas update --branch production --message "Rollback to v$version"; then
        print_success "Rollback completed successfully."
    else
        print_error "Rollback failed."
        exit 1
    fi
}

# Function to show deployment status
show_deployment_status() {
    print_status "Checking deployment status..."
    
    # Show recent builds
    print_status "Recent builds:"
    eas build:list --limit 5
    
    # Show current update status
    print_status "Current update status:"
    eas update:list --limit 5
}

# Function to show help
show_help() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  ios                Deploy to iOS App Store"
    echo "  android            Deploy to Android Play Store"
    echo "  stores             Deploy to both app stores"
    echo "  update             Deploy OTA update"
    echo "  internal           Deploy to internal distribution"
    echo "  rollback VERSION   Rollback to specific version"
    echo "  status             Show deployment status"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 ios             Deploy to iOS App Store"
    echo "  $0 stores          Deploy to both app stores"
    echo "  $0 update          Deploy OTA update"
    echo "  $0 rollback 1.0.0  Rollback to version 1.0.0"
}

# Main script logic
main() {
    print_status "Starting deployment process for $PROJECT_NAME..."
    
    # Get current version
    local current_version=$(node -p "require('./package.json').version")
    
    # Check prerequisites
    check_deployment_prerequisites
    
    # Validate build configuration
    validate_build
    
    # Handle command line arguments
    case $1 in
        "ios")
            deploy_testflight
            create_release_notes "$current_version"
            tag_release "$current_version"
            notify_deployment "iOS" "$current_version"
            ;;
        "android")
            deploy_play_console
            create_release_notes "$current_version"
            tag_release "$current_version"
            notify_deployment "Android" "$current_version"
            ;;
        "stores")
            deploy_app_stores
            create_release_notes "$current_version"
            tag_release "$current_version"
            notify_deployment "Both Stores" "$current_version"
            ;;
        "update")
            deploy_update
            notify_deployment "OTA Update" "$current_version"
            ;;
        "internal")
            deploy_internal
            notify_deployment "Internal" "$current_version"
            ;;
        "rollback")
            if [[ -z "$2" ]]; then
                print_error "Please specify version to rollback to."
                exit 1
            fi
            rollback_deployment "$2"
            ;;
        "status")
            show_deployment_status
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
    
    print_success "Deployment process completed successfully!"
}

# Run main function with all arguments
main "$@"