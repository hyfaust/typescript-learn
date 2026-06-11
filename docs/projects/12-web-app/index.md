# 项目12：Web 应用 - 构建博客系统

## 概述

本项目将带你构建一个完整的 Web 应用——博客系统。通过这个实战项目，你将学习 Deno Web 框架、路由系统、中间件、数据库集成、用户认证等核心技能，并深入理解 TypeScript 在 Web 开发中的优势。

### 项目特色

- **类型安全的 Web 开发**：接口定义请求/响应结构
- **中间件架构**：可复用的请求处理组件
- **RESTful API**：标准的 REST API 设计
- **模板引擎**：服务端渲染 HTML
- **JWT 认证**：安全的用户身份验证

## 1. Deno Web 框架

### 1.1 框架选择

Deno 生态系统中有多个 Web 框架可供选择：

| 框架 | 特点 | 适用场景 |
|------|------|----------|
| **Deno 标准库** | 原生支持，无依赖 | 简单应用，学习基础 |
| **Oak** | 类似 Koa，中间件架构 | 中型应用，API 服务 |
| **Hono** | 轻量级，高性能 | 微服务，边缘计算 |
| **Fresh** | 全栈框架，零运行时 | 现代 Web 应用 |

### 1.2 为什么选择标准库

本项目使用 Deno 标准库（`Deno.serve`）：

1. **无外部依赖**：减少项目复杂度
2. **学习基础**：理解 HTTP 服务器原理
3. **TypeScript 原生**：完整类型支持
4. **Web 标准 API**：基于 Fetch API

```typescript
// 基本 HTTP 服务器
Deno.serve({ port: 8000 }, (request: Request) => {
  return new Response("Hello, Deno!");
});
```

### 1.3 其他框架示例

#### Oak 框架

```typescript
import { Application, Router } from "https://deno.land/x/oak/mod.ts";

const app = new Application();
const router = new Router();

router.get("/", (ctx) => {
  ctx.response.body = "Hello, Oak!";
});

app.use(router.routes());
app.listen({ port: 8000 });
```

#### Hono 框架

```typescript
import { Hono } from "https://deno.land/x/hono/mod.ts";

const app = new Hono();

app.get("/", (c) => c.text("Hello, Hono!"));

Deno.serve(app.fetch);
```

#### Fresh 框架

```typescript
// routes/index.tsx
export default function Home() {
  return (
    <div>
      <h1>Hello, Fresh!</h1>
    </div>
  );
}
```

## 2. 路由系统

### 2.1 路由基础

路由是 Web 应用的核心，负责将 URL 映射到处理函数：

```typescript
// 路由定义
interface Route {
  method: HttpMethod;
  path: string;
  handler: RouteHandler;
  pattern: RegExp;
  paramNames: string[];
}

// 路由处理器
type RouteHandler = (
  request: Request,
  params: RouteParams,
) => Response | Promise<Response>;
```

### 2.2 路径参数

```typescript
// 静态路径
router.get("/articles", handleArticles);

// 动态参数
router.get("/articles/:id", handleArticle);

// 多级参数
router.get("/users/:userId/posts/:postId", handleUserPost);

// 通配符
router.get("/files/*", handleFiles);
```

### 2.3 路由匹配实现

```typescript
class Router {
  private routes: Route[] = [];

  addRoute(method: HttpMethod, path: string, handler: RouteHandler): void {
    const { pattern, paramNames } = this.pathToPattern(path);
    this.routes.push({ method, path, handler, pattern, paramNames });
  }

  private pathToPattern(path: string): { pattern: RegExp; paramNames: string[] } {
    const paramNames: string[] = [];
    const patternStr = path
      .replace(/:([^/]+)/g, (_, name) => {
        paramNames.push(name);
        return "([^/]+)";
      })
      .replace(/\*/g, "(.*)");

    return {
      pattern: new RegExp(`^${patternStr}$`),
      paramNames,
    };
  }

  match(method: string, pathname: string): { route: Route; params: Record<string, string> } | null {
    for (const route of this.routes) {
      if (route.method !== method) continue;
      const match = pathname.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, i) => {
          params[name] = match[i + 1] ?? "";
        });
        return { route, params };
      }
    }
    return null;
  }
}
```

