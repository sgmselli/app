resource "aws_acm_certificate" "frontend_cert" {
  domain_name       = "tubetip.co"
  validation_method = "DNS"

  subject_alternative_names = ["www.tubetip.co"]
}