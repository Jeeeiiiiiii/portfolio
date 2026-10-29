---
title: Deploying 2-tier Architecture on AWS through Terraform
date: 2024-12-01
excerpt: Learn how to quickly deploy scalable, secure 2-tier architectures on AWS using Terraform's powerful infrastructure-as-code features.
image: /terraform_aws.jpg
tags: [AWS, Terraform, DevOps, Infrastructure as Code, Cloud Architecture]
---

Terraform has revolutionized the way we deploy infrastructure on AWS. By using Infrastructure as Code (IaC), we can create consistent, version-controlled, and repeatable deployments.

## 📃 List of Services

We'll be using the following AWS services for our two-tier architecture:

- Amazon VPC for networking
- EC2 for application tier
- RDS for database tier
- Security Groups for access control

## 💡 Plan of Execution

Our execution plan follows these steps:

1. Set up VPC and networking components
2. Create security groups
3. Deploy EC2 instances
4. Configure RDS database

## 🏠 Two-tier Architecture

The two-tier architecture separates our application into:

- Frontend/Application Tier (Public Subnet)
- Database Tier (Private Subnet)

## 🏡 Architecture

Our architecture ensures high availability and security through:

- Multiple Availability Zones
- Public and Private Subnets
- NAT Gateway for private subnet access

## 🖥️ Local Setup

Before we begin, ensure you have the following installed:

```bash
# Install Terraform
brew install terraform # For macOS
choco install terraform # For Windows

# Install AWS CLI
brew install awscli # For macOS
choco install awscli # For Windows
```

## 🚨 IAM Secret Key

Configure your AWS credentials securely:

```text
aws configure
AWS Access Key ID: [Your Access Key]
AWS Secret Access Key: [Your Secret Key]
Default region name: [Your Region]
Default output format: json
```

## ✍️ Write Terraform Files

Create the following Terraform configuration files:

```hcl
# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "two-tier-vpc"
  }
}

# EC2 Instance
resource "aws_instance" "app_server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.public.id
  tags = {
    Name = "app-server"
  }
}

# RDS Instance
resource "aws_db_instance" "database" {
  engine               = "mysql"
  instance_class      = "db.t3.micro"
  allocated_storage   = 20
  subnet_group_name   = aws_db_subnet_group.private.name
}
```

## 🖥️ Outputs

After successful deployment, you should see the following outputs:

- VPC ID
- EC2 Instance Public IP
- RDS Endpoint

## 📚 Resources

- [Terraform Documentation](https://www.terraform.io/docs)
- [AWS Documentation](https://aws.amazon.com/documentation/)
- [AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
