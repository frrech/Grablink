# 1. S3 Bucket para armazenar os arquivos estáticos (HTML/CSS/JS)
resource "aws_s3_bucket" "grablink_frontend" {
  bucket = "grablink-frontend-bucket-${random_id.bucket_suffix.hex}" # S3 exige nomes globalmente únicos
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# 2. Origin Access Control (OAC) - Garante que apenas o CloudFront possa ler o S3
resource "aws_cloudfront_origin_access_control" "grablink_oac" {
  name                              = "grablink-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# 3. Distribuição CloudFront (CDN)
resource "aws_cloudfront_distribution" "grablink_cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  origin {
    domain_name              = aws_s3_bucket.grablink_frontend.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.grablink_frontend.bucket}"
    origin_access_control_id = aws_cloudfront_origin_access_control.grablink_oac.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.grablink_frontend.bucket}"
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }
  }

  # Configuração para SPAs (React/Vite) - Redireciona erros 404 para o index.html
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# 4. Política do S3 permitindo a leitura do CloudFront
resource "aws_s3_bucket_policy" "grablink_s3_policy" {
  bucket = aws_s3_bucket.grablink_frontend.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action = "s3:GetObject"
      Resource = "${aws_s3_bucket.grablink_frontend.arn}/*"
      Condition = {
        StringEquals = { "AWS:SourceArn" = aws_cloudfront_distribution.grablink_cdn.arn }
      }
    }]
  })
}

output "cloudfront_domain" {
  value = aws_cloudfront_distribution.grablink_cdn.domain_name
}