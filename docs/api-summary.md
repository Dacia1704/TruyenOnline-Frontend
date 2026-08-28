# Truyện Online API Documentation

## Base URL

```
http://localhost:8080/api
```

## Common Headers

| Header          | Required | Description                            |
| --------------- | -------- | -------------------------------------- |
| `Authorization` | Yes\*    | Bearer {access_token} (JWT)            |
| `Device-Id`     | No       | Device identifier for tracking         |
| `Session-Id`    | No       | Session identifier for reading history |

\*Required except for public endpoints (login, register, forgot-password, reset-password, VNPay callbacks)

---

## Authentication (`/auth`)

### 1. Login

- **Endpoint:** `POST /auth/login`
- **Auth:** Public
- **Headers:** `Device-Id`, `Session-Id` (optional)

**Request Body:**

```json
{
  "email": "string (required, email format)",
  "password": "string (required, min 6 chars)"
}
```

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": "string",
    "email": "string",
    "username": "string",
    "avatarUrl": "string",
    "roles": ["string"],
    "permissions": ["string"],
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

---

### 2. Login with Google

- **Endpoint:** `POST /auth/google`
- **Auth:** Public
- **Headers:** `Device-Id`, `Session-Id` (optional)

**Request Body:**

```json
{
  "idToken": "string (required, Google ID token)"
}
```

**Response:** Same as Login

---

### 3. Register

- **Endpoint:** `POST /auth/register`
- **Auth:** Public

**Request Body:**

```json
{
  "email": "string (required, email format)",
  "username": "string (required, 4-50 chars)",
  "password": "string (required, min 6 chars)",
  "isUploader": "boolean (optional, default: false)"
}
```

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": "string",
    "email": "string",
    "username": "string"
  }
}
```

---

### 4. Refresh Token

- **Endpoint:** `POST /auth/refresh`
- **Auth:** Public

**Request Body:**

```json
{
  "refreshToken": "string (required)"
}
```

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

---

### 5. Introspect Token

- **Endpoint:** `POST /auth/introspect`
- **Auth:** Public

**Request Body:**

```json
{
  "token": "string (required)"
}
```

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "valid": "boolean"
  }
}
```

---

### 6. Logout

- **Endpoint:** `POST /auth/logout`
- **Auth:** Required

**Request Body:**

```json
{
  "refreshToken": "string (required)"
}
```

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": "Đăng xuất thành công"
}
```

---

### 7. Logout All Devices

- **Endpoint:** `POST /auth/logout/all`
- **Auth:** Required

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": "Đăng xuất toàn bộ thiết bị thành công"
}
```

---

### 8. Forgot Password

- **Endpoint:** `POST /auth/forgot-password`
- **Auth:** Public

**Request Body:**

```json
{
  "email": "string (required, email format)"
}
```

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": "Gửi email thành công"
}
```

---

### 9. Reset Password

- **Endpoint:** `POST /auth/reset-password`
- **Auth:** Public

**Request Body:**

```json
{
  "token": "string (required)",
  "newPassword": "string (required, 8-100 chars)"
}
```

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": "Đổi mật khẩu thành công"
}
```

---

### 10. Link Google Account

- **Endpoint:** `POST /auth/link/google`
- **Auth:** Required

**Request Body:**

```json
{
  "idToken": "string (required, Google ID token)"
}
```

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": "Liên kết Google thành công"
}
```

---

### 11. Unlink Google Account

- **Endpoint:** `DELETE /auth/link/google`
- **Auth:** Required

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": "Hủy liên kết Google thành công"
}
```

---

### 12. Get My Social Accounts

- **Endpoint:** `GET /auth/providers`
- **Auth:** Required

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "provider": "GOOGLE | FACEBOOK | LOCAL",
      "linked": "boolean"
    }
  ]
}
```

---

## Stories (`/api/stories`)

### 1. Get Stories (List with Filter)

- **Endpoint:** `POST /api/stories/list`
- **Auth:** Public

**Query Parameters:** | Param | Type | Default | Description | |-------|------|---------|-------------| | `page` | int | 1 | Page number | | `size` | int | 10 | Page size |

**Request Body:**

```json
{
  "search": "string (optional)",
  "uploaderId": "string (optional)",
  "type": "NOVEL | MANGA (optional)",
  "status": "ONGOING | COMPLETED | HIATUS | DROPPED (optional)",
  "sortType": "NEWEST | UPDATED | VIEW | FOLLOW | ALPHABET_ASC | ALPHABET_DESC | OLDEST (optional)",
  "genres": ["string"] (optional, list of genre slugs),
  "authors": ["string"] (optional, list of author slugs)
}
```

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "currentPage": "int",
    "pageSize": "int",
    "totalPages": "int",
    "totalElements": "long",
    "data": [
      {
        "id": "string",
        "uploader": "UserResponse",
        "title": "string",
        "slug": "string",
        "description": "string",
        "coverImageUrl": "string",
        "storyType": "NOVEL | MANGA",
        "status": "ONGOING | COMPLETED | HIATUS | DROPPED",
        "isPublished": "boolean",
        "freeChapterLimit": "int",
        "viewCount": "long",
        "authors": ["StoryAuthorResponse"],
        "genres": ["GenreResponse"],
        "isBanned": "boolean"
      }
    ]
  }
}
```

