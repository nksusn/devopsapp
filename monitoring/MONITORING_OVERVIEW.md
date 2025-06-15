# DevOps Hilltop Monitoring Stack

## Complete Monitoring Solution

This monitoring stack provides comprehensive observability for the DevOps Hilltop 3-tier application and underlying Kubernetes infrastructure.

### Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Grafana       │    │   Prometheus    │    │ DevOps Hilltop  │
│   Dashboard     │◄───┤   Server        │◄───┤   Application   │
│   (LoadBalancer)│    │   (ClusterIP)   │    │   (/metrics)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                 ▲
                                 │
                       ┌─────────────────┐
                       │  Node Exporter  │
                       │   (DaemonSet)   │
                       └─────────────────┘
```

### Components Deployed

#### Prometheus Server
- **Purpose**: Metrics collection and storage
- **Storage**: 20Gi persistent volume (GP3)
- **Retention**: 15 days
- **Scrape Interval**: 30 seconds
- **Access**: Internal ClusterIP service

#### Grafana Dashboard
- **Purpose**: Metrics visualization and alerting
- **Storage**: 5Gi persistent volume (GP3)
- **Access**: External LoadBalancer on port 3000
- **Credentials**: admin/admin (change on first login)

#### Node Exporter
- **Purpose**: System metrics from all cluster nodes
- **Deployment**: DaemonSet on every node
- **Metrics**: CPU, memory, disk, network usage

#### Custom Dashboards
1. **DevOps Hilltop Application**
   - HTTP request rates and response times
   - Contact form submissions tracking
   - Database connection metrics
   - Error rates and availability

2. **Kubernetes Cluster Overview**
   - Node resource utilization
   - Pod status and restart counts
   - Persistent volume usage
   - Network traffic analysis

3. **Infrastructure Overview**
   - LoadBalancer health status
   - Storage utilization trends
   - Service response times
   - Pod restart patterns

### Application Metrics

The DevOps Hilltop application exposes the following custom metrics:

#### HTTP Metrics
- `http_requests_total`: Total HTTP requests by method, status, route
- `http_request_duration_seconds`: Request duration histogram
- `http_active_connections`: Current active HTTP connections

#### Contact Form Metrics
- `contact_form_submissions_total`: Form submissions by subject and status
- Contact success/failure rates
- Subject category distribution

#### Database Metrics
- `database_connections_active`: Active database connections
- `database_connections_idle`: Idle database connections
- `database_query_duration_seconds`: Query execution time
- `database_connections_failed_total`: Failed connection attempts

#### System Metrics
- `application_info`: Application version and environment info
- Standard Node.js metrics (CPU, memory, garbage collection)

### Alert Rules Configured

#### Critical Alerts
- **Application Down**: Triggers after 5 minutes of downtime
- **Database Connection Failed**: Immediate alert on connection failures
- **Kubernetes Node Not Ready**: Alert after 10 minutes

#### Warning Alerts
- **High Error Rate**: >5% error rate for 2 minutes
- **High Response Time**: >500ms 95th percentile for 5 minutes
- **High Memory Usage**: >80% memory utilization
- **High CPU Usage**: >80% CPU utilization

### Deployment Instructions

#### Quick Deployment
```bash
# Deploy complete monitoring stack
./monitoring/deploy-monitoring.sh

# Test deployment
./monitoring/test-monitoring.sh
```

#### Manual Deployment
```bash
# Apply in order
kubectl apply -f monitoring/namespace.yaml
kubectl apply -f monitoring/prometheus-config.yaml
kubectl apply -f monitoring/prometheus-deployment.yaml
kubectl apply -f monitoring/node-exporter.yaml
kubectl apply -f monitoring/grafana-config.yaml
kubectl apply -f monitoring/grafana-dashboards.yaml
kubectl apply -f monitoring/grafana-deployment.yaml
kubectl apply -f monitoring/servicemonitor.yaml
```

#### Access Services
```bash
# Get Grafana URL
kubectl get service grafana -n monitoring

# Port-forward to Prometheus
kubectl port-forward service/prometheus-server 9090:80 -n monitoring

# Test application metrics
curl http://$(kubectl get service devops-hilltop-service -n devops-hilltop -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')/metrics
```

### Resource Requirements

| Component | CPU Request | Memory Request | Storage |
|-----------|-------------|----------------|---------|
| Prometheus | 500m | 2Gi | 20Gi |
| Grafana | 200m | 512Mi | 5Gi |
| Node Exporter | 100m | 128Mi | - |
| **Total** | **800m** | **2.6Gi** | **25Gi** |

### Cost Analysis (eu-central-1)

| Resource | Monthly Cost |
|----------|--------------|
| GP3 Storage (25Gi) | $3.00 |
| Network Load Balancer | $18.00 |
| Data Processing | $2.00 |
| **Total** | **$23.00** |

### Security Features

#### Network Security
- Prometheus accessible only within cluster
- Grafana protected by LoadBalancer security groups
- Node Exporter uses read-only system access

#### Data Protection
- Persistent volumes encrypted with AWS managed keys
- RBAC configured with minimal required permissions
- Network policies isolate monitoring traffic

### Monitoring Targets

#### Automatic Discovery
- Kubernetes API server
- All cluster nodes via Node Exporter
- DevOps Hilltop application pods
- Kubernetes services with annotations

#### Service Annotations Required
```yaml
annotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "5000"
  prometheus.io/path: "/metrics"
```

### Dashboard Features

#### Real-time Monitoring
- 30-second refresh rate
- Live application metrics
- Interactive time range selection
- Drill-down capabilities

#### Business Metrics
- Contact form conversion rates
- User engagement patterns
- System performance correlation
- Cost tracking integration

### Troubleshooting Guide

#### Common Issues
1. **Prometheus not scraping targets**
   ```bash
   kubectl logs deployment/prometheus-server -n monitoring
   kubectl get servicemonitor -n monitoring
   ```

2. **Grafana dashboards not loading**
   ```bash
   kubectl logs deployment/grafana -n monitoring
   kubectl get configmap grafana-dashboards -n monitoring
   ```

3. **High memory usage**
   ```bash
   kubectl top pods -n monitoring
   kubectl describe pod <prometheus-pod> -n monitoring
   ```

#### Performance Optimization
- Reduce metrics retention for high-cardinality data
- Implement recording rules for complex queries
- Use metric relabeling to filter unnecessary metrics
- Scale Prometheus horizontally if needed

### Integration Points

#### CI/CD Pipeline Integration
- Deployment health checks via metrics
- Automated rollback based on error rates
- Performance regression detection
- Capacity planning metrics

#### Alerting Integration
- Slack notifications for critical alerts
- Email notifications for warnings
- PagerDuty escalation for production issues
- Webhook integration for custom actions

This monitoring stack provides comprehensive observability for the DevOps Hilltop application, enabling proactive monitoring, quick issue resolution, and data-driven decision making.