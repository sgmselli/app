# Stripe API Key
resource "aws_secretsmanager_secret" "stripe_api_key" {
  name = "prod-stripe-api-key"
}
resource "aws_secretsmanager_secret_version" "stripe_api_key" {
  secret_id     = aws_secretsmanager_secret.stripe_api_key.id
  secret_string = var.stripe_api_key
}

# Stripe Webhook Secret
resource "aws_secretsmanager_secret" "stripe_webhook_secret" {
  name = "prod-stripe-webhook-secret"
}
resource "aws_secretsmanager_secret_version" "stripe_webhook_secret" {
  secret_id     = aws_secretsmanager_secret.stripe_webhook_secret.id
  secret_string = var.stripe_webhook_secret
}

# SendGrid API Key
resource "aws_secretsmanager_secret" "send_grid_api_key" {
  name = "prod-sendgrid-api-key"
}

resource "aws_secretsmanager_secret_version" "send_grid_api_key" {
  secret_id     = aws_secretsmanager_secret.send_grid_api_key.id
  secret_string = var.send_grid_api_key
}

# Access secret key
resource "aws_secretsmanager_secret" "access_secret_key" {
  name = "prod-access-secret-key"
}

resource "aws_secretsmanager_secret_version" "access_secret_key" {
  secret_id     = aws_secretsmanager_secret.access_secret_key.id
  secret_string = var.access_secret_key
}

# Refresh secret key
resource "aws_secretsmanager_secret" "refresh_secret_key" {
  name = "prod-refresh-secret_key"
}

resource "aws_secretsmanager_secret_version" "refresh_secret_key" {
  secret_id     = aws_secretsmanager_secret.refresh_secret_key.id
  secret_string = var.refresh_secret_key
}