**TypeScript 优势**：使用接口定义路由结构，编译时检查路由配置。

### 2.4 查询参数

```typescript
function parseQueryString(url: string): Record<string, string> {
  const urlObj = new URL(url, "http://localhost");
  const params: Record<string, string> = {};
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

// 使用示例
// GET /articles?page=2&limit=10
const params = parseQueryString(request.url);
console.log(params.page);  // "2"
console.log(params.limit); // "10"
```

## 3. 中间件

### 3.1 中间件概念

中间件是处理请求的函数链，每个中间件可以：
1. 处理请求
2. 修改请求/响应
3. 调用下一个中间件
4. 终止请求链

```typescript
type Middleware = (
  request: Request,
  next: (request: Request) => Response | Promise<Response>,
) => Response | Promise<Response>;
```

### 3.2 中间件执行顺序

```typescript
// 中间件链
app.use(loggerMiddleware);    // 1. 记录请求
app.use(corsMiddleware);      // 2. 处理 CORS
app.use(authMiddleware);      // 3. 身份验证
app.use(validationMiddleware); // 4. 请求验证
app.use(routerMiddleware);    // 5. 路由处理
app.use(errorMiddleware);     // 6. 错误处理
```

### 3.3 常用中间件

#### 日志中间件

```typescript
function loggerMiddleware(): Middleware {
  return async (request, next) => {
    const start = performance.now();
    console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`);

    const response = await next(request);

    const duration = performance.now() - start;
    console.log(`[${new Date().toISOString()}] ${response.status} (${duration.toFixed(2)}ms)`);

    return response;
  };
}
```

#### CORS 中间件

```typescript
function corsMiddleware(options: { origin: string }): Middleware {
  return async (request, next) => {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": options.origin,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    const response = await next(request);
    response.headers.set("Access-Control-Allow-Origin", options.origin);
    return response;
  };
}
```

#### 认证中间件

```typescript
function authMiddleware(): Middleware {
  return async (request, next) => {
    const token = request.headers.get("Authorization")?.slice(7);

    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload) {
      return new Response("Invalid token", { status: 401 });
    }

    // 将用户信息添加到请求头
    const headers = new Headers(request.headers);
    headers.set("x-user-id", payload.sub);

    const newRequest = new Request(request.url, {
      method: request.method,
      headers,
      body: request.body,
    });

    return await next(newRequest);
  };
}
```

**TypeScript 优势**：使用类型定义确保中间件签名一致。

## 4. 模板引擎

### 4.1 模板语法

我们实现了一个简单的模板引擎：

```html
<!-- 变量替换 -->
<h1>{{title}}</h1>
<p>作者: {{author}}</p>

<!-- 条件语句 -->
{{#if isAdmin}}
  <button>管理</button>
{{/if}}

<!-- 循环 -->
<ul>
  {{#each items}}
    <li>{{name}} - {{price}}</li>
  {{/each}}
</ul>
```

### 4.2 模板引擎实现

```typescript
class TemplateEngine {
  private cache = new Map<string, string>();

  constructor(private templateDir: string) {}

  async render(templateName: string, context: Record<string, unknown>): Promise<string> {
    let template = this.cache.get(templateName);

    if (!template) {
      template = await Deno.readTextFile(`${this.templateDir}/${templateName}`);
      this.cache.set(templateName, template);
    }

    // 替换变量
    let result = template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return String(context[key] ?? "");
    });

    // 处理条件语句
    result = result.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, content) => {
      return context[key] ? content : "";
    });

    // 处理循环
    result = result.replace(/\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, key, template) => {
      const items = context[key];
      if (!Array.isArray(items)) return "";

      return items.map(item => {
        let itemResult = template;
        for (const [k, v] of Object.entries(item)) {
          itemResult = itemResult.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(v));
        }
        return itemResult;
      }).join("");
    });

    return result;
  }
}
```

**TypeScript 优势**：使用 `Record<string, unknown>` 定义模板上下文类型。

## 5. 数据库集成

### 5.1 SQLite

```typescript
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("blog.db");

