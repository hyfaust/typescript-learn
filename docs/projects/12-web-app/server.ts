/**
 * server.ts - Web 服务器主程序
 *
 * 本文件实现了一个基于 Deno 标准库的 Web 服务器：
 * - HTTP 服务器基础
 * - 路由系统
 * - 中间件支持
 * - 静态文件服务
 * - 模板渲染
 *
 * TypeScript 优势：
 * - 类型安全的请求/响应处理
 * - 接口定义路由和中间件
 * - 泛型支持通用处理函数
 */

// ============================================================================
// 类型定义
// ============================================================================

/** HTTP 方法 */
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";

/** 路由处理器 */
type RouteHandler = (request: Request, params: RouteParams) => Response | Promise<Response>;

/** 路由参数 */
interface RouteParams {
  readonly path: Record<string, string>;
  readonly query: Record<string, string>;
  readonly body?: unknown;
}

/** 路由定义 */
interface Route {
  readonly method: HttpMethod;
  readonly path: string;
  readonly handler: RouteHandler;
  readonly pattern: RegExp;
  readonly paramNames: string[];
}

/** 中间件函数 */
type Middleware = (
  request: Request,
  next: (request: Request) => Response | Promise<Response>,
) => Response | Promise<Response>;

/** 服务器配置 */
interface ServerConfig {
  readonly port: number;
  readonly hostname?: string;
  readonly staticDir?: string;
  readonly templateDir?: string;
  readonly cors?: CorsConfig;
  readonly rateLimit?: RateLimitConfig;
}

/** CORS 配置 */
interface CorsConfig {
  readonly origin: string | string[];
  readonly methods?: HttpMethod[];
  readonly headers?: string[];
  readonly credentials?: boolean;
}

/** 速率限制配置 */
interface RateLimitConfig {
  readonly windowMs: number;
  readonly maxRequests: number;
}

/** 模板上下文 */
interface TemplateContext {
  readonly [key: string]: unknown;
}

/** 会话数据 */
interface Session {
  readonly id: string;
  readonly data: Map<string, unknown>;
  readonly createdAt: Date;
  readonly expiresAt: Date;
}

/** 用户信息 */
interface User {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly role: "admin" | "user";
}

/** JWT Payload */
interface JwtPayload {
  readonly sub: string;
  readonly username: string;
  readonly role: string;
  readonly iat: number;
  readonly exp: number;
}

// ============================================================================
// HTTP 工具函数
// ============================================================================

/**
 * 创建 JSON 响应
 */
