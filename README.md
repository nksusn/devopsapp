# DevOps with Hilltop

A comprehensive 3-tier DevOps resources platform built with modern web technologies, providing curated tools, tutorials, and best practices for DevOps professionals.

## 🚀 Architecture

This application follows a robust 3-tier architecture:

- **Presentation Tier**: React.js frontend with responsive design
- **Application Tier**: Node.js/Express.js backend with RESTful APIs
- **Data Tier**: PostgreSQL database with Drizzle ORM

## 🛠 Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Shadcn/ui component library
- TanStack Query for data management
- Wouter for routing

### Backend
- Node.js with Express.js
- TypeScript for type safety
- Drizzle ORM for database operations
- Zod for schema validation

### Database
- PostgreSQL for reliable data persistence
- Database migrations with Drizzle Kit

### DevOps & Deployment
- Docker for containerization
- Kubernetes for orchestration with NodePort service
- CircleCI for CI/CD pipeline with AWS EKS deployment
- AWS EKS for production Kubernetes cluster

## 📋 Prerequisites

### Local Development
- Node.js 20.x or higher
- PostgreSQL 13+ (or use Docker)

### AWS EKS Deployment
- AWS CLI configured with appropriate permissions
- AWS EKS cluster (see setup instructions below)
- Docker Hub account for image registry
- CircleCI account for CI/CD pipeline

### Required AWS Permissions
Your AWS IAM user/role needs the following permissions:
- EKS cluster access (eks:DescribeCluster, eks:ListClusters)
- EC2 permissions for EKS node groups
- IAM permissions for EKS service roles

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd devops-hilltop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   # Push database schema
   npm run db:push
   
   # Optional: Seed with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/devops_hilltop
PGUSER=username
PGPASSWORD=password
PGHOST=localhost
PGPORT=5432
PGDATABASE=devops_hilltop

# Application Configuration
NODE_ENV=development
PORT=5000
```

## 🐳 Docker Deployment

### Build and Run with Docker

```bash
# Build the Docker image
docker build -t devops-hilltop:latest .

# Run the container
docker run -p 5000:5000 \
  -e DATABASE_URL=your_database_url \
  devops-hilltop:latest
```

### Using Docker Compose

```bash
# Start all services (app + PostgreSQL)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☸️ AWS EKS Deployment Setup

### Step 1: Create AWS EKS Cluster

1. **Install required tools**
   ```bash
   # Install AWS CLI
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install
   
   # Install eksctl
   curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
   sudo mv /tmp/eksctl /usr/local/bin
   
   # Install kubectl
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   chmod +x kubectl
   sudo mv kubectl /usr/local/bin/
   ```
---

### Step 2: Associate IAM OIDC Provider and Create IAM Role for EBS CSI Driver

#### 2.1: Associate the OIDC Provider with Your Cluster

```bash
eksctl utils associate-iam-oidc-provider \
  --cluster eks-systems \
  --region eu-central-1 \
  --approve
```

#### 2.2: Verify the OIDC Provider

```bash
aws eks describe-cluster --name eks-systems --query "cluster.identity.oidc.issuer" --output text
```

You should see a URL like:

```
https://oidc.eks.eu-central-1.amazonaws.com/id/<OIDC_ID>
```

#### 2.3: Create IAM Service Account and Attach Policy

```bash
eksctl create iamserviceaccount \
  --cluster=eks-systems \
  --namespace=kube-system \
  --name=ebs-csi-controller-sa \
  --attach-policy-arn=arn:aws:iam::050451396180:policy/AmazonEKS_EBS_CSI_Driver_Policy_eks-systems \
  --approve \
  --override-existing-serviceaccounts \
  --region=eu-central-1
```

#### 2.4: Verify the Service Account

```bash
kubectl describe serviceaccount ebs-csi-controller-sa -n kube-system
kubectl rollout restart deployment ebs-csi-controller -n kube-system
```

Check for this annotation:

```
Annotations: eks.amazonaws.com/role-arn: arn:aws:iam::050451396180:role/eksctl-eks-systems-addon-iamserviceaccount-kube-s-Role1-XXXXXX
```

---

3. **Create EKS cluster**
   ```bash
   eksctl create cluster \
     --name devops-hilltop-cluster \
     --region eu-central-1 \
     --nodegroup-name workers \
     --node-type t3.medium \
     --nodes 3 \
     --nodes-min 2 \
     --nodes-max 5 \
     --managed
   ```

