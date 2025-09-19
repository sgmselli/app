data "aws_secretsmanager_secret" "access_secret_key" {
  name = "prod-access-secret-key"
}

data "aws_secretsmanager_secret" "refresh_secret_key" {
  name = "prod-refresh-secret-key"
}

data "aws_secretsmanager_secret" "stripe_api_key" {
  name = "prod-stripe-api-key"
}

data "aws_secretsmanager_secret" "stripe_webhook_secret" {
  name = "prod-stripe-webhook-secret"
}

data "aws_secretsmanager_secret" "send_grid_api_key" {
  name = "prod-sendgrid-api-key"
}