// 创建表
db.execute(`
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 插入数据
db.execute("INSERT INTO articles (title, content, author) VALUES (?, ?, ?)", [
  "My Article",
  "Article content...",
  "admin",
]);

// 查询数据
const articles = db.query("SELECT * FROM articles WHERE author = ?", ["admin"]);
for (const [id, title, content, author, createdAt] of articles) {
  console.log({ id, title, content, author, createdAt });
}
```

### 5.2 PostgreSQL

```typescript
import { Client } from "https://deno.land/x/postgres/mod.ts";

const client = new Client({
  user: "postgres",
  password: "password",
  database: "blog",
  hostname: "localhost",
  port: 5432,
});

await client.connect();

// 创建表
await client.queryObject(`
  CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// 插入数据
await client.queryObject(
  "INSERT INTO articles (title, content, author) VALUES ($1, $2, $3)",
  ["My Article", "Article content...", "admin"],
);

// 查询数据
const result = await client.queryObject(
  "SELECT * FROM articles WHERE author = $1",
  ["admin"],
);
console.log(result.rows);

await client.end();
```

### 5.3 ORM 示例（DenoDB）

```typescript
import { Model, DataTypes, Database } from "https://deno.land/x/denodb/mod.ts";

// 定义模型
class Article extends Model {
  static table = "articles";
  static timestamps = true;

  static fields = {
    id: { primaryKey: true, autoIncrement: true },
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    author: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      defaultValue: "draft",
    },
  };
}

// 连接数据库
const db = new Database("sqlite", { filepath: "./blog.db" });
db.link([Article]);
await db.sync();

// 创建文章
const article = await Article.create({
  title: "My Article",
  content: "Article content...",
  author: "admin",
});

// 查询文章
const articles = await Article.where("author", "admin").all();
```

**TypeScript 优势**：ORM 使用类型定义模型字段，编译时检查数据库操作。

## 6. 用户认证

### 6.1 JWT 认证流程

```
1. 用户登录 → 验证凭据
2. 服务器生成 JWT Token
3. 客户端存储 Token
4. 后续请求携带 Token
5. 服务器验证 Token
```

### 6.2 JWT 实现

```typescript
interface JwtPayload {
  sub: string;      // 用户 ID
  username: string;  // 用户名
  role: string;      // 角色
  iat: number;       // 签发时间
  exp: number;       // 过期时间
}

class JwtAuth {
  constructor(private secret: string) {}

  createToken(payload: Omit<JwtPayload, "iat" | "exp">, expiresIn = 3600): string {
    const now = Math.floor(Date.now() / 1000);
    const fullPayload: JwtPayload = {
      ...payload,
      iat: now,
      exp: now + expiresIn,
    };

    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = btoa(JSON.stringify(fullPayload));
    const signature = btoa(`${header}.${body}.${this.secret}`);

    return `${header}.${body}.${signature}`;
  }

  verifyToken(token: string): JwtPayload | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1])) as JwtPayload;

      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return null; // Token 已过期
      }

      return payload;
    } catch {
      return null;
    }
  }
}
```

### 6.3 密码哈希

```typescript
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}
```

**TypeScript 优势**：使用 `Omit` 工具类型创建 Token 时排除自动生成的字段。

## 7. REST API 设计

### 7.1 RESTful 原则

1. **资源导向**：URL 表示资源
2. **HTTP 方法**：GET（读取）、POST（创建）、PUT（更新）、DELETE（删除）
3. **无状态**：每个请求包含所有必要信息
4. **统一接口**：一致的 URL 和响应格式

### 7.2 API 设计示例

```
GET    /api/articles          # 获取文章列表
GET    /api/articles/:id      # 获取单个文章
POST   /api/articles          # 创建文章
PUT    /api/articles/:id      # 更新文章
DELETE /api/articles/:id      # 删除文章

