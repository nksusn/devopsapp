#!/bin/bash

# Kubernetes Secrets Management Script for DevOps Hilltop
# Usage: ./scripts/manage-secrets.sh [decode|encode|update|view]

set -e

NAMESPACE="devops-hilltop"
SECRET_NAME="devops-hilltop-secret"

function show_usage() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  decode [key]    - Decode a specific secret key"
    echo "  encode [value]  - Encode a value to base64"
    echo "  view           - View all secret keys (without values)"
    echo "  update         - Update secrets from current environment"
    echo "  backup         - Backup current secrets to file"
    echo "  restore        - Restore secrets from backup file"
    echo ""
    echo "Examples:"
    echo "  $0 decode DATABASE_URL"
    echo "  $0 encode 'postgresql://user:pass@host:5432/db'"
    echo "  $0 update"
}

function decode_secret() {
    local key="$1"
    if [ -z "$key" ]; then
        echo "Error: Please specify a secret key to decode"
        exit 1
    fi
    
    echo "Decoding secret key: $key"
    kubectl get secret $SECRET_NAME -n $NAMESPACE -o jsonpath="{.data.$key}" | base64 -d
    echo ""
}

function encode_value() {
    local value="$1"
    if [ -z "$value" ]; then
        echo "Error: Please specify a value to encode"
        exit 1
    fi
    
    echo "Base64 encoded value:"
    echo -n "$value" | base64 -w 0
    echo ""
}

function view_secrets() {
    echo "Current secret keys in $SECRET_NAME:"
    kubectl get secret $SECRET_NAME -n $NAMESPACE -o jsonpath='{.data}' | jq -r 'keys[]' 2>/dev/null || {
        echo "Secret not found or jq not available"
        kubectl get secret $SECRET_NAME -n $NAMESPACE -o yaml | grep -A 20 "data:" | grep "  " | cut -d: -f1 | sed 's/^  //'
    }
}

function update_secrets() {
    echo "Updating secrets from current environment variables..."
    
    # Check if required environment variables are present
    if [ -z "$DATABASE_URL" ] || [ -z "$PGUSER" ] || [ -z "$PGHOST" ]; then
        echo "Error: Required environment variables not found"
        echo "Make sure DATABASE_URL, PGUSER, PGHOST, PGPORT, PGDATABASE are set"
        exit 1
    fi
    
    # Create new secret with current environment values
    kubectl create secret generic $SECRET_NAME \
        --from-literal=DATABASE_URL="$DATABASE_URL" \
        --from-literal=PGUSER="$PGUSER" \
        --from-literal=PGPASSWORD="$PGPASSWORD" \
        --from-literal=PGHOST="$PGHOST" \
        --from-literal=PGPORT="$PGPORT" \
        --from-literal=PGDATABASE="$PGDATABASE" \
        --from-literal=NODE_ENV="production" \
        --from-literal=SESSION_SECRET="devops-hilltop-secret-key-2025" \
        --namespace=$NAMESPACE \
        --dry-run=client -o yaml | kubectl apply -f -
    
    echo "Secrets updated successfully"
    echo "Restarting deployment to apply new secrets..."
    kubectl rollout restart deployment/devops-hilltop-deployment -n $NAMESPACE
}

function backup_secrets() {
    local backup_file="secrets-backup-$(date +%Y%m%d-%H%M%S).yaml"
    echo "Backing up secrets to $backup_file..."
    
    kubectl get secret $SECRET_NAME -n $NAMESPACE -o yaml > "$backup_file"
    echo "Backup saved to $backup_file"
}

function restore_secrets() {
    local backup_file="$1"
    if [ -z "$backup_file" ] || [ ! -f "$backup_file" ]; then
        echo "Error: Please specify a valid backup file"
        echo "Usage: $0 restore <backup-file.yaml>"
        exit 1
    fi
    
    echo "Restoring secrets from $backup_file..."
    kubectl apply -f "$backup_file"
    echo "Secrets restored successfully"
}

function show_actual_values() {
    echo "=== Current Database Configuration ==="
    echo "Database URL: $(decode_secret DATABASE_URL)"
    echo "User: $(decode_secret PGUSER)"
    echo "Host: $(decode_secret PGHOST)"
    echo "Port: $(decode_secret PGPORT)"
    echo "Database: $(decode_secret PGDATABASE)"
    echo "Environment: $(decode_secret NODE_ENV)"
}

# Main script logic
case "${1:-help}" in
    decode)
        decode_secret "$2"
        ;;
    encode)
        encode_value "$2"
        ;;
    view)
        view_secrets
        ;;
    update)
        update_secrets
        ;;
    backup)
        backup_secrets
        ;;
    restore)
        restore_secrets "$2"
        ;;
    values)
        show_actual_values
        ;;
    help|*)
        show_usage
        ;;
esac