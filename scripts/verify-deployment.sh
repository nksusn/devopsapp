#!/bin/bash

set -e

echo "=== DEVOPS HILLTOP DEPLOYMENT VERIFICATION ==="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

warning() {
    echo -e "${YELLOW}!${NC} $1"
}

# Check if kubectl is configured
if ! kubectl cluster-info >/dev/null 2>&1; then
    error "kubectl not configured or cluster not accessible"
    exit 1
fi

success "kubectl configured and cluster accessible"

# Check namespace
if kubectl get namespace devops-hilltop >/dev/null 2>&1; then
    success "Namespace devops-hilltop exists"
else
    warning "Creating namespace devops-hilltop"
    kubectl apply -f k8s/namespace.yaml
fi

# Verify k8s manifests
echo ""
echo "=== KUBERNETES MANIFEST VERIFICATION ==="

# Check PostgreSQL deployment
if kubectl get deployment postgres -n devops-hilltop >/dev/null 2>&1; then
    POSTGRES_READY=$(kubectl get deployment postgres -n devops-hilltop -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
    if [ "$POSTGRES_READY" = "1" ]; then
        success "PostgreSQL deployment ready"
    else
        warning "PostgreSQL deployment not ready (${POSTGRES_READY}/1)"
    fi
else
    error "PostgreSQL deployment not found"
fi

# Check application deployment
if kubectl get deployment devops-hilltop-app -n devops-hilltop >/dev/null 2>&1; then
    APP_READY=$(kubectl get deployment devops-hilltop-app -n devops-hilltop -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
    APP_DESIRED=$(kubectl get deployment devops-hilltop-app -n devops-hilltop -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "3")
    if [ "$APP_READY" = "$APP_DESIRED" ]; then
        success "Application deployment ready (${APP_READY}/${APP_DESIRED})"
    else
        warning "Application deployment not ready (${APP_READY}/${APP_DESIRED})"
    fi
else
    error "Application deployment not found"
fi

# Check services
if kubectl get service devops-hilltop-service -n devops-hilltop >/dev/null 2>&1; then
    SERVICE_TYPE=$(kubectl get service devops-hilltop-service -n devops-hilltop -o jsonpath='{.spec.type}')
    if [ "$SERVICE_TYPE" = "LoadBalancer" ]; then
        success "LoadBalancer service configured"
        
        # Check for external IP
        EXTERNAL_IP=$(kubectl get service devops-hilltop-service -n devops-hilltop -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
        if [ -n "$EXTERNAL_IP" ]; then
            success "External IP assigned: $EXTERNAL_IP"
            echo "Application URL: http://$EXTERNAL_IP"
        else
            warning "External IP not yet assigned (LoadBalancer provisioning)"
        fi
    else
        error "Service is not LoadBalancer type: $SERVICE_TYPE"
    fi
else
    error "LoadBalancer service not found"
fi

# Check persistent volumes
if kubectl get pvc postgres-pvc -n devops-hilltop >/dev/null 2>&1; then
    PVC_STATUS=$(kubectl get pvc postgres-pvc -n devops-hilltop -o jsonpath='{.status.phase}')
    if [ "$PVC_STATUS" = "Bound" ]; then
        success "PostgreSQL PVC bound"
    else
        error "PostgreSQL PVC not bound: $PVC_STATUS"
    fi
else
    error "PostgreSQL PVC not found"
fi

echo ""
echo "=== APPLICATION HEALTH CHECK ==="

# Wait for pods to be ready
echo "Checking pod status..."
kubectl get pods -n devops-hilltop

# Check application health endpoint
APP_POD=$(kubectl get pods -n devops-hilltop -l app=devops-hilltop-app -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "$APP_POD" ]; then
    echo "Testing health endpoint..."
    if kubectl exec -n devops-hilltop "$APP_POD" -- curl -s http://localhost:5000/health >/dev/null 2>&1; then
        success "Application health endpoint responding"
    else
        warning "Application health endpoint not responding"
    fi
    
    # Check database connection
    echo "Testing database connection..."
    if kubectl exec -n devops-hilltop "$APP_POD" -- node -e "
        import('url').then(url => {
            const dbUrl = process.env.DATABASE_URL;
            if (dbUrl) {
                console.log('DATABASE_URL configured');
                process.exit(0);
            } else {
                console.log('DATABASE_URL not found');
                process.exit(1);
            }
        });
    " 2>/dev/null; then
        success "Database configuration present"
    else
        warning "Database configuration issue"
    fi
else
    error "No application pods found"
fi

echo ""
echo "=== DEPLOYMENT SUMMARY ==="
kubectl get all -n devops-hilltop

echo ""
echo "=== VERIFICATION COMPLETE ==="