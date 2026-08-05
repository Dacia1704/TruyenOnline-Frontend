# API Response Structures

## Common Response Wrappers

### ApiResponse

```json
{
  "code": 200,
  "message": "Success",
  "data": { ... }
}
```

### PageResponse<T>

```json
{
  "currentPage": 1,
  "pageSize": 10,
  "totalPages": 5,
  "totalElements": 50,
  "data": [ ... ]
}
```

---

## Authentication Responses

### LoginResponse

```json
{
  "id": "string",
  "email": "string",
  "username": "string",
  "avatarUrl": "string",
  "roles": ["string"],
  "permissions": ["string"],
  "accessToken": "string",
  "refreshToken": "string"
}
```

### RegisterResponse

```json
{
  "id": "string",
  "email": "string",
  "username": "string"
}
```

### RefreshTokenResponse

```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

### IntrospectResponse

```json
{
  "valid": true
}
```

### SocialAccountResponse

```json
{
  "provider": "GOOGLE | FACEBOOK | LOCAL",
  "linked": true
}
```

---

## User Responses

### UserResponse

```json
{
  "id": "string",
  "email": "string",
  "username": "string",
  "avatarUrl": "string",
  "isActive": true,
  "roles": [
    {
      "id": 1,
      "name": "USER",
      "description": "string",
      "isDefault": false,
      "permissions": [
        {
          "id": 1,
          "name": "string",
          "description": "string"
        }
      ]
    }
  ]
}
```

---

## Story Responses

### StoryResponse

```json
{
  "id": "string",
  "uploader": {
    /* UserResponse */
  },
  "title": "string",
  "slug": "string",
  "description": "string",
  "coverImageUrl": "string",
  "storyType": "NOVEL | MANGA",
  "status": "ONGOING | COMPLETED | HIATUS | DROPPED",
  "isPublished": true,
  "freeChapterLimit": 5,
  "viewCount": 1000,
  "authors": [
    /* StoryAuthorResponse */
  ],
  "isBanned": false
}
```

### StoryAuthorResponse

```json
{
  "author": {
    "id": "string",
    "name": "string",
    "nameNoAccent": "string",
    "slug": "string",
    "bio": "string",
    "avatarUrl": "string",
    "country": "string"
  },
  "story": {
    /* StoryResponse */
  },
  "role": "AUTHOR | CO_AUTHOR | ILLUSTRATOR | TRANSLATOR",
  "sortOrder": 1
}
```

### StoryPublishRequestResponse

```json
{
  "id": "string",
  "story": {
    /* StoryResponse */
  },
  "requesterNote": "string",
  "reviewerNote": "string",
  "reviewer": {
    /* UserResponse */
  },
  "status": "PENDING | APPROVED | REJECTED"
}
```

---

## Author Responses

### AuthorResponse

```json
{
  "id": "string",
  "name": "string",
  "nameNoAccent": "string",
  "slug": "string",
  "bio": "string",
  "avatarUrl": "string",
  "country": "string"
}
```

---

## Genre Responses

### GenreResponse

```json
{
  "name": "string",
  "id": 1,
  "storyQuantity": 10
}
```

---

## Chapter Responses

### ChapterResponse

```json
{
  "id": "string",
  "story": {
    /* StoryResponse */
  },
  "chapterNumber": 1.0,
  "title": "string",
  "isPublished": true,
  "viewCount": 100,
  "content": "string",
  "pageCount": 20,
  "pages": [
    /* ChapterPageResponse */
  ]
  "isBanned": false,
}
```

### ChapterPageResponse

```json
{
  "id": "string",
  "pageNumber": 1,
  "imageUrl": "string",
  "width": 800,
  "height": 1200
}
```

---

## Payment Responses

### CreatePaymentResponse

```json
{
  "txnRef": "string",
  "paymentUrl": "string",
  "amount": 50000,
  "plan": {
    "id": "string",
    "code": "string",
    "name": "string",
    "description": "string",
    "price": 50000,
    "durationDays": 30,
    "isActive": true,
    "sortOrder": 1
  }
}
```

### TransactionResponse

```json
{
  "id": "string",
  "vnpTxnRef": "string",
  "subscriptionPlan": {
    "id": "string",
    "code": "string",
    "name": "string",
    "description": "string",
    "price": 50000,
    "durationDays": 30,
    "isActive": true,
    "sortOrder": 1
  },
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "avatarUrl": "string"
  },
  "amountVnd": 50000,
  "status": "PENDING | SUCCESS | FAILED | REFUNDED",
  "vnpBankCode": "string",
  "vnpTransactionNo": "string",
  "createdAt": "2024-01-01T10:00:00",
  "completedAt": "2024-01-01T10:05:00"
}
```

> **Note:** Admin endpoint `/api/payment/transactions` returns `PageResponse<TransactionResponse>` (paginated).

### SubscriptionPlanResponse

```json
{
  "code": "string",
  "name": "string",
  "description": "string",
  "price": 50000,
  "durationDays": 30,
  "isActive": true,
  "sortOrder": 1
}
```

### SubscriptionResponse

```json
{
  "id": "string",
  "user": {
    /* UserResponse */
  },
  "status": "ACTIVE | EXPIRED | CANCELLED",
  "startedAt": "2024-01-01T10:00:00",
  "expiresAt": "2024-01-31T10:00:00",
  "plan": {
    /* SubscriptionPlanResponse */
  }
}
```

---

## Interaction Responses

### CommentResponse

```json
{
  "id": "string",
  "type": "STORY | CHAPTER",
  "content": "string",
  "isBanned": "boolean",
  "author": {
    /* UserResponse */
  },
  "storyId": "string (if type is STORY)",
  "chapterId": "string (if type is CHAPTER)",
  "parentId": "string (for replies)",
  "replyCount": "int",
  "replies": [
    /* CommentResponse */
  ],
  "createdAt": "LocalDateTime",
  "updatedAt": "LocalDateTime",
  "isBanned": false
}
```

### BookmarkResponse

```json
{
  "user": {
    /* UserResponse */
  },
  "story": {
    /* StoryResponse */
  }
}
```

### ReadingHistoryResponse

```json
{
  "id": "string",
  "story": {
    /* StoryResponse */
  },
  "chapter": {
    /* ChapterResponse */
  },
  "lastReadAt": "2024-01-01T10:00:00"
}
```

---

## Banner Responses

### BannerResponse

```json
{
  "id": "string",
  "title": "string",
  "bannerUrl": "string",
  "linkUrl": "string",
  "position": "HOME_HERO | POPUP",
  "sortOrder": "int",
  "isActive": "boolean",
  "clickCount": "long",
  "createdBy": {
    /* UserResponse */
  },
  "createdAt": "LocalDateTime",
  "updatedAt": "LocalDateTime"
}
```

---

## Administration Responses

### AuditLogResponse

```json
{
  "id": "string",
  "actorId": "string",
  "actorUsername": "string",
  "actorRole": "string",
  "action": "REGISTER | LOGIN | LOGOUT | CREATE | UPDATE | DELETE | PUBLISH | UNPUBLISH | APPROVE | REJECT | BAN | UNBAN | CHANGE_ROLE | CHANGE_PASSWORD | CHANGE_EMAIL | RESET_PASSWORD",
  "objectType": "USER | STORY | CHAPTER | COMMENT | PUBLISH_REQUEST | GENRE | TAG | ROLE | SYSTEM",
  "objectId": "string",
  "description": "string",
  "oldValue": "string",
  "newValue": "string",
  "ipAddress": "string",
  "userAgent": "string",
  "createdAt": "2024-01-01T10:00:00"
}
```

### ModerationActionResponse

```json
{
  "id": "string",
  "objectId": "string",
  "objectType": "STORY | CHAPTER | COMMENT | USER",
  "actionType": "BAN | UNBAN",
  "violationType": "COPYRIGHT | PORNOGRAPHY | VIOLENCE | SPAM | HARASSMENT | OTHER",
  "reason": "string",
  "adminId": "string",
  "adminUsername": "string",
  "createdAt": "LocalDateTime"
}
```

### BanAppealAttachmentResponse

```json
{
  "id": "string",
  "attachmentUrl": "string",
  "createdAt": "LocalDateTime"
}
```

### BanAppealResponse

```json
{
  "id": "string",
  "user": {
    /* UserResponse */
  },
  "moderationAction": {
    /* ModerationActionResponse */
  },
  "content": "string",
  "status": "PENDING | APPROVED | REJECTED",
  "reviewer": {
    /* UserResponse */
  },
  "reviewerNote": "string",
  "resolvedAt": "LocalDateTime",
  "attachments": [
    /* BanAppealAttachmentResponse */
  ],
  "createdAt": "LocalDateTime",
  "updatedAt": "LocalDateTime"
}
```

---

## Enums Reference

### StoryType

- `NOVEL`
- `MANGA`

### StoryStatus

- `ONGOING`
- `COMPLETED`
- `HIATUS`
- `DROPPED`

### AuthorRole

- `AUTHOR`
- `CO_AUTHOR`
- `ILLUSTRATOR`
- `TRANSLATOR`

### StoryPublishRequestStatus

- `PENDING`
- `APPROVED`
- `REJECTED`

### CommentType

- `STORY`
- `CHAPTER`

### HistoryType

- `STORY`
- `CHAPTER`

### TransactionStatus

- `PENDING`
- `SUCCESS`
- `FAILED`
- `REFUNDED`

### SubscriptionStatus

- `ACTIVE`
- `EXPIRED`
- `CANCELLED`

### AuditAction

- `REGISTER`, `LOGIN`, `LOGOUT`
- `CREATE`, `UPDATE`, `DELETE`
- `PUBLISH`, `UNPUBLISH`
- `APPROVE`, `REJECT`
- `BAN`, `UNBAN`
- `CHANGE_ROLE`, `CHANGE_PASSWORD`, `CHANGE_EMAIL`, `RESET_PASSWORD`

### AuditObjectType

- `USER`, `STORY`, `CHAPTER`, `COMMENT`, `PUBLISH_REQUEST`, `GENRE`, `TAG`, `ROLE`, `SYSTEM`

### ModerationActionType

- `BAN`
- `UNBAN`

### ModerationObjectType

- `STORY`
- `CHAPTER`
- `COMMENT`
- `USER`

### ViolationType

- `COPYRIGHT`
- `PORNOGRAPHY`
- `VIOLENCE`
- `SPAM`
- `HARASSMENT`
- `OTHER`

### BannerPosition

- `HOME_HERO`
- `POPUP`

### BanAppealStatus

- `PENDING`
- `APPROVED`
- `REJECTED`

### AuthProvider

- `GOOGLE`
- `FACEBOOK`
- `LOCAL`
