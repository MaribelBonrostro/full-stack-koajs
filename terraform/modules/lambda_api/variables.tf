variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "ecr_repo_url" {
  type = string
}

variable "image_tag" {
  type = string
}

variable "lambda_timeout" {
  type    = number
  default = 15
}

variable "lambda_memory" {
  type    = number
  default = 512
}
