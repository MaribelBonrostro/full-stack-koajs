# API Deployment Guide

This guide explains how to build, push, and deploy the API Docker image to AWS Lambda using Terraform.

## Prerequisites

- AWS CLI installed and configured (`aws configure`)
- Docker installed
- Terraform installed
- AWS account with permissions for ECR, Lambda, and IAM

> **Note:** Replace `<aws_account_id>`, `<aws_region>`, `<tag>`, and `<env>` with your actual values.

---

## 1. Build and Push Docker Image to AWS ECR

**Navigate to the API directory:**

```sh
cd app/api
```

**Build the Docker image for AWS Lambda:**

```sh
docker build -t <aws_account_id>.dkr.ecr.<aws_region>.amazonaws.com/aws-lambda-nodejs-image:<tag> .
```

**Create the ECR repository (only needed once):**

```sh
aws ecr create-repository --repository-name aws-lambda-nodejs-image
```

**Authenticate Docker to your ECR registry:**

```sh
aws ecr get-login-password --region <aws_region> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<aws_region>.amazonaws.com
```

**Push the Docker image to ECR:**

```sh
docker push <aws_account_id>.dkr.ecr.<aws_region>.amazonaws.com/aws-lambda-nodejs-image:<tag>
```

---

## 2. Deploy with Terraform

**Navigate to the Terraform directory:**

```sh
cd ../../terraform
```

**Initialize Terraform:**

```sh
terraform init
```

**Validate the configuration:**

```sh
terraform validate
```

**Plan the deployment**

```sh
terraform plan -var-file=environments/<env>.tfvars
```

**Apply the deployment**

```sh
terraform apply -var-file=environments/<env>.tfvars
```

## 3. Destroy Resources (Cleanup)

**To remove all resources created by Terraform:**

```sh
terraform destroy -var-file=environments/dev.tfvars
```