export function jsonResponse(data: unknown, status = 200, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

/**
 * 创建 HTML 响应
 */
export function htmlResponse(html: string, status = 200): Response {
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

/**
 * 创建文本响应
 */
export function textResponse(text: string, status = 200): Response {
  return new Response(text, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

/**
 * 创建重定向响应
 */
export function redirectResponse(url: string, status = 302): Response {
  return new Response(null, {
    status,
    headers: { Location: url },
  });
}

/**
 * 创建错误响应
 */
export function errorResponse(message: string, status = 500): Response {
  return jsonResponse({ error: message }, status);
}

/**
 * 解析 URL 查询参数
 */
export function parseQueryString(url: string): Record<string, string> {
  const urlObj = new URL(url, "http://localhost");
  const params: Record<string, string> = {};

  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

/**
 * 解析请求体
 */
export async function parseBody(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return await request.json();
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await request.text();
    const params = new URLSearchParams(text);
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const result: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  return await request.text();
}

// ============================================================================
// 路由器
// ============================================================================

/**
 * 路由器类
 *
 * TypeScript 优势：
 * - 使用 Map 存储路由，类型安全
 * - 方法重载支持不同 HTTP 方法
 */
export class Router {
  private routes: Route[] = [];
  private middlewares: Middleware[] = [];

  /**
   * 添加中间件
   */
  use(middleware: Middleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * 添加路由
   */
  addRoute(method: HttpMethod, path: string, handler: RouteHandler): this {
    const { pattern, paramNames } = this.pathToPattern(path);

    this.routes.push({
      method,
      path,
      handler,
      pattern,
      paramNames,
    });

    return this;
  }

  /**
   * GET 路由
   */
  get(path: string, handler: RouteHandler): this {
    return this.addRoute("GET", path, handler);
  }

  /**
   * POST 路由
   */
  post(path: string, handler: RouteHandler): this {
    return this.addRoute("POST", path, handler);
  }

  /**
   * PUT 路由
   */
  put(path: string, handler: RouteHandler): this {
    return this.addRoute("PUT", path, handler);
  }

  /**
   * DELETE 路由
   */
  delete(path: string, handler: RouteHandler): this {
    return this.addRoute("DELETE", path, handler);
  }

  /**
   * PATCH 路由
   */
  patch(path: string, handler: RouteHandler): this {
    return this.addRoute("PATCH", path, handler);
  }

  /**
   * 将路径模式转换为正则表达式
   *
   * TypeScript 优势：使用解构赋值返回多个值
   */
  private pathToPattern(path: string): { pattern: RegExp; paramNames: string[] } {
    const paramNames: string[] = [];

    // 将路径参数转换为正则表达式捕获组
    const patternStr = path
      .replace(/:([^/]+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return "([^/]+)";
      })
      .replace(/\*/g, "(.*)");

    return {
      pattern: new RegExp(`^${patternStr}$`),
      paramNames,
    };
  }

  /**
   * 匹配路由
   */
  private matchRoute(method: string, pathname: string): { route: Route; params: Record<string, string> } | null {
    for (const route of this.routes) {
      if (route.method !== method) continue;

      const match = pathname.match(route.pattern);
      if (match) {
        const params: Record<string, string> = {};

        route.paramNames.forEach((name, index) => {
          params[name] = match[index + 1] ?? "";
        });

        return { route, params };
      }
    }

    return null;
  }

  /**
   * 处理请求
   */
  async handle(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method.toUpperCase() as HttpMethod;
    const pathname = url.pathname;

    // 执行中间件链
    let handler = async (_req: Request): Promise<Response> => {
      const match = this.matchRoute(method, pathname);

      if (!match) {
        return errorResponse("Not Found", 404);
      }

      const { route, params } = match;
      const queryParams = parseQueryString(request.url);

      const routeParams: RouteParams = {
        path: params,
        query: queryParams,
      };

      // 解析请求体
      if (["POST", "PUT", "PATCH"].includes(method)) {
        try {
          (routeParams as { body?: unknown }).body = await parseBody(request);
        } catch {
          // 忽略解析错误
        }
      }

      return await route.handler(request, routeParams);
    };

    // 逆序应用中间件
    for (let i = this.middlewares.length - 1; i >= 0; i--) {
      const middleware = this.middlewares[i]!;
      const nextHandler = handler;
      handler = async (req) => await middleware(req, nextHandler);
    }

    return await handler(request);
  }

  /**
   * 获取所有路由
   */
  getRoutes(): readonly Route[] {
    return [...this.routes];
  }
}

// ============================================================================
// 中间件工厂
// ============================================================================

/**
 * 日志中间件
 */
export function loggerMiddleware(): Middleware {
  return async (request, next) => {
    const start = performance.now();
    const url = new URL(request.url);

    console.log(`[${new Date().toISOString()}] ${request.method} ${url.pathname}`);

    const response = await next(request);

    const duration = performance.now() - start;
    console.log(`[${new Date().toISOString()}] ${response.status} (${duration.toFixed(2)}ms)`);

    return response;
  };
}

/**
 * CORS 中间件
 */
export function corsMiddleware(config: CorsConfig): Middleware {
  const origins = Array.isArray(config.origin) ? config.origin : [config.origin];
  const methods = config.methods ?? ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];
  const headers = config.headers ?? ["Content-Type", "Authorization"];

  return async (request, next) => {
    const origin = request.headers.get("origin") ?? "";
    const allowedOrigin = origins.includes("*") ? "*" : origins.includes(origin) ? origin : "";

    // 处理预检请求
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Methods": methods.join(", "),
          "Access-Control-Allow-Headers": headers.join(", "),
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    const response = await next(request);

    // 添加 CORS 头
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", allowedOrigin);

    if (config.credentials) {
      newHeaders.set("Access-Control-Allow-Credentials", "true");
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
}

/**
 * 速率限制中间件
 */
export function rateLimitMiddleware(config: RateLimitConfig): Middleware {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return async (request, next) => {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const now = Date.now();

    const record = requests.get(ip);

    if (!record || now > record.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + config.windowMs });
    } else {
      record.count++;

      if (record.count > config.maxRequests) {
        return errorResponse("Too Many Requests", 429);
      }
    }

    return await next(request);
  };
}

/**
 * 错误处理中间件
 */
export function errorMiddleware(): Middleware {
  return async (request, next) => {
    try {
      return await next(request);
    } catch (error) {
      console.error("Unhandled error:", error);

      if (error instanceof Error) {
        return errorResponse(error.message, 500);
      }

      return errorResponse("Internal Server Error", 500);
    }
  };
}

/**
 * 静态文件中间件
 */
export function staticMiddleware(dir: string): Middleware {
  return async (request, next) => {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 只处理 GET 请求
    if (request.method !== "GET") {
      return await next(request);
    }

    try {
      const filePath = `${dir}${pathname}`;
      const fileInfo = await Deno.stat(filePath);

      if (fileInfo.isFile) {
        const content = await Deno.readFile(filePath);
        const ext = pathname.split(".").pop() ?? "";
        const contentType = getContentType(ext);

        return new Response(content, {
          headers: { "Content-Type": contentType },
        });
      }
    } catch {
      // 文件不存在，继续处理
    }

    return await next(request);
  };
}

/**
 * 获取文件 MIME 类型
 */
function getContentType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    html: "text/html; charset=utf-8",
    css: "text/css",
    js: "application/javascript",
    json: "application/json",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    pdf: "application/pdf",
    zip: "application/zip",
    txt: "text/plain; charset=utf-8",
    md: "text/markdown; charset=utf-8",
  };

  return mimeTypes[ext] ?? "application/octet-stream";
}

// ============================================================================
// 模板引擎
// ============================================================================

/**
 * 简单模板引擎
 *
 * TypeScript 优势：使用泛型确保模板上下文类型安全
 */
export class TemplateEngine {
  private cache = new Map<string, string>();
  private templateDir: string;

  constructor(templateDir: string) {
    this.templateDir = templateDir;
  }

  /**
   * 渲染模板
   */
  async render(templateName: string, context: TemplateContext = {}): Promise<string> {
    let template = this.cache.get(templateName);

    if (!template) {
      const templatePath = `${this.templateDir}/${templateName}`;
      template = await Deno.readTextFile(templatePath);
      this.cache.set(templateName, template);
    }

    // 替换变量 {{variable}}
    let result = template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      const value = context[key];
      return value !== undefined ? String(value) : "";
    });

    // 处理条件语句 {{#if condition}}...{{/if}}
    result = result.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, content) => {
      return context[key] ? content : "";
    });

    // 处理循环 {{#each items}}...{{/each}}
    result = result.replace(
      /\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
      (_, key, template) => {
        const items = context[key];
        if (!Array.isArray(items)) return "";

        return items
          .map((item) => {
            let itemResult = template;
            if (typeof item === "object" && item !== null) {
              for (const [k, v] of Object.entries(item)) {
                itemResult = itemResult.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), String(v));
              }
            }
            return itemResult;
          })
          .join("");
      },
    );

    return result;
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// ============================================================================
// 认证工具
// ============================================================================

