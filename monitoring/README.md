# Prometheus and Grafana Monitoring Stack

This directory contains a complete monitoring solution for the DevOps Hilltop application using Prometheus and Grafana with custom dashboards.

## Overview

The monitoring stack includes:
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and alerting
- **Node Exporter**: System metrics collection
- **Custom Dashboards**: Application-specific monitoring
- **Alert Rules**: Proactive monitoring alerts

## Quick Start

### 1. Deploy Monitoring Stack
```bash
# Deploy all monitoring components
kubectl apply -f monitoring/

# Wait for deployment
kubectl wait --for=condition=available --timeout=300s deployment/prometheus-server -n monitoring
kubectl wait --for=condition=available --timeout=300s deployment/grafana -n monitoring
```

### 2. Access Services

#### Grafana Dashboard
```bash
# Get Grafana URL (LoadBalancer)
kubectl get service grafana -n monitoring

# Default credentials:
# Username: admin
# Password: admin (change on first login)
```

#### Prometheus UI
```bash
# Port forward to access Prometheus
kubectl port-forward service/prometheus-server 9090:80 -n monitoring

# Access at: http://localhost:9090
```

## Components

### Prometheus Configuration
- **Retention**: 15 days
- **Storage**: 20Gi persistent volume (GP3)
- **Scrape Interval**: 30 seconds
- **Targets**: Kubernetes nodes, pods, and services

### Grafana Features
- **Persistent Storage**: Dashboard and configuration persistence
- **Load Balancer**: External access via AWS NLB
- **Custom Dashboards**: Pre-configured application monitoring
- **Alert Notifications**: Integration with Slack/email

### Custom Dashboards

1. **DevOps Hilltop Application Dashboard**
   - Request rate and response times
   - Database connection metrics
   - Contact form submission tracking
   - Error rates and availability

2. **Kubernetes Cluster Dashboard**
   - Node resource utilization
   - Pod status and restart counts
   - Persistent volume usage
   - Network traffic analysis

3. **Infrastructure Overview**
   - EKS cluster health
   - LoadBalancer performance
   - Storage utilization
   - Cost tracking metrics

## Configuration Files

### Core Components
- `namespace.yaml`: Monitoring namespace
- `prometheus/`: Prometheus server configuration
- `grafana/`: Grafana deployment and dashboards
- `node-exporter/`: System metrics collection
- `service-monitor/`: Application metrics discovery

### Storage
- `storage/`: Persistent volume claims for data retention
- Uses GP3 storage class for optimal performance

## Deployment Details

### Prerequisites
- EKS cluster with AWS Load Balancer Controller
- GP3 storage class configured
- Sufficient cluster resources (2 vCPU, 4Gi RAM minimum)

### Resource Requirements
| Component | CPU | Memory | Storage |
|-----------|-----|--------|---------|
| Prometheus | 500m | 2Gi | 20Gi |
| Grafana | 200m | 512Mi | 5Gi |
| Node Exporter | 100m | 128Mi | - |

### Network Access
- **Grafana**: LoadBalancer on port 3000
- **Prometheus**: ClusterIP (internal access only)
- **Node Exporter**: DaemonSet on all nodes

## Custom Metrics

### Application Metrics
The DevOps Hilltop application exposes custom metrics:

```javascript
// Express.js middleware for metrics
app.use('/metrics', (req, res) => {
  // Contact form submissions
  contact_form_submissions_total
  
  // Database queries
  database_query_duration_seconds
  
  // HTTP requests
  http_request_duration_seconds
  
  // Active connections
  http_active_connections
});
```

### Infrastructure Metrics
- EKS cluster resource usage
- LoadBalancer health checks
- Persistent volume utilization
- Network load balancer performance

## Accessing Dashboards

### 1. Get Grafana URL
```bash
GRAFANA_URL=$(kubectl get service grafana -n monitoring -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "Grafana URL: http://$GRAFANA_URL:3000"
```

### 2. Login to Grafana
- Navigate to the Grafana URL
- Use default credentials (admin/admin)
- Change password on first login
- Navigate to Dashboards → Browse

### 3. Import Additional Dashboards
Popular community dashboards:
- **Kubernetes Cluster Monitoring**: Dashboard ID 7249
- **Node Exporter Full**: Dashboard ID 1860
- **PostgreSQL Database**: Dashboard ID 9628

## Troubleshooting

### Common Issues

#### Prometheus Not Scraping Targets
```bash
# Check service discovery
kubectl logs deployment/prometheus-server -n monitoring

# Verify service monitor
kubectl get servicemonitor -n monitoring

# Check network policies
kubectl describe networkpolicy -n monitoring
```

#### Grafana Dashboard Not Loading
```bash
# Check Grafana logs
kubectl logs deployment/grafana -n monitoring

# Verify persistent volume
kubectl get pvc -n monitoring

# Check ConfigMap
kubectl get configmap grafana-dashboards -n monitoring
```

## Security Considerations

### RBAC Configuration
- Dedicated service accounts for each component
- Minimal required permissions
- Network policies for traffic isolation

### Data Protection
- Metrics data retention policies
- Secure credential storage
- TLS encryption for external access

## Cost Optimization

### Monthly Costs (eu-central-1)
- **Persistent Volumes**: ~$3/month (25Gi GP3)
- **LoadBalancer**: ~$18/month (Grafana access)
- **Compute**: Included in existing node costs
- **Total**: ~$21/month additional

This monitoring stack provides comprehensive observability for the DevOps Hilltop application and underlying infrastructure, enabling proactive monitoring and quick issue resolution.