---

### 2. Get Stories Admin (List with Filter)

- **Endpoint:** `POST /api/stories/list/admin`
- **Auth:** Required (`ROLE_ADMIN`)

**Query Parameters:** | Param | Type | Default | Description | |-------|------|---------|-------------| | `page` | int | 1 | Page number | | `size` | int | 10 | Page size |

**Request Body:**

```json
{
  "search": "string (optional)",
  "uploaderId": "string (optional)",
  "type": "NOVEL | MANGA (optional)",
  "status": "ONGOING | COMPLETED | HIATUS | DROPPED (optional)",
  "isPublished": "boolean (optional)",
  "isBanned": "boolean (optional)",
  "sortType": "NEWEST | UPDATED | VIEW | FOLLOW | ALPHABET_ASC | ALPHABET_DESC | OLDEST (optional)",
  "genres": ["string"] (optional, list of genre slugs),
  "authors": ["string"] (optional, list of author slugs)
}
```

**Response:** Same as Get Stories

---

### 3. Get Story by Slug

- **Endpoint:** `GET /api/stories/slug/{slug}`
- **Auth:** Public

**Response:** `StoryResponse` object

---

### 4. Get Story by ID

- **Endpoint:** `GET /api/stories/id/{id}`
- **Auth:** Public

**Response:** `StoryResponse` object

---

### 5. Create Story

- **Endpoint:** `POST /api/stories`
- **Auth:** Required (`story:create`)

**Content-Type:** `multipart/form-data`

**Request Body:**

```json
{
  "title": "string (required)",
  "description": "string",
  "coverImageUrl": "string",
  "coverImageFile": "MultipartFile",
  "storyType": "NOVEL | MANGA (required)",
  "status": "ONGOING | COMPLETED | HIATUS | DROPPED (default: ONGOING)",
  "freeChapterLimit": "int",
  "authors": [
    {
      "authorId": "string",
      "role": "AUTHOR | CO_AUTHOR | ILLUSTRATOR | TRANSLATOR",
      "sortOrder": 1
    }
  ],
  "genreIds": [1, 2, 3] (required, at least 1)
}
```

**Response:** `StoryResponse` object

---

### 6. Update Story

- **Endpoint:** `PATCH /api/stories/{id}`
- **Auth:** Required (`story:update_own` or `story:update_any`)

**Content-Type:** `multipart/form-data`

**Request Body:**

```json
{
  "title": "string",
  "description": "string",
  "coverImageUrl": "string",
  "coverImageFile": "MultipartFile",
  "storyType": "NOVEL | MANGA",
  "status": "ONGOING | COMPLETED | HIATUS | DROPPED",
  "isPublished": false,
  "freeChapterLimit": "int",
  "viewCount": 0,
  "authors": [
    {
      "authorId": "string",
      "role": "AUTHOR | CO_AUTHOR | ILLUSTRATOR | TRANSLATOR",
      "sortOrder": 1
    }
  ],
  "genreIds": [1, 2, 3]
}
```

**Response:** `StoryResponse` object

---

### 6. Delete Story

- **Endpoint:** `DELETE /api/stories/{id}`
- **Auth:** Required (`story:delete_own` or `story:delete_any`)

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": "Xóa thành công"
}
```

---

### 7. Request Publish

- **Endpoint:** `POST /api/stories/{id}/publish-requests`
- **Auth:** Required (`story:create`)

**Request Body:**

```json
{
  "requesterNote": "string (optional)"
}
```

**Response:** `StoryPublishRequestResponse`

---

### 8. Get Publish Requests (Admin)

- **Endpoint:** `GET /api/stories/publish-requests`
- **Auth:** Required (`ROLE_ADMIN`)

**Query Parameters:** | Param | Type | Description | |-------|------|-------------| | `page` | int | Page number (default: 1) | | `size` | int | Page size (default: 10) | | `storyId` | string | Filter by story ID | | `status` | Status | PENDING, APPROVED, REJECTED | | `uploaderId` | string | Filter by uploader |

**Response:** `PageResponse<StoryPublishRequestResponse>`

---

### 9. Get My Publish Requests

- **Endpoint:** `GET /api/stories/publish-requests/me`
- **Auth:** Required (`story:update_own`)

**Query Parameters:** Same as above (without uploaderId)

**Response:** `PageResponse<StoryPublishRequestResponse>`

---

### 10. Approve Publish Request (Admin)

- **Endpoint:** `PATCH /api/stories/publish-requests/approve/{id}`
- **Auth:** Required (`ROLE_ADMIN`)

**Request Body:**

```json
{
  "reviewerNote": "string (optional)"
}
```

**Response:** `StoryPublishRequestResponse`

---

### 11. Reject Publish Request (Admin)

- **Endpoint:** `PATCH /api/stories/publish-requests/reject/{id}`
- **Auth:** Required (`ROLE_ADMIN`)

**Request Body:**

```json
{
  "reviewerNote": "string (optional)"
}
```

**Response:** `StoryPublishRequestResponse`

---

### 12. Delete Publish Request

- **Endpoint:** `DELETE /api/stories/publish-requests/{id}`
- **Auth:** Required (`story:delete_own` or `story:delete_any`)

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": "Xóa yêu cầu xuất bản thành công"
}
```

