
module "lambda_api" {
  source       = "./modules/lambda_api"

  project_name = var.project_name
  environment  = var.environment

  ecr_repo_url = var.ecr_repo_url
  image_tag    = var.image_tag

  lambda_timeout = var.lambda_timeout
  lambda_memory  = var.lambda_memory
}
