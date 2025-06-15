# Data sources for existing EKS cluster (optional)
# Use these when deploying to an existing cluster instead of creating new one

# Existing EKS Cluster
data "aws_eks_cluster" "existing" {
  count = var.use_existing_cluster ? 1 : 0
  name  = var.existing_cluster_name
}

data "aws_eks_cluster_auth" "existing" {
  count = var.use_existing_cluster ? 1 : 0
  name  = var.existing_cluster_name
}

# Existing VPC
data "aws_vpc" "existing" {
  count = var.use_existing_cluster ? 1 : 0
  tags = {
    Name = var.existing_vpc_name
  }
}

# Existing Subnets (automatically discover public subnets)
data "aws_subnets" "existing_public" {
  count = var.use_existing_cluster ? 1 : 0
  
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.existing[0].id]
  }
  
  tags = {
    "kubernetes.io/role/elb" = "1"
  }
}

data "aws_subnets" "existing_private" {
  count = var.use_existing_cluster ? 1 : 0
  
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.existing[0].id]
  }
  
  tags = {
    "kubernetes.io/role/internal-elb" = "1"
  }
}

# Get subnet details
data "aws_subnet" "existing_public_details" {
  count = var.use_existing_cluster ? length(data.aws_subnets.existing_public[0].ids) : 0
  id    = data.aws_subnets.existing_public[0].ids[count.index]
}

data "aws_subnet" "existing_private_details" {
  count = var.use_existing_cluster ? length(data.aws_subnets.existing_private[0].ids) : 0
  id    = data.aws_subnets.existing_private[0].ids[count.index]
}