---

### 13. Ban Story (Admin)

- **Endpoint:** `PATCH /api/stories/{id}/ban`
- **Auth:** Required (`ROLE_ADMIN`)

**Request Body:**

```json
{
  "violationType": "COPYRIGHT | PORNOGRAPHY | VIOLENCE | SPAM | HARASSMENT | OTHER",
  "reason": "string (required, max 1000 chars)"
}
```

**Response:** `StoryResponse`

---

### 14. Unban Story (Admin)

- **Endpoint:** `PATCH /api/stories/{id}/unban`
- **Auth:** Required (`ROLE_ADMIN`)

**Request Body:**

```json
{
  "reason": "string (required, max 1000 chars)"
}
```

**Response:** `StoryResponse`

---

## Genres (`/api/genres`)

### 1. Get Genres

- **Endpoint:** `GET /api/genres`
- **Auth:** Public

**Query Parameters:** | Param | Type | Description | |-------|------|-------------| | `search` | string | Search by name (optional) |

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "name": "string",
      "id": "int",
      "storyQuantity": "int"
    }
  ]
}
```

---

### 2. Create Genre (Admin)

- **Endpoint:** `POST /api/genres`
- **Auth:** Required (`ROLE_ADMIN`)

**Request Body:**

```json
{
  "name": "string"
}
```

**Response:** `GenreResponse`

---

### 3. Update Genre (Admin)

- **Endpoint:** `PATCH /api/genres/{id}`
- **Auth:** Required (`ROLE_ADMIN`)

**Request Body:**

```json
{
  "name": "string"
}
```

**Response:** `GenreResponse`

---

### 4. Delete Genre (Admin)

- **Endpoint:** `DELETE /api/genres/{id}`
- **Auth:** Required (`ROLE_ADMIN`)

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": "Xóa thể loại thành công"
}
```

---

## Authors (`/api/authors`)

### 1. Get Authors

- **Endpoint:** `GET /api/authors`
- **Auth:** Public

**Query Parameters:** | Param | Type | Default | Description | |-------|------|---------|-------------| | `page` | int | 1 | Page number | | `size` | int | 10 | Page size | | `search` | string | - | Search by name |

**Response:** `PageResponse<AuthorResponse>`

---

### 2. Get Author by Slug

- **Endpoint:** `GET /api/authors/{slug}`
- **Auth:** Public

**Response:** `AuthorResponse`

---

### 3. Create Author

- **Endpoint:** `POST /api/authors`
- **Auth:** Required (`author:create`)
- **Content-Type:** `multipart/form-data`

**Request Body:** | Field | Type | Required | Description | |-------|------|----------|-------------| | `name` | string | Yes | Author name | | `bio` | string | No | Author biography | | `country` | string | No | Country | | `avatarFile` | MultipartFile | No | Avatar image |

**Response:** `AuthorResponse`

---

### 4. Update Author

- **Endpoint:** `PATCH /api/authors/{id}`
- **Auth:** Required (`author:update`)
- **Content-Type:** `multipart/form-data`

**Request Body:** Same as Create (all optional)

**Response:** `AuthorResponse`

---

### 5. Delete Author

