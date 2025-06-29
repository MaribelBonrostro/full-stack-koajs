variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-1"
}

variable "project_name" {
  description = "Project name prefix"
  type        = string
  default     = "my-node-app"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

variable "ecr_repo_url" {
  description = "ECR repository URL"
  type        = string
}

variable "image_tag" {
  description = "Docker image tag"
  type        = string
}

variable "lambda_timeout" {
  description = "Lambda timeout in seconds"
  type        = number
  default     = 15
}

variable "lambda_memory" {
  description = "Lambda memory size in MB"
  type        = number
  default     = 512
}

variable "aws_account_id" {
  description = "AWS account ID"
  type        = string
}
variable "aws_role_name" {
  description = "IAM role name for Lambda execution"
  type        = string
}

variable "aws_region" {
  description = "AWS region for the Lambda execution role"
  type        = string
}