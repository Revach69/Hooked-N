#!/bin/bash

# Firebase Secure Deployment Script
# This script safely deploys Firebase configuration with security checks

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="hooked-69"
BACKUP_DIR="./firebase-backup-$(date +%Y%m%d-%H%M%S)"

echo -e "${GREEN}🚀 Starting Firebase Secure Deployment${NC}"

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Step 1: Pre-deployment checks
log "Step 1: Running pre-deployment security checks..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    error "Firebase CLI is not installed. Please install it first."
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    error "Not logged into Firebase. Please run 'firebase login' first."
fi

# Check if we're on the correct project
CURRENT_PROJECT=$(firebase use --json | jq -r '.current')
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    warn "Current project is $CURRENT_PROJECT, switching to $PROJECT_ID"
    firebase use $PROJECT_ID
fi

# Check if environment variables are set
if [ -z "$EXPO_PUBLIC_FIREBASE_API_KEY" ]; then
    warn "Firebase API key not set in environment variables"
fi

# Step 2: Create backup
log "Step 2: Creating backup of current configuration..."
mkdir -p "$BACKUP_DIR"

# Backup current rules
if [ -f "firestore.rules" ]; then
    cp firestore.rules "$BACKUP_DIR/"
fi
if [ -f "storage.rules" ]; then
    cp storage.rules "$BACKUP_DIR/"
fi
if [ -f "firebase.json" ]; then
    cp firebase.json "$BACKUP_DIR/"
fi

log "Backup created in: $BACKUP_DIR"

# Step 3: Validate configuration
log "Step 3: Validating Firebase configuration..."

# Test Firestore rules syntax
if [ -f "firestore.rules" ]; then
    log "Testing Firestore rules syntax..."
    if ! firebase firestore:rules:test firestore.rules --project=$PROJECT_ID; then
        error "Firestore rules validation failed"
    fi
fi

# Test Storage rules syntax
if [ -f "storage.rules" ]; then
    log "Testing Storage rules syntax..."
    if ! firebase storage:rules:test storage.rules --project=$PROJECT_ID; then
        error "Storage rules validation failed"
    fi
fi

# Step 4: Deploy with confirmation
log "Step 4: Deploying Firebase configuration..."

echo -e "${YELLOW}⚠️  About to deploy to project: $PROJECT_ID${NC}"
echo -e "${YELLOW}This will update:${NC}"
echo "  - Firestore security rules"
echo "  - Storage security rules"
echo "  - Firestore indexes"

read -p "Do you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log "Deployment cancelled by user"
    exit 0
fi

# Step 5: Deploy
log "Step 5: Deploying..."

# Deploy Firestore rules and indexes
if [ -f "firestore.rules" ]; then
    log "Deploying Firestore rules..."
    firebase deploy --only firestore:rules --project=$PROJECT_ID
    
    if [ -f "firestore.indexes.json" ]; then
        log "Deploying Firestore indexes..."
        firebase deploy --only firestore:indexes --project=$PROJECT_ID
    fi
fi

# Deploy Storage rules
if [ -f "storage.rules" ]; then
    log "Deploying Storage rules..."
    firebase deploy --only storage --project=$PROJECT_ID
fi

# Step 6: Post-deployment verification
log "Step 6: Verifying deployment..."

# Check if rules are deployed
log "Checking Firestore rules deployment..."
firebase firestore:rules:get --project=$PROJECT_ID > /dev/null

log "Checking Storage rules deployment..."
firebase storage:rules:get --project=$PROJECT_ID > /dev/null

# Step 7: Security audit
log "Step 7: Running security audit..."

# List current rules for verification
log "Current Firestore rules:"
firebase firestore:rules:get --project=$PROJECT_ID

log "Current Storage rules:"
firebase storage:rules:get --project=$PROJECT_ID

# Step 8: Cleanup and summary
log "Step 8: Deployment completed successfully!"

echo -e "${GREEN}✅ Firebase deployment completed!${NC}"
echo -e "${GREEN}📁 Backup location: $BACKUP_DIR${NC}"
echo -e "${GREEN}🔒 Security rules deployed and verified${NC}"

# Optional: Clean up old backups (keep last 5)
log "Cleaning up old backups..."
ls -dt firebase-backup-* | tail -n +6 | xargs -r rm -rf

echo -e "${GREEN}🎉 Deployment script completed successfully!${NC}" 