- **Endpoint:** `DELETE /api/authors/{id}`
- **Auth:** Required (`author:delete`)

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": "Xóa tác giả thành công"
}
```

---

### 6. Update Story Authors

- **Endpoint:** `PUT /api/authors/story/{storyId}`
- **Auth:** Required (`story:update_own` or `story:update_any`)

**Request Body:**

```json
[
  {
    "authorId": "string (required)",
    "role": "AUTHOR | CO_AUTHOR | ILLUSTRATOR | TRANSLATOR (required)",
    "sortOrder": "byte (optional, default: 1)"
  }
]
```

**Response:** `StoryResponse`

---

## Chapters (`/api`)

### 1. Get Chapters by Story Slug

- **Endpoint:** `GET /api/stories/slug/{slug}/chapters`
- **Auth:** Public

**Query Parameters:** | Param | Type | Default | Description | |-------|------|---------|-------------| | `page` | int | 1 | Page number | | `size` | int | 10 | Page size | | `from` | int | - | Start from this chapter number (optional) | | `search` | string | - | Search by title/chapter number (optional) |

**Response:** `PageResponse<ChapterResponse>`

---

### 2. Get Chapters by Story ID

- **Endpoint:** `GET /api/stories/id/{id}/chapters`
- **Auth:** Public

**Query Parameters:** | Param | Type | Default | Description | |-------|------|---------|-------------| | `page` | int | 1 | Page number | | `size` | int | 10 | Page size | | `from` | int | - | Start from this chapter number (optional) | | `search` | string | - | Search by title/chapter number (optional) |

**Response:** `PageResponse<ChapterResponse>`

---

### 3. Get Chapter by ID

- **Endpoint:** `GET /api/chapters/{id}`
- **Auth:** Public

**Response:** `ChapterResponse`

---

### 3. Create Chapter

- **Endpoint:** `POST /api/stories/{id}/chapters`
- **Auth:** Required (`chapter:create`)

**Request Body:**

```json
{
  "chapterNumber": "BigDecimal",
  "title": "string",
  "isPublished": "boolean (default: false)"
}
```

**Response:** `ChapterResponse`

---

### 4. Update Chapter Content

- **Endpoint:** `PATCH /api/chapters/{id}/update-content`
- **Auth:** Required (`chapter:update_own`)

**Request Body:**

```json
{
  "content": "string"
}
```

**Response:** `ChapterResponse`

---

### 5. Update Chapter

- **Endpoint:** `PATCH /api/chapters/{id}`
- **Auth:** Required (`chapter:update_own`)

**Request Body:**

```json
{
  "chapterNumber": "BigDecimal",
  "title": "string",
  "isPublished": "boolean"
}
```

**Response:** `ChapterResponse`

---

### 6. Update Chapters Publish Status

- **Endpoint:** `PATCH /api/chapters/update-publish-status`
- **Auth:** Required (`chapter:update_own`)

**Request Body:**

```json
{
  "chapterIdList": ["string"],
  "publishStatus": "boolean"
}
```

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": "Update trạng thái xuất bản thành công"
}
```

---

### 7. Ban Chapter (Admin)

- **Endpoint:** `PATCH /api/{id}/ban`
- **Auth:** Required (`ROLE_ADMIN`)

**Request Body:**

```json
{
  "violationType": "COPYRIGHT | PORNOGRAPHY | VIOLENCE | SPAM | HARASSMENT | OTHER",
  "reason": "string (required, max 1000 chars)"
}
```

**Response:** `ChapterResponse`

---

### 8. Unban Chapter (Admin)

- **Endpoint:** `PATCH /api/{id}/unban`
- **Auth:** Required (`ROLE_ADMIN`)

**Request Body:**

```json
{
  "reason": "string (required, max 1000 chars)"
}
```

**Response:** `ChapterResponse`

---

### 9. Delete Chapter

- **Endpoint:** `DELETE /api/chapter/{id}`
- **Auth:** Required (`chapter:delete_own`)

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": "Xóa chương thành công"
}
```

---

## Chapter Pages (`/api/chapters`)

### 1. Get Chapter Pages

- **Endpoint:** `GET /api/chapters/{id}/pages`
- **Auth:** Public

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "id": "string",
      "pageNumber": "int",
      "imageUrl": "string",
      "width": "int",
      "height": "int"
    }
  ]
}
```

---

### 2. Create Chapter Pages

- **Endpoint:** `POST /api/chapters/pages`
- **Auth:** Required
- **Content-Type:** `multipart/form-data`

**Request Parts:** | Part | Type | Description | |------|------|-------------| | `chapterPageRequests` | List<ChapterPageRequest> | JSON array of page requests | | `files` | List<MultipartFile> | Image files | | `chapterId` | String | Chapter ID |

**ChapterPageRequest:**

```json
{
  "id": "string (optional, for existing pages)",
  "pageNumber": "int",
  "imageUrl": "string (optional)",
  "isNewPage": "boolean"
}
```

**Response:** List of `ChapterPageResponse`

---

### 3. Update Chapter Pages

- **Endpoint:** `PATCH /api/chapters/pages`
- **Auth:** Required (`chapter:update_own`)
- **Content-Type:** `multipart/form-data`

**Request Body (form data):** | Field | Type | Description | |-------|------|-------------| | `chapterPageRequests` | JSON string | Serialized list | | `files` | List<MultipartFile> | New image files | | `chapterId` | String | Chapter ID |

**Response:** List of `ChapterPageResponse`

---

### 4. Delete Chapter Pages

