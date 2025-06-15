#!/bin/bash

echo "Fixing EBS CSI driver permissions for gp3 storage..."

# Check if EBS CSI driver service account exists
echo "Checking EBS CSI driver configuration..."
kubectl get serviceaccount ebs-csi-controller-sa -n kube-system || {
    echo "EBS CSI driver not properly configured. Installing..."
    
    # Get cluster info
    CLUSTER_NAME=$(aws eks describe-cluster --name $EKS_CLUSTER_NAME --query 'cluster.name' --output text 2>/dev/null || echo $EKS_CLUSTER_NAME)
    REGION=${AWS_DEFAULT_REGION:-eu-central-1}
    
    # Create IAM role for EBS CSI driver
    cat <<EOF > /tmp/ebs-csi-trust-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):oidc-provider/$(aws eks describe-cluster --name $CLUSTER_NAME --query 'cluster.identity.oidc.issuer' --output text | cut -d '/' -f 3-)"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "$(aws eks describe-cluster --name $CLUSTER_NAME --query 'cluster.identity.oidc.issuer' --output text | cut -d '/' -f 3-):sub": "system:serviceaccount:kube-system:ebs-csi-controller-sa",
          "$(aws eks describe-cluster --name $CLUSTER_NAME --query 'cluster.identity.oidc.issuer' --output text | cut -d '/' -f 3-):aud": "sts.amazonaws.com"
        }
      }
    }
  ]
}
EOF

    # Create or update IAM role
    aws iam create-role \
      --role-name AmazonEKS_EBS_CSI_DriverRole \
      --assume-role-policy-document file:///tmp/ebs-csi-trust-policy.json || true

    # Attach policy
    aws iam attach-role-policy \
      --role-name AmazonEKS_EBS_CSI_DriverRole \
      --policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy

    # Install EBS CSI driver addon
    aws eks create-addon \
      --cluster-name $CLUSTER_NAME \
      --addon-name aws-ebs-csi-driver \
      --service-account-role-arn arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/AmazonEKS_EBS_CSI_DriverRole \
      --resolve-conflicts OVERWRITE || {
        echo "EBS CSI addon already exists, updating..."
        aws eks update-addon \
          --cluster-name $CLUSTER_NAME \
          --addon-name aws-ebs-csi-driver \
          --service-account-role-arn arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/AmazonEKS_EBS_CSI_DriverRole \
          --resolve-conflicts OVERWRITE
      }
}

echo "Waiting for EBS CSI driver to be ready..."
kubectl rollout status daemonset/ebs-csi-node -n kube-system --timeout=300s
kubectl rollout status deployment/ebs-csi-controller -n kube-system --timeout=300s

echo "EBS CSI driver configuration complete!"