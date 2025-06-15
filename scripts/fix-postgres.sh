#!/bin/bash

set -e

echo "Fixing PostgreSQL CrashLoopBackOff issue..."

# Delete the existing deployment and PVC to start fresh
echo "Stopping existing PostgreSQL deployment..."
kubectl delete deployment postgres -n devops-hilltop --ignore-not-found=true
kubectl delete pvc postgres-pvc -n devops-hilltop --ignore-not-found=true

# Wait for complete cleanup
echo "Waiting for complete cleanup..."
sleep 15

# Recreate PVC first
echo "Creating fresh persistent volume..."
kubectl apply -f k8s/postgres-pvc.yaml

# Redeploy PostgreSQL with fixed configuration
echo "Deploying PostgreSQL with corrected data directory..."
kubectl apply -f k8s/postgres-deployment.yaml

# Wait for deployment to be ready
echo "Waiting for PostgreSQL to be ready..."
kubectl rollout status deployment/postgres -n devops-hilltop --timeout=300s

# Verify the deployment
echo "Verifying PostgreSQL deployment..."
kubectl get pods -n devops-hilltop -l app=postgres

# Check PostgreSQL logs
echo "PostgreSQL logs:"
kubectl logs -n devops-hilltop -l app=postgres --tail=10

echo "PostgreSQL fix complete!"