- **Endpoint:** `DELETE /api/chapters/{id}/page`
- **Auth:** Required (`chapter:delete_own`)

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": "Xóa thành công!"
}
```

---

## Users (`/api/users`)

### 1. Get My Info

- **Endpoint:** `GET /api/users/me`
- **Auth:** Required

**Response:** `UserResponse`

---

### 2. Update My Info

- **Endpoint:** `PATCH /api/users/me`
- **Auth:** Required
- **Content-Type:** `multipart/form-data`

**Request Body:** | Field | Type | Description | |-------|------|-------------| | `username` | string | 4-50 chars | | `email` | string | Email format | | `avatar` | MultipartFile | Avatar image |

**Response:** `UserResponse`

---

### 3. Upgrade to Uploader

- **Endpoint:** `PATCH /api/users/me/upgrade-to-uploader`
- **Auth:** Required

**Response:** `UserResponse`

---

### 4. Get Users (Admin)

- **Endpoint:** `GET /api/users`
- **Auth:** Required (`user:read`)

**Query Parameters:** | Param | Type | Default | Description | |-------|------|---------|-------------| | `page` | int | 1 | Page number | | `size` | int | 10 | Page size |

**Response:** `PageResponse<UserResponse>`

---

### 5. Get User by ID (Admin)

- **Endpoint:** `GET /api/users/{userId}`
- **Auth:** Required (`user:read`)

**Response:** `UserResponse`

---

### 6. Ban User (Admin)

- **Endpoint:** `PATCH /api/users/{id}/ban`
- **Auth:** Required (`ROLE_ADMIN`)

**Request Body:**

```json
{
  "violationType": "COPYRIGHT | PORNOGRAPHY | VIOLENCE | SPAM | HARASSMENT | OTHER",
  "reason": "string (required, max 1000 chars)"
}
```

**Response:** `UserResponse`

---

### 7. Unban User (Admin)

- **Endpoint:** `PATCH /api/users/{id}/unban`
- **Auth:** Required (`ROLE_ADMIN`)

**Request Body:**

```json
{
  "reason": "string (required, max 1000 chars)"
}
```

**Response:** `UserResponse`

---

### 8. Get All Roles (Admin)

- **Endpoint:** `GET /api/users/roles`
- **Auth:** Required (`user:manage_roles`)

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "id": "string (role ID)",
      "name": "string",
      "description": "string"
    }
  ]
}
```

---

### 9. Update User Roles (Admin)

- **Endpoint:** `POST /api/users/{userId}/roles`
- **Auth:** Required (`user:manage_roles`)

**Request Body:**

```json
{
  "roles": ["string (role IDs)"]
}
```

**Response:** `UserResponse`

---

## Payments (`/api/payment`)

### 1. Create Payment

- **Endpoint:** `POST /api/payment/create`
- **Auth:** Required

**Request Body:**

```json
{
  "planId": "string",
  "orderInfo": "string"
}
```

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "txnRef": "string",
    "paymentUrl": "string",
    "amount": "long",
    "plan": "SubscriptionPlan"
  }
}
```

---

### 2. VNPay Return URL

- **Endpoint:** `GET /api/payment/vnpay-return`
- **Auth:** Public (VNPay callback)

**Query Parameters:** VNPay response params

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": "PaymentCallbackResult"
}
```

---

### 3. VNPay IPN

- **Endpoint:** `GET /api/payment/vnpay-ipn`
- **Auth:** Public (VNPay server callback)

**Query Parameters:** VNPay response params

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "RspCode": "string",
    "Message": "string"
  }
}
```

---

### 4. Get My Transactions (Client)

- **Endpoint:** `GET /api/payment/transactions/me`
- **Auth:** Required (USER role)

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "id": "string",
      "vnpTxnRef": "string",
      "subscriptionPlan": "SubscriptionPlan",
      "user": {
        "id": "string",
        "username": "string",
        "email": "string",
        "avatarUrl": "string"
      },
      "amountVnd": "long",
      "status": "PENDING | SUCCESS | FAILED | REFUNDED",
      "vnpBankCode": "string",
      "vnpTransactionNo": "string",
      "createdAt": "LocalDateTime",
      "completedAt": "LocalDateTime"
    }
  ]
}
```

---

### 5. Get Transactions (Admin)

- **Endpoint:** `GET /api/payment/transactions`
- **Auth:** Required (ADMIN role)

**Query Parameters:** | Param | Type | Default | Description | |-------|------|---------|-------------| | `page` | int | 1 | Page number | | `size` | int | 10 | Page size | | `userId` | String | null | Filter by user ID (optional) |

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "data": [
      {
        "id": "string",
        "vnpTxnRef": "string",
        "subscriptionPlan": "SubscriptionPlan",
        "amountVnd": "long",
        "status": "PENDING | SUCCESS | FAILED | REFUNDED",
        "vnpBankCode": "string",
        "vnpTransactionNo": "string",
        "createdAt": "LocalDateTime",
        "completedAt": "LocalDateTime"
      }
    ],
    "currentPage": 1,
    "pageSize": 10,
    "totalPages": 5,
    "totalElements": 50
  }
}
```

---

## Subscription Plans (`/api/subscription-plan`)

### 1. Get Plans

- **Endpoint:** `GET /api/subscription-plan`
- **Auth:** Public

**Query Parameters:** | Param | Type | Default | Description | |-------|------|---------|-------------| | `isActive` | boolean | true | Filter by active status |

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "code": "string",
      "name": "string",
      "description": "string",
      "price": "long",
      "durationDays": "int",
      "isActive": "boolean",
      "sortOrder": "byte"
    }
  ]
}
```

