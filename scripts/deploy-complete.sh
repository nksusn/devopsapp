#!/bin/bash

set -e

echo "=== DEVOPS HILLTOP COMPLETE DEPLOYMENT ==="

# Generate unique image tag
TIMESTAMP=$(date +%s)
SHORT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "manual")
IMAGE_TAG="${SHORT_SHA}-${TIMESTAMP}"

echo "Building production image with tag: $IMAGE_TAG"

# Build and push Docker image
docker build -t hilltopconsultancy/devops-hilltop:$IMAGE_TAG .
docker push hilltopconsultancy/devops-hilltop:$IMAGE_TAG

# Tag and push as latest
docker tag hilltopconsultancy/devops-hilltop:$IMAGE_TAG hilltopconsultancy/devops-hilltop:latest
docker push hilltopconsultancy/devops-hilltop:latest

# Clean up existing resources
echo "Cleaning up existing resources..."
kubectl delete deployment devops-hilltop-app -n devops-hilltop --ignore-not-found=true
kubectl delete deployment postgres -n devops-hilltop --ignore-not-found=true
kubectl delete pvc postgres-pvc -n devops-hilltop --ignore-not-found=true

# Wait for cleanup
sleep 15

# Apply Kubernetes manifests in correct order
echo "Deploying to Kubernetes..."

# Create namespace
kubectl apply -f k8s/namespace.yaml

# Deploy PostgreSQL with gp2 storage (stable)
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
kubectl rollout status deployment/postgres -n devops-hilltop --timeout=300s

# Deploy application with new image
sed "s|hilltopconsultancy/devops-hilltop:latest|hilltopconsultancy/devops-hilltop:${IMAGE_TAG}|g" k8s/deployment.yaml | kubectl apply -f -
kubectl apply -f k8s/service.yaml

# Wait for application deployment
echo "Waiting for application to be ready..."
kubectl rollout status deployment/devops-hilltop-app -n devops-hilltop --timeout=300s

# Deploy monitoring stack
kubectl apply -f monitoring/

# Get service information
echo "=== DEPLOYMENT COMPLETE ==="
echo "Services:"
kubectl get svc -n devops-hilltop
echo ""
echo "LoadBalancer status:"
kubectl get svc devops-hilltop-loadbalancer -n devops-hilltop -o wide

# Wait for LoadBalancer IP
echo ""
echo "Waiting for LoadBalancer external IP..."
for i in {1..60}; do
    EXTERNAL_IP=$(kubectl get svc devops-hilltop-loadbalancer -n devops-hilltop -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
    if [ -n "$EXTERNAL_IP" ]; then
        echo "Application accessible at: http://$EXTERNAL_IP"
        break
    fi
    echo "Waiting for external IP... ($i/60)"
    sleep 5
done

echo ""
echo "Deployment logs:"
kubectl logs -l app=devops-hilltop-app -n devops-hilltop --tail=10