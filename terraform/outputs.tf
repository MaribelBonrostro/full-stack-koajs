output "lambda_function_name" {
  value = aws_lambda_function.api.function_name
}

output "lambda_function_arn" {
  value = aws_lambda_function.api.arn
}

output "lambda_invoke_arn" {
  value = aws_lambda_function.api.invoke_arn
}

output "lambda_role_arn" {
  value = aws_iam_role.lambda_exec.arn
}