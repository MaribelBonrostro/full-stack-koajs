# Account Tagging API

This API allows account members to create, update, and manage custom tags for users within their accounts.

---

## **Endpoints**

### **Account Tag Endpoints**

| Method | Endpoint                           | Description                  |
| ------ | ---------------------------------- | ---------------------------- |
| POST   | `/accounts/:accountId/tags`        | Create a tag for an account  |
| GET    | `/accounts/:accountId/tags`        | List all tags for an account |
| PATCH  | `/accounts/:accountId/tags/:tagId` | Update a tag for an account  |

### **User Tag Assignment Endpoints**

| Method | Endpoint                                  | Description                  |
| ------ | ----------------------------------------- | ---------------------------- |
| POST   | `/accounts/:accountId/users/:userId/tags` | Assign a tag to a user       |
| GET    | `/accounts/:accountId/users/:userId/tags` | List tags assigned to a user |

---

## **Authentication**

All endpoints require a valid Bearer token in the `Authorization` header.

---
