# 1. Fila de Mensageria (SQS)
resource "aws_sqs_queue" "grablink_queue" {
  name                       = "grablink-url-processing-queue"
  visibility_timeout_seconds = 30 # Tempo que o Lambda tem para processar antes da mensagem voltar pra fila
}

# 2. IAM Role para o Lambda (Permissões de Execução, VPC e SQS)
resource "aws_iam_role" "lambda_exec_role" {
  name = "grablink_lambda_exec_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

# Anexa políticas padrão da AWS para acesso à rede (VPC) e consumo do SQS
resource "aws_iam_role_policy_attachment" "lambda_vpc_access" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_sqs_access" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaSQSQueueExecutionRole"
}

# 3. Empacota o código Python do Lambda
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "scraper.py"
  output_path = "lambda_function.zip"
}

# 4. A Função Lambda
resource "aws_lambda_function" "url_scraper" {
  filename         = "lambda_function.zip"
  function_name    = "Grablink-URL-Enricher"
  role             = aws_iam_role.lambda_exec_role.arn
  handler          = "scraper.lambda_handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "python3.12"
  timeout          = 15

  # Coloca o Lambda na subnet privada para acessar o RDS e o NAT Gateway
  vpc_config {
    subnet_ids         = [aws_subnet.private_app_a.id, aws_subnet.private_app_b.id]
    security_group_ids = [aws_security_group.grablink_sg.id]
  }

  environment {
    variables = {
      # Variáveis que o script usará para notificar o backend NestJS
      API_URL = "http://${aws_instance.grablink_backend.private_ip}:3000"
    }
  }
}

# 5. Mapeamento de Evento: Diz para o SQS disparar o Lambda
resource "aws_lambda_event_source_mapping" "sqs_to_lambda" {
  event_source_arn = aws_sqs_queue.grablink_queue.arn
  function_name    = aws_lambda_function.url_scraper.arn
  batch_size       = 5
}