# SinoSEA Core (NestJS)

SinoSEA Core 是一个基于 NestJS 的对话网关服务，用于连接 Dify 应用，并通过 Valkey/Redis 维护会话上下文。它提供统一的聊天接口、会话持久化、健康检查，以及带请求 ID 的结构化日志输出，便于排查与追踪。 

## 功能概览

- **Dify 对话网关**：将消息转发到 Dify `/v1/chat-messages` 并返回回复。
- **会话管理**：基于 Valkey/Redis 保存 `sessionId` 与 `conversationId` 的映射。
- **健康检查**：`/health` 端点检测 Valkey 连接状态。
- **请求追踪**：自动生成或透传 `x-request-id`，统一日志链路。

## 环境要求

- Node.js 18+（推荐使用与 NestJS 11 兼容的版本）
- pnpm
- Valkey/Redis
- 可访问的 Dify API

## 快速开始

1. 安装依赖

```bash
pnpm install
```

2. 准备环境变量（示例 `.env`）

```ini
# Dify
DIFY_BASE_URL=https://api.dify.ai
DIFY_API_KEY=your_dify_api_key
DIFY_RESPONSE_MODE=blocking
DIFY_TIMEOUT_MS=15000

# Valkey/Redis
VALKEY_HOST=127.0.0.1
VALKEY_PORT=6379
VALKEY_PASSWORD=
VALKEY_DB=0
VALKEY_CONNECT_TIMEOUT=10000
```

3. 启动服务

```bash
# 开发模式
pnpm run start:dev

# 生产模式
pnpm run build
pnpm run start:prod
```

服务默认监听 `http://localhost:3000`。

## 接口说明

### `POST /chat`

**请求体**

```json
{
  "sessionId": "session-001",
  "userId": "user-123",
  "message": "你好，SinoSEA"
}
```

**响应**

```json
{
  "reply": "来自 Dify 的回复内容",
  "sessionId": "session-001"
}
```

**说明**

- `sessionId` 必填，用于会话归档。
- `userId` 选填，若不传则使用已有 session 的 userId 或 sessionId 作为兜底。
- 可在请求头中传递 `x-request-id`，未传则自动生成并回写响应头。

### `GET /health`

返回 Valkey 连接状态，用于健康检查和监控告警。

## 常用脚本

```bash
pnpm run start       # 启动服务
pnpm run start:dev   # 开发模式（watch）
pnpm run start:prod  # 生产模式
pnpm run test        # 单元测试
pnpm run lint        # 代码检查
```

## 项目结构

```
src/
  chat/        # Chat Controller & Service
  common/      # 日志与请求上下文
  config/      # 配置加载
  dify/        # Dify API 封装
  health/      # 健康检查
  infra/       # 基础设施（Valkey）
  session/     # 会话管理
```

## 许可

本项目为内部服务模板，当前未声明对外许可证。
