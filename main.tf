provider "aws" {
  region = "us-east-1" # Ajuste para a sua região de preferência
}

# Busca a AMI oficial mais recente do Rocky Linux 9
data "aws_ami" "rocky_linux" {
  most_recent = true
  owners      = ["679593333241"] # ID oficial do projeto Rocky Linux na AWS

  filter {
    name   = "name"
    values = ["Rocky-9-EC2-Base*"]
  }
}

resource "aws_instance" "grablink_backend" {
  ami           = data.aws_ami.rocky_linux.id
  instance_type = "t3.micro"
  
  # Referências ao seu Security Group e Chave SSH (precisam ser declarados no TF)
  # vpc_security_group_ids = [aws_security_group.grablink_sg.id]
  # key_name               = "sua-chave-ssh-aws"

  user_data = <<-EOF
              #!/bin/bash
              # Atualiza pacotes e instala repositórios extras
              dnf update -y
              dnf install -y epel-release
              
              # Instala o UFW e o PostgreSQL client (para testar a conexão com o RDS)
              dnf install -y ufw postgresql
              
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