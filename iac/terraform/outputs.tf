output "aws_account_id" {
  value = data.aws_caller_identity.current.account_id
}

output "aws_region" {
  value = data.aws_region.current.id
}

output "frontend_ecr_url" {
  value     = aws_ecr_repository.frontend.repository_url
  sensitive = false
}

output "backend_ecr_url" {
  value     = aws_ecr_repository.backend.repository_url
  sensitive = false
}

output "redis_ecr_url" {
  value     = aws_ecr_repository.redis.repository_url
  sensitive = false
}