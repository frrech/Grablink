# 1. Security Group para o RDS (Isolamento de Rede)
resource "aws_security_group" "grablink_db_sg" {
  name        = "grablink-db-sg"
  description = "Permite trafego de dados apenas vindo do backend"
  vpc_id      = aws_vpc.grablink_vpc.id

  # Regra de Entrada: Bloqueia tudo, exceto o NestJS (EC2) na porta 5432
  ingress {
    description     = "PostgreSQL acesso a partir do backend EC2"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.grablink_sg.id] # Vincula diretamente ao SG da EC2
  }

  # Regra de Saída padrão
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "Grablink-DB-Security-Group"
  }
}

# 2. Instância do Amazon RDS PostgreSQL
resource "aws_db_instance" "grablink_rds" {
  allocated_storage      = 20
  max_allocated_storage  = 100 # Permite auto-scaling do armazenamento se necessário
  db_name                = "grablink"
  engine                 = "postgres"
  engine_version         = "16.3" # Alinhado com a versão do projeto
  instance_class         = "db.t4g.micro" # Instância económica de arquitetura Graviton (ótima performance/preço)
  
  # Credenciais de Acesso (Altere para valores seguros ou use variáveis)
  username               = "postgres"
  password               = "GrablinkSecurePass2026" # Substitua por uma password forte
  
  # Vinculação com a Rede Isolada criada anteriormente
  db_subnet_group_name   = aws_db_subnet_group.grablink_db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.grablink_db_sg.id]
  publicly_accessible    = false

  # Configurações de Manutenção e Eliminação
  skip_final_snapshot    = true # Permite destruir o ambiente de testes rapidamente sem travar no backup final
  deletion_protection    = false

  tags = {
    Name = "Grablink-PostgreSQL-Instance"
  }
}

# 3. Output do Endpoint (Necessário para o seu CI/CD e variáveis de ambiente)
output "rds_endpoint" {
  description = "O endereço de ligação para a base de dados"
  value       = aws_db_instance.grablink_rds.endpoint
}