---

### 2. Get Plan by Code

- **Endpoint:** `GET /api/subscription-plan/{code}`
- **Auth:** Public

**Response:** `SubscriptionPlanResponse`

---

### 3. Create Plan (Admin)

- **Endpoint:** `POST /api/subscription-plan`
- **Auth:** Required (`ROLE_ADMIN`)

**Request Body:**

```json
{
  "code": "string",
  "name": "string",
  "description": "string",
  "price": "long",
  "durationDays": "int",
  "isActive": "boolean",
  "sortOrder": "byte"
}
```

**Response:** `SubscriptionPlanResponse`

---

### 4. Update Plan (Admin)

- **Endpoint:** `PATCH /api/subscription-plan/{code}`
- **Auth:** Required (`ROLE_ADMIN`)

**Request Body:** Same as Create (all optional)

**Response:** `SubscriptionPlanResponse`

---

### 5. Delete Plan (Admin)

- **Endpoint:** `DELETE /api/subscription-plan/{code}`
- **Auth:** Required (`ROLE_ADMIN`)

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": "Xóa gói thành công"
}
```

---

## Subscriptions (`/api/subscription`)

### 1. Get My Subscription

- **Endpoint:** `GET /api/subscription/me`
- **Auth:** Required

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": "string",
    "user": "UserResponse",
    "status": "ACTIVE | EXPIRED | CANCELLED",
    "startedAt": "LocalDateTime",
    "expiresAt": "LocalDateTime",
    "plan": "SubscriptionPlanResponse"
  }
}
```

---

## Comments (`/api/comments`)

### 1. Get Comments by Chapter

- **Endpoint:** `GET /api/comments/chapter/{id}`
- **Auth:** Public

**Query Parameters:** | Param | Type | Default | Description | |-------|------|---------|-------------| | `page` | int | 1 | Page number | | `size` | int | 10 | Page size |

**Response:** `PageResponse<CommentResponse>`

---

### 2. Get Comments by Story

- **Endpoint:** `GET /api/comments/story/{id}`
- **Auth:** Public

**Query Parameters:** Same as above

**Response:** `PageResponse<CommentResponse>`

---

### 3. Create Comment

- **Endpoint:** `POST /api/comments`
- **Auth:** Required (`comment:create`)

**Request Body:**

```json
{
  "type": "STORY | CHAPTER",
  "storyId": "string",
  "chapterId": "string",
  "content": "string",
  "parentId": "string (optional, for replies)"
}
```

**Response:** `CommentResponse`

---

### 4. Update Comment

- **Endpoint:** `PATCH /api/comments/{id}`
- **Auth:** Required (`comment:create`)

**Request Body:**

```json
{
  "content": "string"
}
```

**Response:** `CommentResponse`

---

### 5. Delete Comment

- **Endpoint:** `DELETE /api/comments/{id}`
- **Auth:** Required (`comment:delete_own`)

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": "Xóa bình luận thành công"
}
```

---

### 6. Ban Comment (Admin/Uploader)

- **Endpoint:** `PATCH /api/comments/{id}/ban`
- **Auth:** Required (`ROLE_ADMIN` or `ROLE_UPLOADER`)

**Request Body:**

```json
{
  "violationType": "COPYRIGHT | PORNOGRAPHY | VIOLENCE | SPAM | HARASSMENT | OTHER",
  "reason": "string (required, max 1000 chars)"
}
```

**Response:** `CommentResponse`

---

### 7. Unban Comment (Admin/Uploader)

- **Endpoint:** `PATCH /api/comments/{id}/unban`
- **Auth:** Required (`ROLE_ADMIN` or `ROLE_UPLOADER`)

**Request Body:**

```json
{
  "reason": "string (required, max 1000 chars)"
}
```

**Response:** `CommentResponse`

---

## Banner Manager (`/api/banners`)

### 1. Get All Active Banners (Public)

- **Endpoint:** `GET /api/banners/active`
- **Auth:** Public

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "id": "string",
      "title": "string",
      "bannerUrl": "string",
      "linkUrl": "string",
      "position": "HOME_HERO | POPUP",
      "sortOrder": "int",
      "isActive": "boolean",
      "clickCount": "long",
      "createdAt": "LocalDateTime",
      "updatedAt": "LocalDateTime"
    }
  ]
}
```

---

### 2. Get Banner by ID

- **Endpoint:** `GET /api/banners/{id}`
- **Auth:** Public

**Response:** `BannerResponse`

---

### 3. Get All Banners (Admin)

- **Endpoint:** `GET /api/banners`
- **Auth:** Required (`ROLE_ADMIN`)

**Query Parameters:** | Param | Type | Default | Description | |-------|------|---------|-------------| | `page` | int | 1 | Page number | | `size` | int | 10 | Page size | | `isActive` | boolean | - | Filter by active status (required) |

