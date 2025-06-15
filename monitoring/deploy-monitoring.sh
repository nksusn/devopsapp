#!/bin/bash

# Deploy Prometheus and Grafana monitoring stack for DevOps Hilltop
# This script deploys a complete monitoring solution with custom dashboards

set -e

echo "🚀 Deploying Prometheus and Grafana monitoring stack..."

# Check if kubectl is configured
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ kubectl is not configured or cluster is not accessible"
    echo "Please run: aws eks update-kubeconfig --region <region> --name <cluster-name>"
    exit 1
fi

CLUSTER_NAME=$(kubectl config current-context | cut -d'/' -f2)
echo "✅ Connected to cluster: $CLUSTER_NAME"

# Apply namespace and RBAC
echo "📦 Creating monitoring namespace and RBAC..."
kubectl apply -f monitoring/namespace.yaml

# Apply storage class if not exists
echo "💾 Ensuring GP3 storage class is available..."
if ! kubectl get storageclass gp3 &> /dev/null; then
    echo "⚠️  GP3 storage class not found, applying from k8s directory..."
    if [ -f k8s/storageclass-gp3.yaml ]; then
        kubectl apply -f k8s/storageclass-gp3.yaml
    else
        echo "❌ GP3 storage class configuration not found"
        exit 1
    fi
fi

# Apply Prometheus configuration and deployment
echo "🔧 Deploying Prometheus server..."
kubectl apply -f monitoring/prometheus-config.yaml
kubectl apply -f monitoring/prometheus-deployment.yaml

# Deploy Node Exporter
echo "📊 Deploying Node Exporter DaemonSet..."
kubectl apply -f monitoring/node-exporter.yaml

# Apply Grafana configuration and deployment
echo "📈 Deploying Grafana with custom dashboards..."
kubectl apply -f monitoring/grafana-config.yaml
kubectl apply -f monitoring/grafana-dashboards.yaml
kubectl apply -f monitoring/grafana-deployment.yaml

# Apply ServiceMonitor if Prometheus Operator is available
echo "🔍 Configuring service discovery..."
if kubectl get crd servicemonitors.monitoring.coreos.com &> /dev/null; then
    kubectl apply -f monitoring/servicemonitor.yaml
    echo "✅ ServiceMonitor applied (Prometheus Operator detected)"
else
    echo "⚠️  Prometheus Operator not detected, using static configuration"
fi

# Wait for deployments
echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/prometheus-server -n monitoring
kubectl wait --for=condition=available --timeout=300s deployment/grafana -n monitoring

# Wait for Node Exporter DaemonSet
echo "⏳ Waiting for Node Exporter to be ready..."
kubectl rollout status daemonset/node-exporter -n monitoring --timeout=300s

# Check pod status
echo "📋 Checking pod status..."
kubectl get pods -n monitoring

# Get service information
echo "🌐 Getting service information..."
echo ""
echo "=== Prometheus Server ==="
kubectl get service prometheus-server -n monitoring
echo ""
echo "=== Grafana Dashboard ==="
kubectl get service grafana -n monitoring

# Get Grafana LoadBalancer URL
echo "⏳ Waiting for Grafana LoadBalancer to be provisioned..."
for i in {1..60}; do
    GRAFANA_URL=$(kubectl get service grafana -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
    if [ -n "$GRAFANA_URL" ]; then
        echo "✅ Grafana LoadBalancer provisioned successfully!"
        echo "🌍 Grafana URL: http://$GRAFANA_URL:3000"
        break
    fi
    echo "Waiting for LoadBalancer... ($i/60)"
    sleep 5
done

if [ -z "$GRAFANA_URL" ]; then
    echo "⚠️  Grafana LoadBalancer still pending. Check AWS Load Balancer Controller:"
    echo "kubectl logs -n kube-system deployment/aws-load-balancer-controller"
    echo "kubectl describe service grafana -n monitoring"
fi

# Prometheus port-forward instructions
echo ""
echo "🔗 To access Prometheus locally:"
echo "kubectl port-forward service/prometheus-server 9090:80 -n monitoring"
echo "Then visit: http://localhost:9090"

# Test metrics endpoint
echo ""
echo "🧪 Testing application metrics endpoint..."
APP_SERVICE=$(kubectl get service devops-hilltop-service -n devops-hilltop -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
if [ -n "$APP_SERVICE" ]; then
    if curl -f -s "http://$APP_SERVICE/metrics" > /dev/null 2>&1; then
        echo "✅ Application metrics endpoint is accessible"
    else
        echo "⚠️  Application metrics endpoint not yet accessible"
    fi
else
    echo "⚠️  Application LoadBalancer not found, deploy application first"
fi

echo ""
echo "🎉 Monitoring stack deployment completed!"
echo ""
echo "📊 Access Information:"
echo "• Grafana: http://$GRAFANA_URL:3000 (admin/admin)"
echo "• Prometheus: kubectl port-forward service/prometheus-server 9090:80 -n monitoring"
echo ""
echo "📈 Available Dashboards:"
echo "• DevOps Hilltop Application Dashboard"
echo "• Kubernetes Cluster Overview"
echo "• Infrastructure Overview"
echo ""
echo "💡 Useful commands:"
echo "kubectl get pods -n monitoring                    # Check pod status"
echo "kubectl logs deployment/prometheus-server -n monitoring  # Prometheus logs"
echo "kubectl logs deployment/grafana -n monitoring           # Grafana logs"
echo "kubectl get servicemonitor -n monitoring               # Check service discovery"
echo ""
echo "🔧 To import additional community dashboards:"
echo "• Node Exporter Full: Dashboard ID 1860"
echo "• Kubernetes Cluster Monitoring: Dashboard ID 7249"
echo "• PostgreSQL Database: Dashboard ID 9628"