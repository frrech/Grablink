provider "aws" {
  region = "us-east-1" # Ajuste para a sua região de preferência
}

# Busca a AMI oficial mais recente do Rocky Linux 9
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"] # ID oficial do projeto Rocky Linux na AWS

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

resource "aws_key_pair" "grablink_deployer"{
  key_name = "grablink-ssh-key"
  public_key = file("~/.ssh/grablink_key.pub")
}
resource "aws_security_group" "grablink_sg" {
  name = "grablink-backend-sg"
  description = "permite SSH para CI/CD e trafego para NestJS"
  ingress {
    description = "Acesso SSH"
    from_port = 22
    to_port = 22
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress{
    description = "Acesso a API Grablink"
    from_port = 3000
    to_port = 3000
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Acesso HTTP para o Frontend Nginx"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress{
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    name = "Grablink-Security-Group"
  }
}
resource "aws_instance" "grablink_backend" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
  
  subnet_id = aws_subnet.private_app_a.id
  # Referências ao seu Security Group e Chave SSH (precisam ser declarados no TF)
  vpc_security_group_ids = [aws_security_group.grablink_sg.id]
  key_name               = aws_key_pair.grablink_deployer.key_name

  user_data = <<-EOF
              #!/bin/bash
              # Atualiza pacotes e instala repositórios extras
              dnf update -y
              
              # Instala o UFW e o PostgreSQL client (para testar a conexão com o RDS)
              dnf install -y ufw postgresql nginx
              systemctl enable nginx
              systemctl start nginx

              # Configura o Firewall (UFW) fechando tudo, exceto SSH e a porta do NestJS
              ufw default deny incoming
              ufw default allow outgoing
              ufw allow 22/tcp
              ufw allow 3000/tcp
              ufw --force enable

              # Instala o Node.js 18 e o PM2 para manter o backend vivo
              curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
              dnf install -y nodejs
              npm install -g pm2
              EOF

  tags = {
    Name = "Grablink-API"
  }
}