GET    /api/articles/:id/comments  # 获取文章评论
POST   /api/articles/:id/comments  # 添加评论

GET    /api/users/:id         # 获取用户信息
GET    /api/tags              # 获取所有标签
GET    /api/search?q=keyword  # 搜索文章
```

### 7.3 响应格式

```typescript
// 成功响应
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// 错误响应
interface ErrorResponse {
  success: false;
  error: string;
  details?: ValidationError[];
}

// 分页响应
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 7.4 状态码使用

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 | OK | 成功获取/更新资源 |
| 201 | Created | 成功创建资源 |
| 204 | No Content | 成功删除资源 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 422 | Unprocessable Entity | 数据验证失败 |
| 429 | Too Many Requests | 请求过于频繁 |
| 500 | Internal Server Error | 服务器内部错误 |

**TypeScript 优势**：使用泛型接口定义不同类型的 API 响应。

## 8. 部署和运维

### 8.1 Deno Deploy

```bash
# 安装 deployctl
deno install -A -f https://deno.land/x/deploy/deployctl.ts

# 部署到 Deno Deploy
deployctl deploy --project=my-blog server.ts
```

### 8.2 Docker 部署

```dockerfile
FROM denoland/deno:latest

WORKDIR /app

# 缓存依赖
COPY deno.json .
RUN deno cache server.ts

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 8000

# 启动服务器
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-env", "server.ts"]
```

### 8.3 环境变量

```typescript
// 从环境变量读取配置
const config = {
  port: parseInt(Deno.env.get("PORT") ?? "8000"),
  hostname: Deno.env.get("HOSTNAME") ?? "0.0.0.0",
  databaseUrl: Deno.env.get("DATABASE_URL") ?? "./blog.db",
  jwtSecret: Deno.env.get("JWT_SECRET") ?? "default-secret",
  nodeEnv: Deno.env.get("NODE_ENV") ?? "development",
};
```

### 8.4 健康检查

```typescript
// 健康检查端点
router.get("/health", async () => {
  try {
    // 检查数据库连接
    await db.query("SELECT 1");

    return jsonResponse({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: performance.now(),
    });
  } catch (error) {
    return jsonResponse(
      {
        status: "unhealthy",
        error: error.message,
      },
      503,
    );
  }
});
```

## 9. 实战项目：博客系统

### 9.1 功能特性

我们的博客系统支持：

1. **文章管理**：创建、编辑、删除文章
2. **用户认证**：JWT Token 认证
3. **标签系统**：文章分类和标签
4. **搜索功能**：文章内容搜索
5. **分页查询**：支持分页浏览
6. **RESTful API**：标准的 API 接口
7. **模板渲染**：服务端 HTML 渲染

### 9.2 使用示例

```bash
# 启动服务器
deno run --allow-net --allow-read server.ts

# API 示例
# 获取文章列表
curl http://localhost:8000/api/articles

# 获取单个文章
curl http://localhost:8000/api/articles/1

# 创建文章
curl -X POST http://localhost:8000/api/articles \
  -H "Content-Type: application/json" \
  -d '{"title":"New Article","content":"Article content..."}'

# 搜索文章
curl http://localhost:8000/api/search?q=typescript

# 浏览网页
# http://localhost:8000/
# http://localhost:8000/articles
# http://localhost:8000/articles/1
```

### 9.3 项目结构

```
12-web-app/
├── README.md          # 本文件
├── deno.json          # Deno 配置
├── server.ts          # Web 服务器主程序
├── routes.ts          # 路由定义
└── middleware.ts       # 中间件实现
```

### 9.4 核心代码

#### 服务器启动

