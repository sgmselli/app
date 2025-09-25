data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_ecs_cluster" "main" {
  name = "app-cluster"
}

resource "aws_security_group" "frontend_sg" {
  name        = "ecs-frontend-sg"
  description = "Allow HTTP to frontend"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "backend_sg" {
  name        = "ecs-backend-sg"
  description = "Allow only internal access to backend"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.frontend_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "worker_sg" {
  name        = "ecs-worker-sg"
  description = "Allow only internal access to worker"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = []
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "redis_sg" {
  name        = "ecs-redis-sg"
  description = "Allow only internal access to redis"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.backend_sg.id, aws_security_group.worker_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecsTaskExecutionRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "ecs_task_execution_policy" {
  name = "ecs-task-execution-policy"
  role = aws_iam_role.ecs_task_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"],
        Resource = [
          data.aws_secretsmanager_secret.stripe_api_key.arn,
          data.aws_secretsmanager_secret.stripe_webhook_secret_checkout.arn,
          data.aws_secretsmanager_secret.stripe_webhook_secret_connect.arn,
          data.aws_secretsmanager_secret.send_grid_api_key.arn,
          data.aws_secretsmanager_secret.access_secret_key.arn,
          data.aws_secretsmanager_secret.refresh_secret_key.arn,
          data.aws_secretsmanager_secret.database_url.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = var.ecs_task_execution_policy_arn
}

resource "aws_iam_role" "ecs_task_role" {
  name = "ecsTaskRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "ecs_task_policy" {
  name = "ecs-task-policy"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject"
        ],
        Resource = "arn:aws:s3:::tubetip-dev/*"
      },
      {
        Effect   = "Allow",
        Action   = ["s3:ListBucket"],
        Resource = "arn:aws:s3:::tubetip-dev"
      },
    ]
  })
}

resource "aws_cloudwatch_log_group" "ecs_frontend" {
  name              = "/ecs/frontend"
  retention_in_days = 1
}

resource "aws_cloudwatch_log_group" "ecs_backend" {
  name              = "/ecs/backend"
  retention_in_days = 1
}

resource "aws_cloudwatch_log_group" "ecs_worker" {
  name              = "/ecs/worker"
  retention_in_days = 1
}

resource "aws_ecs_task_definition" "frontend" {
  family                   = "frontend-task"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "frontend"
      image = "${aws_ecr_repository.frontend.repository_url}:latest"
      portMappings = [
        {
          containerPort = 80
          hostPort      = 80
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "ENVIRONMENT"
          value = "production"
        }
      ],
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs_frontend.name,
          awslogs-region        = var.region,
          awslogs-stream-prefix = "frontend"
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "backend-task"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name  = "backend"
      image = "${aws_ecr_repository.backend.repository_url}:latest"
      portMappings = [
        {
          containerPort = 8000
          hostPort      = 8000
          protocol      = "tcp"
        }
      ]
      environment = [
        {
          name  = "APP_ENV"
          value = "PRODUCTION"
        },
      ],
      secrets = [
        {
          name      = "stripe_api_key"
          valueFrom = data.aws_secretsmanager_secret.stripe_api_key.arn
        },
        {
          name      = "stripe_webhook_secret_checkout"
          valueFrom = data.aws_secretsmanager_secret.stripe_webhook_secret_checkout.arn
        },
        {
          name      = "stripe_webhook_secret_connect"
          valueFrom = data.aws_secretsmanager_secret.stripe_webhook_secret_connect.arn
        },
        {
          name      = "send_grid_api_key"
          valueFrom = data.aws_secretsmanager_secret.send_grid_api_key.arn
        },
        {
          name      = "access_secret_key"
          valueFrom = data.aws_secretsmanager_secret.access_secret_key.arn
        },
        {
          name      = "refresh_secret_key"
          valueFrom = data.aws_secretsmanager_secret.refresh_secret_key.arn
        },
        {
          name      = "database_url"
          valueFrom = data.aws_secretsmanager_secret.database_url.arn
        }
      ]
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs_backend.name,
          awslogs-region        = var.region,
          awslogs-stream-prefix = "backend"
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "redis" {
  family                   = "redis-task"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "redis"
      image = "${aws_ecr_repository.redis.repository_url}:7-alpine"
      portMappings = [
        {
          containerPort = 6379
          hostPort      = 6379
          protocol      = "tcp"
        }
      ]
    }
  ])
}

