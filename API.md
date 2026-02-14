# API 接口文档

## 认证相关

### 用户注册

`POST /auth/register`

注册新用户账号。

**请求体**

```json
{
  "username": "string",
  "password": "string",
  "email": "string (可选)",
  "phone": "string (可选)"
}
```

**响应**

```json
{
  "accessToken": "jwt_token_string"
}
```

**说明**

- 注册成功后自动生成JWT令牌并返回
- 客户端需自行保存accessToken用于后续请求
- 可通过 `/user/info` 接口获取用户详细信息

---

### 用户登录

`POST /auth/login`

用户登录获取 JWT Token。

**请求体**

```json
{
  "username": "string",
  "password": "string"
}
```

**响应**

```json
{
  "access_token": "jwt_token_string"
}
```

**说明**

- 用户名、邮箱或手机号都可以用来登录

---

### 忘记密码 - 发送验证码

`POST /auth/forgot-password`

向用户的邮箱或手机号发送6位验证码用于重置密码。

**请求体**

```json
{
  "email": "string (可选)",
  "phone": "string (可选)"
}
```

**说明**

- `email` 和 `phone` 至少提供一个
- 验证码有效期为5分钟
- 即使用户不存在也会返回成功消息（防止用户枚举攻击）
- 验证码会通过Logger打印在服务端日志中

**响应**

```json
{
  "message": "Verification code sent to your email/phone"
}
```

---

### 忘记密码 - 重置密码

`POST /auth/reset-password`

使用验证码重置密码。

**请求体**

```json
{
  "identifier": "string (邮箱或手机号)",
  "verificationCode": "string (6位验证码)",
  "newPassword": "string"
}
```

**响应**

```json
{
  "message": "Password reset successfully"
}
```

**错误响应**

- `400 Bad Request`: 验证码过期或无效
- `400 Bad Request`: 用户不存在

---

## 聊天相关

### 发送消息

`POST /chat/send`

发送聊天消息到 Dify AI。

**认证**: 需要 JWT Token（在 Authorization Header 或 Cookie 中）

**请求体**

```json
{
  "message": "string",
  "conversationId": "string (不携带则创建新对话)"
}
```

**响应**

```json
{
  "answer": "string",
  "conversationId": "string"
}
```

---

### 流式聊天

`POST /chat/stream`

实时流式聊天，使用 SSE (Server-Sent Events)。

**认证**: 需要 JWT Token

**请求体**

```json
{
  "message": "string",
  "conversationId": "string (不携带则创建新对话)"
}
```

**响应类型**: text/event-stream

**响应数据**

```
data: "流式响应内容片段"
```

---

### 获取对话列表

`GET /chat/conversations`

获取当前用户的对话列表。

**认证**: 需要 JWT Token

**查询参数**

| 参数名  | 类型   | 默认值 | 说明                         |
| ------- | ------ | ------ | ---------------------------- |
| limit   | number | 20     | 返回多少条记录，最大100      |
| last_id | string | -      | 当前页最后的记录ID，用于分页 |

**响应**

```json
{
  "hasMore": true,
  "items": [
    {
      "id": "c_01HZX9QW6K3M8T4R2H7Q8A1B2C",
      "title": "重置密码怎么做",
      "createdAt": 1769140863000,
      "updatedAt": 1769141385000
    },
    {
      "id": "c_01HZX9ABC6K3M8T4R2H7Q8A9D8",
      "title": "JWT 随机值校验",
      "createdAt": 1769130000000,
      "updatedAt": 1769136000000
    }
  ]
}
```

---

### 获取对话历史

`GET /chat/messages`

获取指定对话的消息历史。

**认证**: 需要 JWT Token

**查询参数**

| 参数名          | 类型   | 必需 | 说明                            |
| --------------- | ------ | ---- | ------------------------------- |
| conversation_id | string | 是   | 对话ID                          |
| first_id        | string | 否   | 第一条消息的ID，用于分页        |
| limit           | number | 否   | 返回多少条消息，默认20，最大100 |

**响应**

