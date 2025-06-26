resource "aws_ecr_repository" "lambda_repo" {
  name = "${var.lambda_name}-repo"
}

output "ecr_repository_url" {
  value = aws_ecr_repository.lambda_repo.repository_url
}