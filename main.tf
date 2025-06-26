
variable "file_content" {
  description = "The content to write to the local file."
  type        = string
  default     = "Hello from reusable module!"
}

variable "file_name" {
  description = "The name of the local file to create."
  type        = string
  default     = "reusable_file.txt"
}

resource "local_file" "example" {
  content  = var.file_content
  filename = var.file_name
}

output "file_path" {
  description = "The path of the created local file."
  value       = local_file.example.filename
}
