# CircleCI Configuration Guide

This document explains the complete CircleCI pipeline configuration for the DEVOPS WITH HILLTOP project, detailing each job, step, and workflow.

## Overview

The pipeline implements a comprehensive CI/CD workflow with automated testing, Docker image building, and deployment to AWS EKS clusters with PostgreSQL database support.

## Configuration Structure

### Orbs and Dependencies

```yaml
orbs:
  node: circleci/node@5.1.0      # Node.js operations
  docker: circleci/docker@2.2.0  # Docker build and push
  aws-cli: circleci/aws-cli@4.0.0 # AWS CLI (not actively used)
```

### Executors

#### node-executor
- **Image**: `cimg/node:20.9.0`
- **Purpose**: Runs Node.js tests and application builds
- **Usage**: Test job execution

#### aws-executor
- **Image**: `cimg/aws:2023.09`
- **Purpose**: AWS operations and Kubernetes deployments
- **Features**: Pre-installed AWS CLI, kubectl, and Docker
- **Usage**: Staging and production deployments

## Jobs Breakdown

### 1. Test Job

**Purpose**: Validates code quality and runs automated tests

**Steps**:
1. **Checkout**: Downloads source code from repository
2. **Node Install and Test**: 
   - Installs Node.js dependencies using package-lock.json
   - Executes test suite with `npm test`
   - Validates application functionality before deployment

**Execution Context**: Runs on every commit to ensure code quality

### 2. Build and Push Job

**Purpose**: Creates Docker images and pushes to Docker Hub registry

**Prerequisites**: Test job must pass successfully

**Steps**:

1. **Checkout**: Downloads source code
2. **Setup Remote Docker**: 
   - Enables Docker layer caching for faster builds
   - Uses default CircleCI Docker version for compatibility
3. **Docker Authentication**:
   - Authenticates with Docker Hub using credentials
   - Environment variables: `DOCKER_USERNAME`, `DOCKER_PASSWORD`
4. **Build Git Revision Image**:
   - Creates Docker image tagged with Git commit SHA
   - Ensures unique versioning for each deployment
5. **Push Git Revision Image**: Pushes commit-specific image to registry
6. **Build Latest Image**: Creates image with `latest` tag
7. **Push Latest Image**: Pushes latest tag for development use

**Registry**: `hilltopconsultancy/devops-hilltop`

### 3. Deploy Staging Job

**Purpose**: Deploys application to staging environment on EKS

**Prerequisites**: Build and push job completion

**Branch Trigger**: `develop` branch only

**Steps**:

1. **Checkout**: Downloads source code and Kubernetes manifests
2. **Configure kubectl for EKS**:
   - Updates kubeconfig using AWS CLI
   - Connects to EKS cluster specified in `$EKS_CLUSTER_NAME`
   - Uses region from `$AWS_DEFAULT_REGION`
3. **Update Kubernetes Manifests**:
   - Replaces `latest` tag with Git commit SHA in deployment.yaml
   - Ensures staging uses specific commit version
4. **Deploy to EKS Staging**:
   - Applies all Kubernetes manifests: `kubectl apply -f k8s/`
   - Includes: namespace, secrets, ConfigMaps, PostgreSQL, application
   - Waits for PostgreSQL rollout completion (300s timeout)
   - Waits for application rollout completion (300s timeout)
5. **Initialize Database**:
   - Executes database schema creation: `npm run db:push`
   - Sets up initial database structure in PostgreSQL
6. **Verify Deployment**:
   - Lists running pods for status verification
   - Confirms successful staging deployment

**Environment Variables Required**:
- `AWS_ACCESS_KEY_ID`: AWS authentication
- `AWS_SECRET_ACCESS_KEY`: AWS authentication  
- `AWS_DEFAULT_REGION`: AWS region (eu-central-1)
- `EKS_CLUSTER_NAME`: Target EKS cluster name

### 4. Deploy Production Job

**Purpose**: Deploys application to production environment with enhanced configuration

**Prerequisites**: Manual approval after staging success

**Branch Trigger**: `main` branch only

**Steps**:

1. **Checkout**: Downloads source code and manifests
2. **Configure kubectl for EKS**: Same as staging
3. **Update Kubernetes Manifests for Production**:
   - Replaces `latest` tag with Git commit SHA
   - Scales replicas from 3 to 5 for production load
   - Ensures production-grade resource allocation
