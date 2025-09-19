variable "region" {
  description = "The AWS region where resources will be deployed to (eu-west-2 for London)"
  type        = string
  default     = "eu-west-2"
}

variable "ecs_task_execution_policy_arn" {
  description = "ARN for the ECS Task Execution IAM Policy"
  type        = string
  default     = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Stripe api key
variable "stripe_api_key" {
  description = "Stripe API Secret Key"
  type        = string
  sensitive   = true
}

# Stripe webhook secret
variable "stripe_webhook_secret" {
  description = "Stripe Webhook Signing Secret"
  type        = string
  sensitive   = true
}

# Email secret
variable "send_grid_api_key" {
  description = "SendGrid API Key"
  type        = string
  sensitive   = true
}


