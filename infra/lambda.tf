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

# Busca a Role padrão de estudante já existente na conta
data "aws_iam_role" "lab_role" {
  name = "LabRole" # Mude para "vockey" se o seu painel de estudante usar esse padrão
}

# A Função Lambda modificada
resource "aws_lambda_function" "url_scraper" {
  filename         = "lambda_function.zip"
  function_name    = "Grablink-URL-Enricher"
  
  # Aqui está o truque: usamos o ARN da Role de estudante em vez de criar uma nova
  role             = data.aws_iam_role.lab_role.arn 
  
  handler          = "scraper.lambda_handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "python3.12"
  timeout          = 15

  vpc_config {
    subnet_ids         = [aws_subnet.private_app_a.id, aws_subnet.private_app_b.id]
    security_group_ids = [aws_security_group.grablink_sg.id]
  }

  environment {
    variables = {
      API_URL = "http://${aws_instance.grablink_backend.private_ip}:3000"
    }
  }
}

# 3. Empacota o código Python do Lambda
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "scraper.py"
  output_path = "lambda_function.zip"
}

# 4. Mapeamento de Evento: Diz para o SQS disparar o Lambda
resource "aws_lambda_event_source_mapping" "sqs_to_lambda" {
  event_source_arn = aws_sqs_queue.grablink_queue.arn
  function_name    = aws_lambda_function.url_scraper.arn
  batch_size       = 5
}