### Step 2: Manual Kubernetes Deployment

1. **Configure kubectl for your cluster**
   ```bash
   aws eks update-kubeconfig --region eu-central-1 --name devops-hilltop-cluster
   ```

2. **Deploy application to EKS**
   ```bash
   # Apply Kubernetes manifests
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/configmap.yaml
   kubectl apply -f k8s/secret.yaml
   kubectl apply -f k8s/deployment.yaml
   kubectl apply -f k8s/service.yaml
   kubectl apply -f k8s/hpa.yaml
   ```

3. **Access your application**
   ```bash
   # Get the NodePort
   kubectl get service devops-hilltop-service -n devops-hilltop
   
   # Get node external IPs
   kubectl get nodes -o wide
   
   # Access via: http://<NODE_EXTERNAL_IP>:30080
   ```

### Step 3: Setup CircleCI for Automated Deployment

1. **Connect your repository to CircleCI**
   - Go to [CircleCI](https://circleci.com)
   - Sign up/Login with your GitHub/Bitbucket account
   - Add your project repository

2. **Configure CircleCI Environment Variables**
   
   In your CircleCI project settings, add these environment variables:
   
   **Docker Hub Credentials:**
   ```
   DOCKER_USERNAME=hilltopconsultancy
   DOCKER_PASSWORD=your_dockerhub_access_token
   ```
   
   **AWS Credentials:**
   ```
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_DEFAULT_REGION=eu-central-1
   ```
   
   **EKS Configuration:**
   ```
   EKS_CLUSTER_NAME=devops-hilltop-cluster
   ```

3. **Deployment Workflow**
   - Push to `develop` branch → Automatically deploys to staging
   - Push to `main` branch → Requires manual approval for production deployment
   - Each deployment uses the git commit SHA as the Docker image tag

## 📊 Monitoring Stack

Deploy comprehensive monitoring with Prometheus and Grafana:

### Quick Monitoring Deployment
```bash
# Deploy complete monitoring stack
./monitoring/deploy-monitoring.sh

# Test monitoring components
./monitoring/test-monitoring.sh
```

### Custom Dashboards Included
- **DevOps Hilltop Application**: Request rates, contact form metrics, database performance
- **Kubernetes Cluster**: Node utilization, pod status, resource usage
- **Infrastructure Overview**: LoadBalancer health, storage utilization, service metrics

### Access Monitoring
```bash
# Get Grafana URL (admin/admin)
kubectl get service grafana -n monitoring

# Access Prometheus locally
kubectl port-forward service/prometheus-server 9090:80 -n monitoring
```

### Application Metrics
The application automatically exposes metrics at `/metrics` endpoint:
- HTTP request rates and response times
- Contact form submission tracking
- Database connection metrics
- System performance indicators

## 🔄 CI/CD Pipeline

The simplified CircleCI pipeline handles building, testing, and deploying your application to AWS EKS:

### Pipeline Stages

1. **Test**: Runs comprehensive application tests and basic linting
2. **Build & Push**: Builds Docker image and pushes to Docker Hub  
3. **Deploy Staging**: Automatic deployment to EKS (develop branch)
4. **Deploy Production**: Manual approval required (main branch)

### Key Simplifications

- Removed Trivy security scanning for faster builds
- Uses `kubectl apply -f k8s/` for directory-level deployment
- Assumes kubectl is already available in your EKS cluster
- Custom test runner for reliable test execution

### Branch Strategy

- **develop branch**: Automatically deploys to staging environment
- **main branch**: Requires manual approval before production deployment
- Each deployment uses the git commit SHA as the Docker image tag for traceability

### Accessing Your Application

After deployment, access your application using:
```bash
# Get node external IP and NodePort
kubectl get nodes -o wide
kubectl get service devops-hilltop-service -n devops-hilltop

# Application will be available at:
# http://<NODE_EXTERNAL_IP>:30080
```

## 🏗 Project Structure

```
devops-hilltop/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities and API clients
│   │   └── hooks/          # Custom React hooks
│   └── index.html
├── server/                 # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── db.ts              # Database connection
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema definitions
├── k8s/                   # Kubernetes manifests
├── helm/                  # Helm charts
├── .circleci/            # CI/CD configuration
├── Dockerfile            # Container definition
└── README.md             # This file
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `./test.sh` - Run comprehensive test suite
- `node run-tests.js` - Run custom test runner directly
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## 📊 Database Verification

After submitting data through the application, verify it was properly stored in PostgreSQL:

```sql
-- Connect to database
psql $DATABASE_URL

-- Check all categories
SELECT id, name, description, created_at FROM categories ORDER BY id;

-- Check all resources with their categories
SELECT 
    r.id,
    r.title,
    r.description,
    c.name as category_name,
    r.url,
    r.created_at
FROM resources r 
JOIN categories c ON r.category_id = c.id 
ORDER BY r.id;

-- Check contact submissions
SELECT 
    id,
    name,
    email,
    subject,
    address,
    message,
    created_at
FROM contacts 
ORDER BY created_at DESC;

-- Count records in each table (verify 3-tier data flow)
SELECT 
    'categories' as table_name, 
    COUNT(*) as record_count 
FROM categories
UNION ALL
SELECT 
    'resources', 
    COUNT(*) 
FROM resources
UNION ALL
SELECT 
    'contacts', 
    COUNT(*) 
FROM contacts;
```

## 🌟 Features

### Core Features
- **Resource Management**: Create, read, update, and delete DevOps resources
- **Category Organization**: Organize resources by DevOps practice areas
- **Search & Filter**: Advanced search and filtering capabilities
- **Contact System**: Contact form for user feedback and suggestions
- **Admin Dashboard**: Full administrative interface

### Technical Features
- **Responsive Design**: Mobile-first, responsive interface
- **SEO Optimized**: Meta tags and Open Graph support
- **Type Safety**: Full TypeScript implementation
- **Database Migrations**: Schema versioning with Drizzle
- **Health Checks**: Application health monitoring
- **Security**: Input validation, SQL injection prevention
- **Performance**: Optimized queries and caching

## 📊 Monitoring & Observability

### Health Checks
- Application health endpoint: `/health`
- Database connectivity monitoring
- Kubernetes liveness and readiness probes

### Logging
- Structured logging with request tracking
- Error logging and monitoring
- Performance metrics collection

## 🔒 Security Features

- Input validation with Zod schemas
- SQL injection prevention with ORM
- Security headers and CORS configuration
- Container security best practices
- Non-root container execution
- Read-only root filesystem

## 🔧 Required Environment Variables for CircleCI

To set up automated deployment, you'll need to configure these environment variables in your CircleCI project settings:

### Docker Hub Configuration
```
DOCKER_USERNAME=your_dockerhub_username
DOCKER_PASSWORD=your_dockerhub_access_token
```

### AWS Configuration
```
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_DEFAULT_REGION=us-west-2
EKS_CLUSTER_NAME=devops-hilltop-cluster
```

### How to Get These Values

**Docker Hub Access Token:**
1. Login to Docker Hub
2. Go to Account Settings → Security
3. Create a new Access Token
4. Use this token as DOCKER_PASSWORD

**AWS Credentials:**
1. Go to AWS IAM Console
2. Create a new user with programmatic access
3. Attach policies: AmazonEKSClusterPolicy, AmazonEKSWorkerNodePolicy, AmazonEC2ContainerRegistryPowerUser
4. Save the Access Key ID and Secret Access Key

## 🚀 Quick Deployment Guide

### Option 1: Automated Deployment via CircleCI
1. Configure the environment variables above
2. Push your code to `develop` branch for staging deployment
3. Push to `main` branch and approve for production deployment

### Option 2: Manual Deployment
Use the kubectl commands in the EKS deployment section above

## 📚 API Documentation

### Endpoints

#### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

#### Resources
- `GET /api/resources` - List resources (with optional filtering)
- `GET /api/resources/featured` - Get featured resources
- `GET /api/resources/:id` - Get resource by ID
- `POST /api/resources` - Create new resource
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource

#### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contacts` - List contact messages (admin only)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For support and questions:
- Open an issue on GitHub
- Contact the DevOps team at devops@hilltop.com
- Check the documentation wiki

## 🔮 Roadmap

- [ ] User authentication and authorization
- [ ] Resource rating and commenting system
- [ ] Advanced search with Elasticsearch
- [ ] GraphQL API
- [ ] Mobile application
- [ ] Integration with external DevOps tools
- [ ] Analytics and reporting dashboard

---

**Built with ❤️ by the DevOps with Hilltop team**