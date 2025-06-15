#!/bin/bash

set -e

echo "Setting up immediate application access..."

# Apply NodePort service for immediate access
kubectl apply -f k8s/nodeport-service.yaml

# Get node external IPs
echo "Getting cluster node information..."
NODE_IPS=$(kubectl get nodes -o jsonpath='{.items[*].status.addresses[?(@.type=="ExternalIP")].address}')
INTERNAL_IPS=$(kubectl get nodes -o jsonpath='{.items[*].status.addresses[?(@.type=="InternalIP")].address}')

echo ""
echo "=== IMMEDIATE ACCESS OPTIONS ==="

if [ -n "$NODE_IPS" ]; then
    echo "External Access (if nodes have public IPs):"
    for ip in $NODE_IPS; do
        echo "  http://$ip:30080"
    done
else
    echo "Internal Access (requires VPN/bastion):"
    for ip in $INTERNAL_IPS; do
        echo "  http://$ip:30080"
    done
fi

echo ""
echo "Services status:"
kubectl get svc -n devops-hilltop

echo ""
echo "Application pods:"
kubectl get pods -n devops-hilltop -l app=devops-hilltop-app

echo ""
echo "To fix LoadBalancer service, run: ./scripts/fix-loadbalancer-controller.sh"