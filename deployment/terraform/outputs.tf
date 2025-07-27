output "instance_id" {
  description = "The ID of the EC2 instance"
  value       = aws_instance.web.id
}

output "public_ip" {
  description = "The public IP of the EC2 instance"
  value       = aws_instance.web.public_ip
}

output "public_dns" {
  description = "The public DNS of the EC2 instance"
  value       = aws_instance.web.public_dns
}

output "availability_zone" {
  description = "The availability zone where the EC2 instance is running"
  value       = aws_instance.web.availability_zone
}

output "aws_account_id" {
  value = data.aws_caller_identity.current.account_id
}

output "aws_region" {
  value = data.aws_region.current.id
}

output "frontend_ecr_url" {
  value = aws_ecr_repository.frontend.repository_url
  sensitive = false
}

output "backend_ecr_url" {
  value = aws_ecr_repository.backend.repository_url
  sensitive = false
}