**Response:** `PageResponse<BannerResponse>`

---

### 4. Create Banner (Admin)

- **Endpoint:** `POST /api/banners`
- **Auth:** Required (`ROLE_ADMIN`)
- **Content-Type:** `multipart/form-data`

**Request Body:** | Field | Type | Required | Description | |-------|------|----------|-------------| | `title` | string | Yes | Banner title | | `linkUrl` | string | No | Link URL when clicked | | `bannerUrl` | string | No | Existing banner image URL | | `imageFile` | MultipartFile | No | Banner image file | | `position` | BannerPosition | Yes | HOME_HERO or POPUP | | `sortOrder` | int | No | Default: 1 |

**Response:** `BannerResponse`

---

### 5. Update Banner (Admin)

- **Endpoint:** `PUT /api/banners/{id}`
- **Auth:** Required (`ROLE_ADMIN`)
- **Content-Type:** `multipart/form-data`

**Request Body:** | Field | Type | Required | Description | |-------|------|----------|-------------| | `title` | string | Yes | Banner title | | `linkUrl` | string | No | Link URL when clicked | | `bannerUrl` | string | No | Existing banner image URL | | `imageFile` | MultipartFile | No | Banner image file | | `position` | BannerPosition | Yes | HOME_HERO or POPUP | | `sortOrder` | int | Yes | Sort order |

**Response:** `BannerResponse`

---

### 6. Update Banner Status (Admin)

- **Endpoint:** `PATCH /api/banners/{id}/status`
- **Auth:** Required (`ROLE_ADMIN`)

**Request Body:**

```json
{
  "active": "boolean (required)"
}
```

**Response:** `BannerResponse`

---

### 7. Delete Banner (Admin)

- **Endpoint:** `DELETE /api/banners/{id}`
- **Auth:** Required (`ROLE_ADMIN`)

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": "Xóa banner thành công"
}
```

---

## Bookmarks (`/api/bookmarks`)

### 1. Get My Bookmarks

- **Endpoint:** `GET /api/bookmarks/me`
- **Auth:** Required

**Query Parameters:** | Param | Type | Default | Description | |-------|------|---------|-------------| | `page` | int | 0 | Page number | | `size` | int | 10 | Page size |

**Response:** `PageResponse<BookmarkResponse>`

Where `BookmarkResponse`:

```json
{
  "user": "UserResponse",
  "story": "StoryResponse"
}
```

---

### 2. Get Bookmark By StoryId

- **Endpoint:** `GET /api/bookmarks/{storyId}`
- **Auth:** Required

**Path Parameters:** | Param | Type | Description | |-------|------|-------------| | `storyId` | string | Story ID |

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "user": "UserResponse",
    "story": "StoryResponse"
  }
}
```

---

### 3. Create Bookmark

- **Endpoint:** `POST /api/bookmarks/{storyId}`
- **Auth:** Required

**Path Parameters:** | Param | Type | Description | |-------|------|-------------| | `storyId` | string | Story ID |

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "user": "UserResponse",
    "story": "StoryResponse"
  }
}
```

---

### 4. Delete Bookmark

- **Endpoint:** `DELETE /api/bookmarks/{storyId}`
- **Auth:** Required

**Path Parameters:** | Param | Type | Description | |-------|------|-------------| | `storyId` | string | Story ID |

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": "Xóa theo dõi truyện thành công"
}
```

---

## Reading Histories (`/api/reading-histories`)

### 1. Get Last Reading Chapter in Story

- **Endpoint:** `GET /api/reading-histories/story/{storyId}`
- **Auth:** Public

**Headers:** `Session-Id` (optional)

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": {
    "id": "string",
    "story": "StoryResponse",
    "chapter": "ChapterResponse",
    "lastReadAt": "LocalDateTime"
  }
}
```

---

### 2. Get My Reading History

- **Endpoint:** `GET /api/reading-histories`
- **Auth:** Required

**Query Parameters:** | Param | Type | Default | Description | |-------|------|---------|-------------| | `page` | int | 1 | Page number | | `size` | int | 10 | Page size | | `type` | HISTORY_TYPE | - | STORY or CHAPTER | | `fromDate` | date | - | Filter from date (ISO: yyyy-MM-dd) | | `toDate` | date | - | Filter to date (ISO: yyyy-MM-dd) |

**Headers:** `Session-Id` (optional)

**Response:** `PageResponse<ReadingHistoryResponse>`

---

### 3. Create/Update Reading History

- **Endpoint:** `POST /api/reading-histories`
- **Auth:** Public

**Headers:** `Session-Id` (optional)

**Request Body:**

```json
{
  "chapterId": "string (required)",
  "storyId": "string (required)",
  "type": "STORY | CHAPTER (required)"
}
```

**Response:** `ReadingHistoryResponse`

---

### 4. Delete My Reading History

- **Endpoint:** `DELETE /api/reading-histories`
- **Auth:** Public

**Headers:** `Session-Id` (optional)

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": "Xóa lịch sử đọc truyện thành công"
}
```