```json
{
  "data": {
    "conversationId": "c_01HZX9QW6K3M8T4R2H7Q8A1B2C",
    "hasMore": true,
    "items": [
      {
        "id": "m_01HZX9QY4W6K3M8T4R2H7Q8A1B_user",
        "role": "user",
        "type": "text",
        "content": "如何实现忘记密码？"
      },
      {
        "id": "m_01HZX9QY4W6K3M8T4R2H7Q8A1B_assistant",
        "role": "assistant",
        "type": "text",
        "content": "可以用邮箱/手机号验证码……"
      },
      {
        "id": "m_01HZX9R2Y9M3K8W1P5J7S2D4F6_user",
        "role": "user",
        "type": "text",
        "content": "具体如何实现？"
      },
      {
        "id": "m_01HZX9R2Y9M3K8W1P5J7S2D4F6_assistant",
        "role": "assistant",
        "type": "text",
        "content": "1. 生成验证码\n2. 发送到用户邮箱\n3. 用户验证后重置密码"
      }
    ]
  }
}
```

**说明**

- 每条Dify消息会拆分为用户消息和助手消息两条记录
- 消息ID格式为 `{dify_message_id}_{role}`

---

### 删除会话

`DELETE /chat/conversations/:id`

删除一个指定的会话。

**认证**: 需要 JWT Token

**路径参数**

| 参数名 | 类型   | 说明    |
| ------ | ------ | ------- |
| id     | string | 会话 ID |

**响应**

- `204 No Content`: 删除成功，无内容返回。

---

### 会话重命名

`POST /chat/conversations/:id/name`

对会话进行重命名，或自动生成标题。

**认证**: 需要 JWT Token

**路径参数**

| 参数名 | 类型   | 说明    |
| ------ | ------ | ------- |
| id     | string | 会话 ID |

**请求体**

```json
{
  "name": "string (选填，若 autoGenerate 为 true 时可不传)",
  "autoGenerate": false
}
```

**说明**

- `name` 和 `autoGenerate` 至少提供一个
- 当 `autoGenerate` 为 `true` 时，Dify 会自动根据对话内容生成标题

**响应**

```json
{
  "id": "c_01HZX9QW6K3M8T4R2H7Q8A1B2C",
  "title": "新的会话名称",
  "createdAt": 1769140863000,
  "updatedAt": 1769141385000
}
```

---

## 用户相关

### 获取用户信息

`GET /user/info`

获取当前登录用户的完整信息。

**认证**: 需要 JWT Token

**响应**

```json
{
  "id": "uuid",
  "username": "string",
  "email": "string|null",
  "phone": "string|null",
  "avatarUrl": "string|null",
  "isActive": true,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

---

### 更新用户头像

`PUT /user/image`

上传或更新用户头像图片，存储到 Cloudflare R2。

**认证**: 需要 JWT Token

**请求类型**: multipart/form-data

**请求参数**
| 参数名 | 类型 | 说明 |
|------|------|------|
| file | File | 图片文件 |

**文件限制**

- **文件大小**: 最大 5MB
- **支持格式**: JPEG、PNG、GIF、WebP

**响应**

```json
{
  "id": "uuid",
  "username": "string",
  "email": "string|null",
  "phone": "string|null",
  "avatarUrl": "https://your-domain.com/avatars/uuid/timestamp.jpg",
  "isActive": true,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

**错误响应**

```json
{
  "statusCode": 400,
  "message": "File is required",
  "error": "Bad Request"
}
```

或

```json
{
  "statusCode": 413,
  "message": "File too large",
  "error": "Payload Too Large"
}
```

或

```json
{
  "statusCode": 400,
  "message": "Validation failed: file type is not supported",
  "error": "Bad Request"
}
```

---

## 健康检查

### 应用健康检查

`GET /health`

检查应用和依赖服务（如 Valkey）的健康状态。

**响应**

```json
{
  "status": "ok",
  "info": {
    "valkey": {
      "status": "up"
    }
  },
  "details": {
    "valkey": {
      "status": "up"
    }
  }
}
```

---

## 认证方式

所有需要认证的端点都支持以下两种方式提供 JWT Token：

### 方式 1: Authorization Header

```
Authorization: Bearer <your_jwt_token>
```

### 方式 2: Cookie

```
Cookie: access_token=<your_jwt_token>
```

---

## 错误响应

所有端点的错误响应格式如下：

```json
{
  "statusCode": 400,
  "message": "错误描述",
  "error": "错误类型"
}
```

常见 HTTP 状态码：

- `200`: 请求成功
- `400`: 请求参数错误
- `401`: 未认证或 Token 过期
- `403`: 无权限访问
- `404`: 资源不存在
- `413`: 请求体过大（文件过大）
- `500`: 服务器内部错误

---

## 分页与排序

暂不支持，后续版本可能添加。

---

## 速率限制

暂无限制，生产环境建议添加。

---

## 版本信息

- API 版本: v1
- 文档更新: 2026-01-24
- 框架: NestJS 11.x