/**
 * 简单的 JWT 工具（仅用于演示，生产环境请使用专业库）
 */
export class JwtAuth {
  private secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  /**
   * 创建 JWT Token
   *
   * 注意：这是一个简化的实现，生产环境请使用专业的 JWT 库
   */
  createToken(payload: Omit<JwtPayload, "iat" | "exp">, expiresIn = 3600): string {
    const now = Math.floor(Date.now() / 1000);
    const fullPayload: JwtPayload = {
      ...payload,
      iat: now,
      exp: now + expiresIn,
    };

    // 简化的 Base64 编码（仅用于演示）
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = btoa(JSON.stringify(fullPayload));
    const signature = btoa(`${header}.${body}.${this.secret}`);

    return `${header}.${body}.${signature}`;
  }

  /**
   * 验证 JWT Token
   */
  verifyToken(token: string): JwtPayload | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]!)) as JwtPayload;

      // 检查过期时间
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }
}

/**
 * 认证中间件
 */
export function authMiddleware(jwt: JwtAuth): Middleware {
  return async (request, next) => {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse("Unauthorized", 401);
    }

    const token = authHeader.slice(7);
    const payload = jwt.verifyToken(token);

    if (!payload) {
      return errorResponse("Invalid token", 401);
    }

    // 将用户信息添加到请求头
    const newHeaders = new Headers(request.headers);
    newHeaders.set("x-user-id", payload.sub);
    newHeaders.set("x-user-role", payload.role);

    const newRequest = new Request(request.url, {
      method: request.method,
      headers: newHeaders,
      body: request.body,
    });

    return await next(newRequest);
  };
}

