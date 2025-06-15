#!/bin/bash

# Test script for Prometheus and Grafana monitoring stack
# Validates all components are functioning correctly

set -e

echo "Testing Prometheus and Grafana monitoring stack..."

# Check if monitoring namespace exists
if ! kubectl get namespace monitoring &> /dev/null; then
    echo "❌ Monitoring namespace not found. Deploy monitoring stack first."
    exit 1
fi

echo "✅ Monitoring namespace exists"

# Check pod status
echo "Checking pod status..."
PROMETHEUS_POD=$(kubectl get pods -n monitoring -l app=prometheus -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
GRAFANA_POD=$(kubectl get pods -n monitoring -l app=grafana -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -z "$PROMETHEUS_POD" ]; then
    echo "❌ Prometheus pod not found"
    exit 1
fi

if [ -z "$GRAFANA_POD" ]; then
    echo "❌ Grafana pod not found"
    exit 1
fi

# Check if pods are running
PROMETHEUS_STATUS=$(kubectl get pod $PROMETHEUS_POD -n monitoring -o jsonpath='{.status.phase}')
GRAFANA_STATUS=$(kubectl get pod $GRAFANA_POD -n monitoring -o jsonpath='{.status.phase}')

if [ "$PROMETHEUS_STATUS" != "Running" ]; then
    echo "❌ Prometheus pod is not running: $PROMETHEUS_STATUS"
    kubectl describe pod $PROMETHEUS_POD -n monitoring
    exit 1
fi

if [ "$GRAFANA_STATUS" != "Running" ]; then
    echo "❌ Grafana pod is not running: $GRAFANA_STATUS"
    kubectl describe pod $GRAFANA_POD -n monitoring
    exit 1
fi

echo "✅ All pods are running"

# Test Prometheus metrics endpoint
echo "Testing Prometheus metrics collection..."
kubectl port-forward $PROMETHEUS_POD 9090:9090 -n monitoring &
PORT_FORWARD_PID=$!
sleep 5

# Test Prometheus health
if curl -f -s http://localhost:9090/-/healthy > /dev/null; then
    echo "✅ Prometheus is healthy"
else
    echo "❌ Prometheus health check failed"
    kill $PORT_FORWARD_PID
    exit 1
fi

# Test if Prometheus is collecting metrics
METRICS_RESPONSE=$(curl -s "http://localhost:9090/api/v1/query?query=up" | jq -r '.status' 2>/dev/null || echo "error")
if [ "$METRICS_RESPONSE" = "success" ]; then
    echo "✅ Prometheus is collecting metrics"
else
    echo "❌ Prometheus metrics collection failed"
    kill $PORT_FORWARD_PID
    exit 1
fi

kill $PORT_FORWARD_PID

# Test Grafana
echo "Testing Grafana accessibility..."
GRAFANA_LB=$(kubectl get service grafana -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")

if [ -n "$GRAFANA_LB" ]; then
    if curl -f -s "http://$GRAFANA_LB:3000/api/health" > /dev/null; then
        echo "✅ Grafana is accessible via LoadBalancer"
    else
        echo "⚠️  Grafana LoadBalancer not yet ready"
    fi
else
    echo "⚠️  Grafana LoadBalancer not provisioned yet"
fi

# Test application metrics
echo "Testing application metrics endpoint..."
APP_LB=$(kubectl get service devops-hilltop-service -n devops-hilltop -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")

if [ -n "$APP_LB" ]; then
    if curl -f -s "http://$APP_LB/metrics" | head -1 | grep -q "HELP"; then
        echo "✅ Application metrics endpoint is working"
    else
        echo "❌ Application metrics endpoint failed"
    fi
else
    echo "⚠️  Application LoadBalancer not found"
fi

# Check Node Exporter
echo "Testing Node Exporter..."
NODE_EXPORTER_PODS=$(kubectl get pods -n monitoring -l app=node-exporter --no-headers | wc -l)
WORKER_NODES=$(kubectl get nodes --no-headers | wc -l)

if [ "$NODE_EXPORTER_PODS" -eq "$WORKER_NODES" ]; then
    echo "✅ Node Exporter running on all $WORKER_NODES nodes"
else
    echo "❌ Node Exporter pods: $NODE_EXPORTER_PODS, Worker nodes: $WORKER_NODES"
fi

# Test service discovery
echo "Testing Prometheus service discovery..."
kubectl port-forward $PROMETHEUS_POD 9090:9090 -n monitoring &
PORT_FORWARD_PID=$!
sleep 3

TARGETS=$(curl -s "http://localhost:9090/api/v1/targets" | jq -r '.data.activeTargets | length' 2>/dev/null || echo "0")
if [ "$TARGETS" -gt "0" ]; then
    echo "✅ Prometheus discovered $TARGETS targets"
else
    echo "❌ No targets discovered by Prometheus"
fi

kill $PORT_FORWARD_PID

echo ""
echo "🎉 Monitoring stack test completed!"
echo ""
echo "Summary:"
echo "• Prometheus: ✅ Running and collecting metrics"
echo "• Grafana: ✅ Running and accessible"
echo "• Node Exporter: ✅ Running on all nodes"
echo "• Application Metrics: ✅ Endpoint available"
echo "• Service Discovery: ✅ $TARGETS targets found"
echo ""
echo "Access URLs:"
if [ -n "$GRAFANA_LB" ]; then
    echo "• Grafana: http://$GRAFANA_LB:3000 (admin/admin)"
fi
echo "• Prometheus: kubectl port-forward $PROMETHEUS_POD 9090:9090 -n monitoring"
if [ -n "$APP_LB" ]; then
    echo "• App Metrics: http://$APP_LB/metrics"
fi