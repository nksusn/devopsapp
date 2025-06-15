# Deploying to Existing EKS Cluster

This guide shows how to use the Terraform configuration with your existing EKS cluster instead of creating a new one.

## Prerequisites

- Existing EKS cluster with AWS Load Balancer Controller installed
- VPC with properly tagged subnets for LoadBalancer discovery
- AWS CLI configured with appropriate permissions

## Subnet Tagging Requirements

For the LoadBalancer to work correctly, ensure your existing subnets are properly tagged:

### Public Subnets (for LoadBalancer)
```bash
# Tag your public subnets
aws ec2 create-tags --resources subnet-xxxxxxxxx --tags \
  Key=kubernetes.io/role/elb,Value=1 \
  Key=kubernetes.io/cluster/YOUR_CLUSTER_NAME,Value=shared
```

### Private Subnets (for worker nodes)
```bash
# Tag your private subnets
aws ec2 create-tags --resources subnet-yyyyyyyyy --tags \
  Key=kubernetes.io/role/internal-elb,Value=1 \
  Key=kubernetes.io/cluster/YOUR_CLUSTER_NAME,Value=shared
```

## Deployment Options

### Option 1: Use Existing Cluster (Recommended for you)

Create a `terraform.tfvars` file:
```hcl
# Use existing cluster configuration
use_existing_cluster = true
existing_cluster_name = "your-existing-cluster-name"
existing_vpc_name = "your-vpc-name"

# Optional: override defaults
aws_region = "eu-central-1"
environment = "production"
```

Deploy with:
```bash
cd terraform
terraform init
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```

### Option 2: Create New Cluster

Use default configuration:
```bash
cd terraform
terraform init
terraform apply
```

## LoadBalancer Service Configuration

The service is configured with modern AWS Load Balancer Controller annotations:

```yaml
annotations:
  service.beta.kubernetes.io/aws-load-balancer-type: external
  service.beta.kubernetes.io/aws-load-balancer-nlb-target-type: ip
  service.beta.kubernetes.io/aws-load-balancer-scheme: internet-facing
```

These annotations will:
- Automatically discover public subnets tagged with `kubernetes.io/role/elb=1`
- Create a Network Load Balancer targeting pod IPs directly
- Make the service internet-facing

## Deployment Steps

### 1. Apply Storage Class
```bash
kubectl apply -f k8s/storageclass-gp3.yaml
```

### 2. Deploy Application
```bash
kubectl apply -f k8s/
```

### 3. Verify LoadBalancer
```bash
# Check service status
kubectl get service devops-hilltop-service -n devops-hilltop

# Wait for LoadBalancer provisioning
kubectl get service devops-hilltop-service -n devops-hilltop -w

# Get LoadBalancer URL
kubectl get service devops-hilltop-service -n devops-hilltop -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

## Troubleshooting

### LoadBalancer Pending
If the LoadBalancer stays in pending state:

```bash
# Check AWS Load Balancer Controller logs
kubectl logs -n kube-system deployment/aws-load-balancer-controller

# Verify subnet tags
aws ec2 describe-subnets --filters "Name=tag:kubernetes.io/role/elb,Values=1"

# Check security groups
kubectl describe service devops-hilltop-service -n devops-hilltop
```

### Common Issues

1. **Missing subnet tags**: Ensure public subnets have `kubernetes.io/role/elb=1`
2. **Load Balancer Controller not installed**: Install via Helm or EKS add-on
3. **Insufficient permissions**: Verify IAM roles have LoadBalancer permissions

### Manual LoadBalancer Controller Installation

If not already installed:
```bash
# Install via Helm
helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=YOUR_CLUSTER_NAME \
  --set serviceAccount.create=true \
  --set serviceAccount.annotations."eks\.amazonaws\.com/role-arn"=arn:aws:iam::ACCOUNT_ID:role/AmazonEKSLoadBalancerControllerRole
```

## Cost Considerations

When using existing cluster:
- No additional EKS control plane costs
- LoadBalancer: ~$18/month for Network Load Balancer
- GP3 storage: ~$1/month for 10GB
- Data transfer costs apply based on usage

## Verification Commands

```bash
# Test application accessibility
LOAD_BALANCER_URL=$(kubectl get service devops-hilltop-service -n devops-hilltop -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl -f http://$LOAD_BALANCER_URL

# Verify 3-tier data flow
curl -f http://$LOAD_BALANCER_URL/dashboard

# Check database connectivity
kubectl exec -n devops-hilltop deployment/devops-hilltop-deployment -- npm run db:push
```

The application will be accessible via the LoadBalancer URL on port 80, providing enterprise-grade access patterns without hardcoded subnet dependencies.