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


