# AsePal NestJS

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

复制 `.env.example` 为 `.env` 后修改内部配置

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

详见 [API 文档](./API.md)

---

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

本项目采用 [GNU Affero General Public License v3.0 (AGPL-3.0)](LICENSE) 协议

## 作者

AsePal AI Team
