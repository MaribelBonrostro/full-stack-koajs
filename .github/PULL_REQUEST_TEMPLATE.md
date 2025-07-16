## 📖 Description

Please document any useful information that reviewers would find beneficial.

## ✅ Checklist:

Feel free to add any items that you have considered as part of this checklist

### API

- [x] Dockerized API
- [x] Added documentation for the Dockerfile
- [x] `/accounts/:accountId/tags` **POST** – Create a tag
- [x] `/accounts/:accountId/tags` **GET** – List tags
- [x] `/accounts/:accountId/tags/:tagId` **PATCH** – Update a tag (optional)
- [x] `/accounts/:accountId/users/:userId/tags` **POST** – Assign tag to user
- [x] `/accounts/:accountId/users/:userId/tags` **DELETE** – Remove tag from user
- [x] `/accounts/:accountId/tags/:tagId` **Get** – List tags assign to a user
- [x] Included unit tests for the API
- [x] Added documentation for the API

### UI

- [x] Set up Web application using NextJS
- [x] Login page and form
- [x] Dashboard UI
- [x] Implemented refresh token (auto-refresh on dashboard)

### Terraform

- [x] Provisioned AWS Lambda using Docker image from ECR
- [x] DRY Terraform code for multiple environments
- [x] Outputs for Lambda and IAM role
- [] Testing

### GitHub Actions

- [x] CI pipeline builds and pushes Docker image to ECR
- [x] CI pipeline deploys Lambda using Terraform
- [] Testing

**Total Time Taken**: 4 days
