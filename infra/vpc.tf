# 1. Definição da VPC Principal
resource "aws_vpc" "grablink_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "grablink-vpc"
  }
}

# 2. Internet Gateway (Fornece saída para a internet para as subnets públicas)
resource "aws_internet_gateway" "grablink_igw" {
  vpc_id = aws_vpc.grablink_vpc.id

  tags = {
    Name = "grablink-igw"
  }
}

# 3. Subnets Públicas (O Application Load Balancer exige pelo menos duas em AZs distintas)
resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.grablink_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "grablink-public-1a"
  }
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.grablink_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = true

  tags = {
    Name = "grablink-public-1b"
  }
}

# 4. Subnets Privadas para a Camada de Aplicação (Onde a instância EC2 vai rodar)
resource "aws_subnet" "private_app_a" {
  vpc_id            = aws_vpc.grablink_vpc.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name = "grablink-private-app-1a"
  }
}

resource "aws_subnet" "private_app_b" {
  vpc_id            = aws_vpc.grablink_vpc.id
  cidr_block        = "10.0.12.0/24"
  availability_zone = "us-east-1b"

  tags = {
    Name = "grablink-private-app-1b"
  }
}

# 5. Subnets Privadas para a Camada de Dados (Onde o banco RDS PostgreSQL vai rodar)
resource "aws_subnet" "private_db_a" {
  vpc_id            = aws_vpc.grablink_vpc.id
  cidr_block        = "10.0.21.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name = "grablink-private-db-1a"
  }
}

resource "aws_subnet" "private_db_b" {
  vpc_id            = aws_vpc.grablink_vpc.id
  cidr_block        = "10.0.22.0/24"
  availability_zone = "us-east-1b"

  tags = {
    Name = "grablink-private-db-1b"
  }
}

# 6. NAT Gateway (Permite que instâncias privadas baixem pacotes/dependências sem se exporem)
resource "aws_eip" "nat_eip" {
  domain = "vpc"
}

resource "aws_nat_gateway" "grablink_nat" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.public_a.id # O NAT Gateway obrigatoriamente fica na subnet pública

  tags = {
    Name = "grablink-nat-gateway"
  }

  depends_on = [aws_internet_gateway.grablink_igw]
}

# 7. Tabelas de Roteamento (Route Tables)
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.grablink_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.grablink_igw.id
  }

  tags = {
    Name = "grablink-public-rt"
  }
}

resource "aws_route_table" "private_rt" {
  vpc_id = aws_vpc.grablink_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.grablink_nat.id
  }

  tags = {
    Name = "grablink-private-rt"
  }
}

# 8. Associações das Tabelas de Roteamento com as Subnets
resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "private_app_a" {
  subnet_id      = aws_subnet.private_app_a.id
  route_table_id = aws_route_table.private_rt.id
}

resource "aws_route_table_association" "private_app_b" {
  subnet_id      = aws_subnet.private_app_b.id
  route_table_id = aws_route_table.private_rt.id
}

resource "aws_route_table_association" "private_db_a" {
  subnet_id      = aws_subnet.private_db_a.id
  route_table_id = aws_route_table.private_rt.id
}

resource "aws_route_table_association" "private_db_b" {
  subnet_id      = aws_subnet.private_db_b.id
  route_table_id = aws_route_table.private_rt.id
}

# 9. DB Subnet Group (Necessário para informar ao RDS onde ele pode criar instâncias)
resource "aws_db_subnet_group" "grablink_db_subnet_group" {
  name       = "grablink-db-subnet-group"
  subnet_ids = [aws_subnet.private_db_a.id, aws_subnet.private_db_b.id]

  tags = {
    Name = "Grablink DB Subnet Group"
  }
}