```typescript
import { WebServer, Router } from "./server.ts";
import { createApiRouter, createPageRouter, InMemoryDatabase } from "./routes.ts";

// 创建数据库
const db = new InMemoryDatabase();

// 创建服务器
const server = new WebServer({
  port: 8000,
  cors: { origin: "*" },
  rateLimit: { windowMs: 60000, maxRequests: 100 },
});

// 配置路由
const apiRouter = createApiRouter(db);
const pageRouter = createPageRouter(db, "./templates");

// 合并路由
const router = server.getRouter();

// 注册 API 路由
for (const route of apiRouter.getRoutes()) {
  router.addRoute(route.method, route.path, route.handler);
}

// 注册页面路由
for (const route of pageRouter.getRoutes()) {
  router.addRoute(route.method, route.path, route.handler);
}

// 启动服务器
await server.start();
```

#### 路由处理

```typescript
// 获取文章列表
router.get("/api/articles", (request, params) => {
  const pagination = parsePagination(params.query);
  const result = db.getArticles(pagination);
  return apiResponse(result);
});

// 创建文章
router.post("/api/articles", async (request, params) => {
  const body = params.body as CreateArticleRequest;

  if (!body?.title || !body.content) {
    return apiError("Title and content are required");
  }

  const article = db.createArticle(body, "1");
  return apiResponse(article, "Article created successfully");
});
```

## 10. 示例代码说明

### 10.1 server.ts - Web 服务器

**核心功能**：
- `Router` 类：路由系统实现
- `WebServer` 类：Web 服务器封装
- `TemplateEngine` 类：模板引擎
- `JwtAuth` 类：JWT 认证工具
- HTTP 工具函数：`jsonResponse`、`htmlResponse`、`errorResponse`

**TypeScript 亮点**：
- 接口定义路由和中间件类型
- 泛型支持通用处理函数
- 类型守卫处理不同请求类型

### 10.2 routes.ts - 路由定义

**核心功能**：
- `InMemoryDatabase` 类：内存数据库（演示用）
- `createApiRouter`：API 路由定义
- `createPageRouter`：页面路由定义
- 分页、搜索、标签等功能

**TypeScript 亮点**：
- 接口定义数据模型（Article、User）
- 泛型分页结果类型
- 类型安全的数据库操作

### 10.3 middleware.ts - 中间件

**核心功能**：
- `createRequestLogger`：请求日志
- `createAuthMiddleware`：JWT 认证
- `createValidationMiddleware`：请求验证
- `createCacheMiddleware`：响应缓存
- `createSecurityMiddleware`：安全头
- `createThrottleMiddleware`：限流

**TypeScript 亮点**：
- 接口定义中间件配置
- 函数重载支持不同配置
- 泛型验证规则

## 11. 练习题

### 练习1：添加数据库支持

将内存数据库替换为真实的数据库：
1. 集成 SQLite（使用 Deno 标准库）
2. 实现数据库迁移
3. 添加事务支持
4. 实现连接池

### 练习2：实现完整的用户系统

扩展用户认证功能：
1. 用户注册和登录
2. 密码重置
3. 角色权限管理
4. OAuth 集成（GitHub、Google）

### 练习3：添加实时功能

使用 WebSocket 实现实时功能：
1. 实时通知
2. 在线用户统计
3. 实时评论
4. 聊天功能

### 练习4：实现文件上传

添加文件上传功能：
1. 图片上传和处理
2. 文件存储（本地/云存储）
3. 图片缩略图生成
4. 文件类型验证

### 练习5：构建管理后台

创建管理后台：
1. 文章管理界面
2. 用户管理
3. 数据统计图表
4. 系统配置

### 练习6：性能优化

优化应用性能：
1. 实现 Redis 缓存
2. 数据库查询优化
3. 静态资源 CDN
4. 服务端渲染优化

## 12. TypeScript 与 JavaScript 的区别

### 12.1 类型安全的路由定义

