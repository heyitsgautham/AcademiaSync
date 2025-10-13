output "repository_urls" {
  description = "Map of repository names to URLs"
  value = {
    for repo in aws_ecr_repository.repos :
    repo.name => repo.repository_url
  }
}

output "repository_arns" {
  description = "Map of repository names to ARNs"
  value = {
    for repo in aws_ecr_repository.repos :
    repo.name => repo.arn
  }
}

output "repository_names" {
  description = "List of repository names"
  value       = [for repo in aws_ecr_repository.repos : repo.name]
}