---

## Audit Logs (`/api/audit-logs`)

### 1. Get Audit Logs

- **Endpoint:** `GET /api/audit-logs`
- **Auth:** Required

**Request Body (POST with JSON):**

```json
{
  "page": "int (default: 1)",
  "size": "int (default: 10)",
  "actorId": "string (optional)",
  "action": "REGISTER | LOGIN | LOGOUT | CREATE | UPDATE | DELETE | PUBLISH | UNPUBLISH | APPROVE | REJECT | BAN | UNBAN | CHANGE_ROLE | CHANGE_PASSWORD | CHANGE_EMAIL | RESET_PASSWORD (optional)",
  "objectType": "USER | STORY | CHAPTER | COMMENT | PUBLISH_REQUEST | GENRE | TAG | ROLE | SYSTEM (optional)",
  "objectId": "string (optional)",
  "fromDate": "LocalDateTime (optional)",
  "toDate": "LocalDateTime (optional)"
}
```

**Response:** `PageResponse<AuditLogResponse>`

---

## Moderation Actions (`/api/moderation-actions`)

### 1. Get Moderation Actions

- **Endpoint:** `POST /api/moderation-actions`
- **Auth:** Required

**Request Body (POST with JSON):**

```json
{
  "page": "int (default: 1)",
  "size": "int (default: 10)",
  "objectId": "string (optional)",
  "objectType": "STORY | CHAPTER | COMMENT | USER (optional)",
  "actionType": "BAN | UNBAN (optional)",
  "violationType": "COPYRIGHT | PORNOGRAPHY | VIOLENCE | SPAM | HARASSMENT | OTHER (optional)"
}
```

**Response:** `PageResponse<ModerationActionResponse>`

---

### 2. Get Moderation Action by ID

- **Endpoint:** `GET /api/moderation-actions/{id}`
- **Auth:** Required

**Response:** `ModerationActionResponse`

---

### ModerationActionResponse

```json
{
  "id": "string",
  "objectId": "string",
  "objectType": "STORY | CHAPTER | COMMENT | USER",
  "storyResponse": "StoryResponse (optional)",
  "chapterResponse": "ChapterResponse (optional)",
  "userResponse": "UserResponse (optional)",
  "commentResponse": "CommentResponse (optional)",
  "actionType": "BAN | UNBAN",
  "violationType": "COPYRIGHT | PORNOGRAPHY | VIOLENCE | SPAM | HARASSMENT | OTHER (optional)",
  "reason": "string (optional)",
  "adminId": "string",
  "adminUsername": "string",
  "createdAt": "LocalDateTime"
}
```

---

## Ban Appeals (`/api/ban-appeals`)

### 1. Create Ban Appeal

- **Endpoint:** `POST /api/ban-appeals`
- **Auth:** Required

**Content-Type:** `multipart/form-data`

**Request Body:** | Field | Type | Required | Description | |-------|------|----------|-------------| | `moderationActionId` | string | Yes | Moderation action ID | | `content` | string | Yes | Appeal content | | `attachments` | List<MultipartFile> | No | Attachment files |

**Response:** `BanAppealResponse`

---

### 2. Get My Ban Appeals

- **Endpoint:** `GET /api/ban-appeals/me`
- **Auth:** Required

**Query Parameters:** | Param | Type | Default | Description | |-------|------|---------|-------------| | `page` | int | 1 | Page number | | `size` | int | 10 | Page size |

**Response:** `PageResponse<BanAppealResponse>`

---

### 3. Delete My Ban Appeal

- **Endpoint:** `DELETE /api/ban-appeals/{id}`
- **Auth:** Required (owner only)

**Response:**

```json
{
  "code": 200,
  "message": "Success",
  "data": "Xóa khiếu nại thành công"
}
```

---

### 4. Get All Ban Appeals (Admin)

- **Endpoint:** `GET /api/ban-appeals`
- **Auth:** Required (`ROLE_ADMIN`)

**Query Parameters:** | Param | Type | Default | Description | |-------|------|---------|-------------| | `page` | int | 1 | Page number | | `size` | int | 10 | Page size | | `status` | BanAppealStatus | - | Filter by status (PENDING, APPROVED, REJECTED) |

**Response:** `PageResponse<BanAppealResponse>`

---

### 5. Approve Ban Appeal (Admin)

- **Endpoint:** `PATCH /api/ban-appeals/{id}/approve`
- **Auth:** Required (`ROLE_ADMIN`)

**Request Body:**

```json
{
  "reviewerNote": "string (optional)"
}
```

**Response:** `BanAppealResponse`

---

### 6. Reject Ban Appeal (Admin)

- **Endpoint:** `PATCH /api/ban-appeals/{id}/reject`
- **Auth:** Required (`ROLE_ADMIN`)

**Request Body:**

```json
{
  "reviewerNote": "string (required)"
}
```

**Response:** `BanAppealResponse`

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