**JavaScript**:
```javascript
router.get("/api/articles/:id", (request, params) => {
  const id = params.id;  // 类型是 any
  // 可能是字符串、数字、undefined
  // 无法在编译时检查
});
```

**TypeScript**:
```typescript
interface RouteParams {
  path: Record<string, string>;
  query: Record<string, string>;
}

router.get("/api/articles/:id", (request, params: RouteParams) => {
  const id: string = params.path.id;  // 明确是 string 类型
  // 编译时确保类型正确
});
```

### 12.2 接口定义数据模型

**JavaScript**:
```javascript
// 没有明确的数据结构定义
const article = {
  title: "My Article",
  content: "...",
  // 可能缺少必需字段
  // 可能有拼写错误
};
```

**TypeScript**:
```typescript
interface Article {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly author: string;
  readonly createdAt: Date;
  readonly status: "draft" | "published";
}

const article: Article = {
  id: "1",
  title: "My Article",
  content: "...",
  author: "admin",
  createdAt: new Date(),
  status: "published",
  // 缺少任何字段都会报错
  // 拼写错误会报错
  // 类型不匹配会报错
};
```

### 12.3 泛型 API 响应

**JavaScript**:
```javascript
function apiResponse(data) {
  return {
    success: true,
    data: data,
  };
  // 返回类型不明确
}
```

**TypeScript**:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

function apiResponse<T>(data: T): Response {
  const body: ApiResponse<T> = {
    success: true,
    data,
  };
  return jsonResponse(body);
}

// 使用时类型明确
const response = apiResponse<Article[]>(articles);
// data 的类型是 Article[]
```

### 12.4 类型安全的中间件

**JavaScript**:
```javascript
function authMiddleware() {
  return async (request, next) => {
    // request 和 next 的类型不明确
    // 无法在编译时检查
  };
}
```

**TypeScript**:
```typescript
type Middleware = (
  request: Request,
  next: (request: Request) => Response | Promise<Response>,
) => Response | Promise<Response>;

function authMiddleware(): Middleware {
  return async (request, next) => {
    // request 类型是 Request
    // next 类型是 (request: Request) => Response | Promise<Response>
    // 编译时确保类型正确
  };
}
```

## 13. 运行项目

### 13.1 环境准备

```bash
# 确保 Deno 已安装
deno --version

# 进入项目目录
cd 12-web-app
```

### 13.2 运行示例

```bash
# 启动服务器
deno run --allow-net --allow-read server.ts

# 或使用 deno.json 中的任务
deno task start
```

### 13.3 测试 API

```bash
# 获取文章列表
curl http://localhost:8000/api/articles

# 获取单个文章
curl http://localhost:8000/api/articles/1

# 搜索文章
curl http://localhost:8000/api/search?q=typescript

# 获取标签
curl http://localhost:8000/api/tags

# 浏览网页
# 打开浏览器访问 http://localhost:8000/
```

### 13.4 类型检查

```bash
# 运行类型检查
deno check server.ts routes.ts middleware.ts

# 运行测试
deno test

# 格式化代码
deno fmt
```

## 14. 总结

通过本项目，你学习了：

1. **Deno Web 框架**：标准库、Oak、Hono、Fresh
2. **路由系统**：路径参数、查询参数、路由匹配
3. **中间件架构**：日志、认证、验证、缓存
4. **模板引擎**：变量替换、条件语句、循环
5. **数据库集成**：SQLite、PostgreSQL、ORM
6. **用户认证**：JWT、密码哈希、角色授权
7. **REST API 设计**：资源导向、状态码、响应格式
8. **部署运维**：Deno Deploy、Docker、环境变量
9. **TypeScript 优势**：类型安全、接口设计、泛型应用

这些技能将帮助你构建生产级别的 Web 应用。继续学习和实践，你将成为一名优秀的 TypeScript Web 开发者！


---

## 项目导航

[上一个项目：文件处理工具](/projects/11-file-processing/)

[返回学习路径](/learning-path/)