resource "aws_ecs_task_definition" "worker" {
  family                   = "worker-task"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name    = "worker"
      image   = "${aws_ecr_repository.backend.repository_url}:latest"
      command = ["celery", "-A", "app.celery.celery_task_queue", "worker", "--loglevel=info"]
      environment = [
        {
          name  = "REDIS_HOST"
          value = "redis.local"
        },
        {
          name  = "REDIS_PORT"
          value = "6379"
        },
        {
          name  = "REDIS_DB"
          value = "0"
        }
      ]
      secrets = [
        {
          name      = "stripe_api_key"
          valueFrom = data.aws_secretsmanager_secret.stripe_api_key.arn
        },
        {
          name      = "stripe_webhook_secret_checkout"
          valueFrom = data.aws_secretsmanager_secret.stripe_webhook_secret_checkout.arn
        },
        {
          name      = "stripe_webhook_secret_connect"
          valueFrom = data.aws_secretsmanager_secret.stripe_webhook_secret_connect.arn
        },
        {
          name      = "send_grid_api_key"
          valueFrom = data.aws_secretsmanager_secret.send_grid_api_key.arn
        },
        {
          name      = "access_secret_key"
          valueFrom = data.aws_secretsmanager_secret.access_secret_key.arn
        },
        {
          name      = "refresh_secret_key"
          valueFrom = data.aws_secretsmanager_secret.refresh_secret_key.arn
        },
        {
          name      = "database_url"
          valueFrom = data.aws_secretsmanager_secret.database_url.arn
        }
      ]
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs_worker.name,
          awslogs-region        = var.region,
          awslogs-stream-prefix = "worker"
        }
      }
    }
  ])
}

resource "aws_service_discovery_private_dns_namespace" "namespace" {
  name        = "local"
  description = "Private DNS namespace for ECS"
  vpc         = data.aws_vpc.default.id
}

resource "aws_ecs_service" "frontend" {
  name            = "frontend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    assign_public_ip = true
    security_groups  = [aws_security_group.frontend_sg.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 80
  }

  depends_on = [aws_ecs_cluster.main, aws_ecs_service.backend]
}

resource "aws_service_discovery_service" "backend_discovery_service" {
  name = "backend"

  dns_config {
    namespace_id   = aws_service_discovery_private_dns_namespace.namespace.id
    routing_policy = "MULTIVALUE"

    dns_records {
      type = "A"
      ttl  = 10
    }
  }
}

resource "aws_ecs_service" "backend" {
  name            = "backend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    assign_public_ip = true
    security_groups  = [aws_security_group.backend_sg.id]
  }

  service_registries {
    registry_arn = aws_service_discovery_service.backend_discovery_service.arn
  }

  depends_on = [aws_ecs_cluster.main]
}

resource "aws_ecs_service" "worker" {
  name            = "worker-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.worker.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    assign_public_ip = true
    security_groups  = [aws_security_group.worker_sg.id]
  }

  depends_on = [aws_ecs_cluster.main]
}

resource "aws_service_discovery_service" "redis" {
  name = "redis"

  dns_config {
    namespace_id   = aws_service_discovery_private_dns_namespace.namespace.id
    routing_policy = "MULTIVALUE"

    dns_records {
      type = "A"
      ttl  = 10
    }
  }
}

resource "aws_ecs_service" "redis" {
  name            = "redis-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.redis.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    assign_public_ip = true
    security_groups  = [aws_security_group.redis_sg.id]
  }

  service_registries {
    registry_arn = aws_service_discovery_service.redis.arn
  }

  depends_on = [aws_ecs_cluster.main]
}
