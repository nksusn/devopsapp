output "cluster_id" {
  description = "EKS cluster ID"
  value       = var.use_existing_cluster ? data.aws_eks_cluster.existing[0].id : aws_eks_cluster.devops_hilltop[0].id
}

output "cluster_arn" {
  description = "EKS cluster ARN"
  value       = var.use_existing_cluster ? data.aws_eks_cluster.existing[0].arn : aws_eks_cluster.devops_hilltop[0].arn
}

output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = var.use_existing_cluster ? data.aws_eks_cluster.existing[0].endpoint : aws_eks_cluster.devops_hilltop[0].endpoint
}

output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = var.use_existing_cluster ? null : aws_eks_cluster.devops_hilltop[0].vpc_config[0].cluster_security_group_id
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the cluster"
  value       = var.use_existing_cluster ? data.aws_eks_cluster.existing[0].certificate_authority[0].data : aws_eks_cluster.devops_hilltop[0].certificate_authority[0].data
}

output "cluster_version" {
  description = "The Kubernetes version for the EKS cluster"
  value       = var.use_existing_cluster ? data.aws_eks_cluster.existing[0].version : aws_eks_cluster.devops_hilltop[0].version
}

output "vpc_id" {
  description = "ID of the VPC where the cluster is deployed"
  value       = aws_vpc.devops_hilltop_vpc.id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.devops_hilltop_vpc.cidr_block
}

output "public_subnets" {
  description = "List of IDs of public subnets (Web Tier)"
  value       = aws_subnet.public_subnet[*].id
}

output "private_subnets" {
  description = "List of IDs of private subnets (Application Tier)"
  value       = aws_subnet.private_subnet[*].id
}

output "database_subnets" {
  description = "List of IDs of database subnets (Data Tier)"
  value       = aws_subnet.database_subnet[*].id
}

output "database_subnet_group_name" {
  description = "Name of the database subnet group"
  value       = aws_db_subnet_group.database_subnet_group.name
}

output "node_groups" {
  description = "EKS node groups"
  value       = aws_eks_node_group.devops_hilltop_nodes.arn
}

output "node_security_group_id" {
  description = "ID of the node shared security group"
  value       = aws_security_group.eks_nodes_sg.id
}

output "cluster_primary_security_group_id" {
  description = "The cluster primary security group ID created by EKS"
  value       = aws_eks_cluster.devops_hilltop.vpc_config[0].cluster_security_group_id
}

output "kubeconfig_command" {
  description = "Command to update kubeconfig"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${var.cluster_name}"
}

output "cluster_status" {
  description = "Status of the EKS cluster"
  value       = aws_eks_cluster.devops_hilltop.status
}

output "load_balancer_controller_role_arn" {
  description = "ARN of the AWS Load Balancer Controller IAM role"
  value       = aws_iam_role.aws_load_balancer_controller.arn
}

output "oidc_provider_arn" {
  description = "ARN of the OIDC Provider for EKS"
  value       = aws_iam_openid_connect_provider.eks.arn
}

output "nat_gateway_ips" {
  description = "Elastic IP addresses of NAT Gateways"
  value       = aws_eip.nat_gateway_eip[*].public_ip
}

output "three_tier_architecture_summary" {
  description = "Summary of the 3-tier architecture deployment"
  value = {
    web_tier = {
      description = "Public subnets for LoadBalancer and internet-facing resources"
      subnets     = aws_subnet.public_subnet[*].id
      count       = length(aws_subnet.public_subnet)
    }
    application_tier = {
      description = "Private subnets for EKS worker nodes and application pods"
      subnets     = aws_subnet.private_subnet[*].id
      count       = length(aws_subnet.private_subnet)
    }
    data_tier = {
      description = "Database subnets for PostgreSQL and data storage"
      subnets     = aws_subnet.database_subnet[*].id
      count       = length(aws_subnet.database_subnet)
    }
  }
}