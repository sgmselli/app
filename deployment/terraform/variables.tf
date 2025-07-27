variable "region" {
  description = "The AWS region where resources will be deployed to (eu-west-2 for London)"
  default     = "eu-west-2"
}

variable "instance_type" {
  description = "The EC2 instance's type"
  default     = "t3.micro"
}

variable "instance_name" {
  description = "The EC2 instance's name"
  default     = "web_server"
}