4. **Deploy to EKS Production**:
   - Applies all Kubernetes manifests
   - Extended timeout (600s) for production stability
   - Waits for PostgreSQL and application readiness
5. **Initialize Production Database**:
   - Sets up production database schema
   - Ensures data consistency and structure
6. **Verify Production Deployment**:
   - Confirms pod status and health
   - Retrieves LoadBalancer URL for external access
   - Displays production application URL

## Kubernetes Manifests Deployed

The pipeline deploys the following resources in order:

### Infrastructure
- **Namespace**: `devops-hilltop` isolation
- **StorageClass**: GP3 storage for PostgreSQL
- **ConfigMap**: Application configuration
- **Secrets**: Database credentials and application secrets

### Database Layer
- **PostgreSQL Secret**: Database authentication
- **PostgreSQL PVC**: 10Gi persistent storage
- **PostgreSQL Deployment**: Database container with health checks
- **PostgreSQL Service**: Internal cluster communication

### Application Layer  
- **Application Deployment**: Node.js application containers
- **LoadBalancer Service**: External access via AWS NLB
- **HPA**: Horizontal Pod Autoscaler for scaling

### Optional Components
- **AWS Load Balancer Controller**: If not already installed
- **Monitoring Stack**: Prometheus and Grafana (separate script)

## Workflow Configuration

### Build-Test-Deploy Workflow

**Execution Flow**:
1. **test** → Runs on all commits
2. **build-and-push** → Requires test success, runs on main/develop
3. **deploy-staging** → Requires build success, develop branch only
4. **hold-for-approval** → Manual gate for production
5. **deploy-production** → Requires approval, main branch only

### Branch Strategy
- **develop**: Automatic staging deployment
- **main**: Manual approval required for production
- **feature branches**: Test only, no deployment

## Environment Variables Setup

Configure these in CircleCI project settings:

### AWS Authentication
```
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
AWS_DEFAULT_REGION=eu-central-1
EKS_CLUSTER_NAME=<your-cluster-name>
```

### Docker Hub Authentication
```
DOCKER_USERNAME=hilltopconsultancy
DOCKER_PASSWORD=<your-dockerhub-token>
```

## Database Configuration

### PostgreSQL Setup
- **Image**: postgres:15-alpine
- **Storage**: 10Gi GP3 persistent volume
- **Resources**: 256Mi-512Mi memory, 250m-500m CPU
- **Health Checks**: pg_isready probes
- **Connection**: postgres-service:5432

### Database Initialization
- Schema creation via Drizzle ORM
- Automatic migration on deployment
- Categories and resources tables setup

## Monitoring and Verification

### Deployment Verification
- Pod status monitoring
- Rollout status confirmation
- LoadBalancer URL retrieval
- Basic connectivity validation

### Monitoring Stack (Optional)
Deploy comprehensive monitoring with:
```bash
./monitoring/deploy-monitoring.sh
```

Includes:
- Prometheus metrics collection
- Grafana dashboards
- Node Exporter system metrics
- Application performance monitoring

## Security Considerations

### Secrets Management
- All sensitive data in Kubernetes secrets
- Base64 encoded credentials
- Environment variable isolation
- No hardcoded passwords in manifests

### Network Security
- LoadBalancer with security groups
- Internal service communication
- Namespace isolation
- Resource limits and quotas

## Troubleshooting

### Common Issues

1. **AWS Authentication Failures**
   - Verify environment variables in CircleCI
   - Check IAM permissions for EKS access

2. **Docker Build Failures**
   - Ensure Docker Hub credentials are correct
   - Verify Dockerfile syntax and dependencies

3. **Database Connection Issues**
   - Check PostgreSQL pod status
   - Verify secret configurations
   - Review network policies

4. **LoadBalancer Provisioning**
   - AWS Load Balancer Controller must be installed
   - Verify subnet tags for LoadBalancer discovery
   - Check security group configurations

### Logs and Debugging
- Use `kubectl logs` for pod troubleshooting
- Monitor CircleCI job output for detailed error messages
- Review AWS CloudWatch for EKS cluster logs

## Maintenance

### Regular Updates
- Monitor orb versions for security updates
- Update base images for latest patches
- Review and rotate secrets periodically
- Monitor resource usage and scaling needs

### Scaling Considerations
- Adjust replica counts based on traffic
- Monitor database performance and storage
- Review LoadBalancer capacity and costs
- Consider multi-region deployment for HA