// ============================================================================
// Web 服务器
// ============================================================================

/**
 * Web 服务器类
 *
 * TypeScript 优势：
 * - 使用接口定义配置
 * - 使用 readonly 保护配置不可变
 */
export class WebServer {
  private config: ServerConfig;
  private router: Router;
  private templateEngine?: TemplateEngine;
  private jwt?: JwtAuth;

  constructor(config: ServerConfig) {
    this.config = config;
    this.router = new Router();

    if (config.templateDir) {
      this.templateEngine = new TemplateEngine(config.templateDir);
    }
  }

  /**
   * 获取路由器
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * 获取模板引擎
   */
  getTemplateEngine(): TemplateEngine | undefined {
    return this.templateEngine;
  }

  /**
   * 设置 JWT 认证
   */
  setJwtAuth(secret: string): void {
    this.jwt = new JwtAuth(secret);
  }

  /**
   * 获取 JWT 认证器
   */
  getJwtAuth(): JwtAuth | undefined {
    return this.jwt;
  }

  /**
   * 启动服务器
   */
  async start(): Promise<void> {
    // 添加默认中间件
    this.router.use(errorMiddleware());
    this.router.use(loggerMiddleware());

    if (this.config.cors) {
      this.router.use(corsMiddleware(this.config.cors));
    }

    if (this.config.rateLimit) {
      this.router.use(rateLimitMiddleware(this.config.rateLimit));
    }

    if (this.config.staticDir) {
      this.router.use(staticMiddleware(this.config.staticDir));
    }

    // 启动 HTTP 服务器
    const server = Deno.serve(
      {
        port: this.config.port,
        hostname: this.config.hostname ?? "0.0.0.0",
      },
      (request) => this.router.handle(request),
    );

    console.log(`Server running on http://localhost:${this.config.port}`);

    // 等待服务器关闭
    await server.finished;
  }
}

// ============================================================================
// 导出类型
// ============================================================================

export type {
  HttpMethod,
  RouteHandler,
  RouteParams,
  Route,
  Middleware,
  ServerConfig,
  CorsConfig,
  RateLimitConfig,
  TemplateContext,
  Session,
  User,
  JwtPayload,
};
