# Terraform EKS Infrastructure

This Terraform configuration creates a complete AWS EKS cluster infrastructure for the DevOps with Hilltop application.

## Architecture

### Network Infrastructure (3-Tier Architecture)
- **VPC**: Custom VPC with CIDR 10.0.0.0/16
- **Web Tier**: 3 public subnets (10.0.0.0/24, 10.0.1.0/24, 10.0.2.0/24) for LoadBalancers
- **Application Tier**: 3 private subnets (10.0.3.0/24, 10.0.4.0/24, 10.0.5.0/24) for EKS nodes
- **Data Tier**: 3 database subnets (10.0.6.0/24, 10.0.7.0/24, 10.0.8.0/24) for data storage
- **NAT Gateways**: 3 NAT gateways for high availability across all AZs
- **Internet Gateway**: For public subnet internet access
- **Route Tables**: Separate routing for each tier

### EKS Cluster
- **Cluster Name**: devops-hilltop-cluster
- **Kubernetes Version**: 1.28
- **Node Group**: 2 t3.medium instances (desired), scales 1-3
- **Location**: eu-central-1 region
- **Networking**: Private worker nodes, public API endpoint

### Security
- **Cluster Security Group**: Controls access to EKS control plane
- **Node Security Group**: Controls worker node traffic
- **NodePort Access**: Opens ports 30000-32767 for application access
- **IAM Roles**: Separate roles for cluster and worker nodes

## Prerequisites

1. **AWS CLI configured** with appropriate credentials
2. **Terraform installed** (version >= 1.0)
3. **kubectl installed** for cluster management
4. **Sufficient AWS permissions** for:
   - VPC and networking resources
   - EKS cluster and node groups
   - IAM roles and policies
   - CloudWatch log groups

## Usage

### 1. Initialize Terraform
```bash
cd terraform
terraform init
```

### 2. Plan Infrastructure
```bash
terraform plan
```

### 3. Apply Configuration
```bash
terraform apply
```

### 4. Configure kubectl
```bash
aws eks update-kubeconfig --region eu-central-1 --name devops-hilltop-cluster
```

### 5. Verify Cluster
```bash
kubectl get nodes
kubectl get pods -A
```

### 6. Install AWS Load Balancer Controller
```bash
# Apply the controller manifest (update ACCOUNT_ID first)
kubectl apply -f k8s/aws-load-balancer-controller.yaml

# Or install via Helm
helm repo add eks https://aws.github.io/eks-charts
helm repo update
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=devops-hilltop-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

### 7. Deploy Application with LoadBalancer
```bash
# Apply all manifests including GP3 storage class
kubectl apply -f k8s/

# Verify LoadBalancer service
kubectl get service devops-hilltop-service -n devops-hilltop
```

## Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `aws_region` | AWS region | eu-central-1 |
| `cluster_name` | EKS cluster name | devops-hilltop-cluster |
| `kubernetes_version` | Kubernetes version | 1.28 |
| `node_instance_type` | EC2 instance type | t3.medium |
| `node_group_desired_size` | Desired number of nodes | 2 |
| `vpc_cidr` | VPC CIDR block | 10.0.0.0/16 |

## Outputs

The configuration provides these outputs:
- `cluster_endpoint`: EKS API server endpoint
- `cluster_certificate_authority_data`: CA certificate for cluster access
- `vpc_id`: VPC identifier
- `kubeconfig_command`: Command to configure kubectl

## Cost Considerations

**Estimated Monthly Costs (eu-central-1):**
- EKS Control Plane: ~$73/month
- 2x t3.medium instances: ~$60/month
- 3x NAT Gateways: ~$48/month
- Network Load Balancer: ~$18/month
- GP3 Storage (10GB): ~$1/month
- **Total: ~$200/month**

**Cost Optimization Tips:**
- Use Spot instances for non-production workloads
- Consider single NAT gateway for development environments
- Enable cluster autoscaler to scale down during low usage

## Security Best Practices

1. **Network Security**
   - Worker nodes in private subnets
   - Security groups with minimal required access
   - VPC endpoints for AWS services (optional)

2. **Access Control**
   - Use IAM roles for service accounts (IRSA)
   - Enable audit logging
   - Regular security updates

3. **Monitoring**
   - CloudWatch logging enabled
   - Monitor cluster and node metrics
   - Set up alerts for unusual activity

## Deployment Integration

This infrastructure works with the application's CI/CD pipeline:

1. **CircleCI Pipeline** deploys applications to this cluster
2. **Kubernetes Manifests** in `/k8s` directory target this infrastructure
3. **NodePort Service** exposes application on port 30080

## Cleanup

To destroy the infrastructure:
```bash
terraform destroy
```

**Warning**: This will delete all resources including data. Ensure you have backups if needed.

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Verify AWS credentials and permissions
   - Check IAM user has EKS and EC2 full access

2. **Cluster Creation Timeout**
   - Check subnet configurations
   - Verify internet connectivity for private subnets

3. **Node Group Issues**
   - Ensure subnets have available IP addresses
   - Check security group configurations

### Useful Commands

```bash
# Check cluster status
aws eks describe-cluster --name devops-hilltop-cluster --region eu-central-1

# View worker nodes
kubectl get nodes -o wide

# Check system pods
kubectl get pods -n kube-system

# View cluster events
kubectl get events --sort-by=.metadata.creationTimestamp
```

## Integration with Application

After cluster creation, deploy the application:

```bash
# Apply GP3 storage class first
kubectl apply -f k8s/storageclass-gp3.yaml

# Apply all Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get deployments -n devops-hilltop

# Get LoadBalancer URL
LOAD_BALANCER_URL=$(kubectl get service devops-hilltop-service -n devops-hilltop -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "Application URL: http://$LOAD_BALANCER_URL"

# Monitor LoadBalancer provisioning
kubectl get service devops-hilltop-service -n devops-hilltop -w
```

The application will be accessible via the AWS Network Load Balancer endpoint on port 80.