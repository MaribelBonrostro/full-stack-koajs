resource "aws_lambda_function" "api_lambda" {
  function_name = "${var.lambda_name}-${var.environment}"
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.lambda_repo.repository_url}:${var.docker_image_tag}"
  role          = aws_iam_role.lambda_exec.arn
  timeout       = 30
  memory_size   = 512
}

resource "aws_iam_role" "lambda_exec" {
  name = "${var.lambda_name}-lambda-exec-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role_policy.json
}

data "aws_iam_policy_document" "lambda_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}