# SinoSEA NestJS

基于 NestJS 框架的企业级后端服务，集成了用户认证、聊天、Dify AI、对象存储和缓存等功能。

## 技术栈

- **框架**: NestJS 11.x
- **语言**: TypeScript 5.x
- **数据库**: PostgreSQL (TypeORM)
- **缓存**: Valkey/Redis (ioredis)
- **对象存储**: Cloudflare R2 (AWS S3 兼容)
- **认证**: JWT + Passport
- **AI集成**: Dify
- **包管理器**: pnpm

## 主要功能模块

### 🔐 认证模块 (Auth)

- 用户注册与登录
- JWT Token 认证
- Local Strategy 本地认证
- JWT Strategy Token 认证
- Cookie 存储 Access Token

### 💬 聊天模块 (Chat)

- 支持普通消息发送
- 支持 SSE 流式响应
- 集成 Dify AI 服务
- JWT 权限保护

### 🤖 Dify 集成

- Dify API 对接
- 支持阻塞模式和流式模式
- SSE 事件流处理
- 文件上传支持

### 👤 用户模块 (User)

- 用户信息管理
- TypeORM 实体映射
- 密码加密存储 (bcrypt)

### 📦 对象存储 (R2)

- Cloudflare R2 对接
- AWS S3 SDK 集成
- 文件上传与管理

### 🏥 健康检查 (Health)

- 应用健康状态监测
- Valkey/Redis 健康检查
- Terminus 集成

### 🔧 基础设施

- **Request Context**: 请求上下文管理
- **Request ID**: 请求追踪 ID 中间件
- **Valkey/Redis**: 缓存服务
- **全局验证管道**: class-validator + class-transformer
- **CORS**: 跨域支持

## 环境要求

- Node.js >= 18.x
- pnpm >= 8.x
- PostgreSQL >= 14.x
- Valkey/Redis >= 7.x

## 安装

```bash
# 安装依赖
pnpm install
```

## 环境变量配置

创建 `.env` 文件并配置以下环境变量：

```env
# 应用配置
NEST_PORT=3000

# 数据库配置
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=sinosea

# JWT 配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Dify 配置
DIFY_BASE_URL=https://api.dify.ai/v1
DIFY_API_KEY=your_dify_api_key
DIFY_RESPONSE_MODE=blocking
DIFY_TIMEOUT_MS=15000

# Cloudflare R2 配置
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-bucket.r2.dev

# Valkey/Redis 配置
VALKEY_HOST=localhost
VALKEY_PORT=6379
VALKEY_PASSWORD=
VALKEY_DB=0
```

## 运行

```bash
# 开发模式
pnpm run start:dev

# 生产模式
pnpm run build
pnpm run start:prod

# 调试模式
pnpm run start:debug
```

## 测试

```bash
# 单元测试
pnpm run test

# E2E 测试
pnpm run test:e2e

# 测试覆盖率
pnpm run test:cov

# 监听模式
pnpm run test:watch
```

## 代码规范

```bash
# 代码格式化
pnpm run format

# 代码检查
pnpm run lint
```

## API 端点

### 认证相关

- `POST /auth/register` - 用户注册
- `POST /auth/login` - 用户登录

### 聊天相关

- `POST /chat/send` - 发送消息 (需要认证)
- `POST /chat/stream` - 流式聊天 (需要认证)

### 用户相关

- `GET /user/info` - 获取用户信息 (需要认证)

### 健康检查

- `GET /health` - 健康检查端点

## 项目结构

```
src/
├── app.module.ts              # 应用主模块
├── main.ts                    # 应用入口文件
├── auth/                      # 认证模块
│   ├── dto/                   # 数据传输对象
│   ├── guards/                # 守卫
│   └── strategies/            # Passport 策略
├── chat/                      # 聊天模块
│   ├── chat.controller.ts
│   ├── chat.service.ts
│   └── dto/
├── user/                      # 用户模块
│   ├── user.entity.ts         # 用户实体
│   ├── user.service.ts
│   └── dto/
├── dify/                      # Dify AI 集成
│   ├── dify.service.ts
│   └── dify.types.ts
├── infra/                     # 基础设施
│   ├── r2/                    # R2 对象存储
│   └── valkey/                # Valkey 缓存
├── config/                    # 配置文件
├── common/                    # 公共模块
│   ├── context/               # 请求上下文
│   ├── middleware/            # 中间件
│   ├── constants.ts
│   └── types.ts
└── health/                    # 健康检查模块
```

## 核心特性

### 请求追踪

每个请求都会生成一个唯一的 Request ID，便于日志追踪和问题排查。

### 全局验证

使用 class-validator 和 class-transformer 进行全局参数验证和转换。

### JWT 认证

基于 JWT Token 的认证机制，Token 存储在 HttpOnly Cookie 中，提高安全性。

### 流式响应

支持 SSE (Server-Sent Events) 实现实时流式响应，适用于 AI 聊天等场景。

## 开发建议

1. 使用 TypeScript 严格模式
2. 遵循 NestJS 最佳实践
3. 使用 DTO 进行数据验证
4. 使用依赖注入管理服务
5. 编写单元测试和 E2E 测试
6. 使用 ESLint 和 Prettier 保持代码风格一致

## 许可证

UNLICENSED (私有项目)

## 作者

SinoSEA AI Team
