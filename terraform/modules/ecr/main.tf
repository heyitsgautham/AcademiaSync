resource "aws_ecr_repository" "repos" {
  #checkov:skip=CKV_AWS_51:CI pushes a commit tag and moves latest on every build, which immutable tags forbid
  #checkov:skip=CKV_AWS_136:AES256 encryption at rest; switching an existing repository to KMS replaces it and deletes its images
  for_each = toset(var.repositories)

  name                 = "${var.project_name}-${var.environment}-${each.value}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  lifecycle {
    ignore_changes = [name]
  }

  tags = {
    Name    = "${var.project_name}-${var.environment}-${each.value}"
    Service = each.value
  }
}

# Lifecycle policy to keep only last 5 images (save storage costs)
resource "aws_ecr_lifecycle_policy" "repos_policy" {
  for_each   = aws_ecr_repository.repos
  repository = each.value.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 5 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 5
      }
      action = {
        type = "expire"
      }
    }]
  })
}
