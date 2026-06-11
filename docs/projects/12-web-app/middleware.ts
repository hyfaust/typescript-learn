/**
 * middleware.ts - 中间件实现
 *
 * 本文件实现了各种 Web 中间件：
 * - 请求日志中间件
 * - 身份验证中间件
 * - 请求验证中间件
 * - 缓存中间件
 * - 压缩中间件
 *
 * TypeScript 优势：
 * - 接口定义中间件配置
 * - 类型安全的请求/响应处理
 * - 泛型支持通用中间件逻辑
 */

import {
  jsonResponse,
  errorResponse,
  type Middleware,
  type HttpMethod,
  type JwtPayload,
} from "./server.ts";

// ============================================================================
// 类型定义
// ============================================================================

/** 日志级别 */
type LogLevel = "debug" | "info" | "warn" | "error";

/** 日志配置 */
interface LogConfig {
  readonly level: LogLevel;
  readonly format: "json" | "text";
  readonly includeHeaders?: boolean;
  readonly includeBody?: boolean;
}

/** 请求日志条目 */
interface RequestLog {
  readonly timestamp: string;
  readonly method: string;
  readonly path: string;
  readonly status: number;
  readonly duration: number;
  readonly ip: string;
  readonly userAgent: string;
  readonly requestId: string;
}

/** 验证规则 */
interface ValidationRule {
  readonly field: string;
  readonly type: "string" | "number" | "boolean" | "array" | "object";
  readonly required?: boolean;
  readonly minLength?: number;
  readonly maxLength?: number;
  readonly min?: number;
  readonly max?: number;
  readonly pattern?: RegExp;
  readonly custom?: (value: unknown) => boolean;
}

/** 验证错误 */
interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly value?: unknown;
}

/** 缓存配置 */
interface CacheConfig {
  readonly maxAge: number;
  readonly staleWhileRevalidate?: number;
  readonly keyGenerator?: (request: Request) => string;
}

/** 缓存条目 */
interface CacheEntry {
  readonly response: Response;
  readonly timestamp: number;
  readonly maxAge: number;
}

/** 安全配置 */
interface SecurityConfig {
  readonly contentSecurityPolicy?: string;
  readonly xFrameOptions?: string;
  readonly xContentTypeOptions?: boolean;
  readonly strictTransportSecurity?: string;
  readonly referrerPolicy?: string;
}

/** 限流配置 */
interface ThrottleConfig {
  readonly windowMs: number;
  readonly maxRequests: number;
  readonly keyGenerator?: (request: Request) => string;
  readonly message?: string;
}

/** 限流记录 */
interface ThrottleRecord {
  readonly count: number;
  readonly resetTime: number;
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 生成唯一请求 ID
 */
function generateRequestId(): string {
  return crypto.randomUUID();
}

/**
 * 获取客户端 IP
 */
function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
}

/**
 * 格式化持续时间
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * 日志级别优先级
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// ============================================================================
// 请求日志中间件
// ============================================================================

/**
 * 创建请求日志中间件
 *
 * TypeScript 优势：使用接口定义配置选项
 */
export function createRequestLogger(config: LogConfig = { level: "info", format: "text" }): Middleware {
  const minPriority = LOG_LEVEL_PRIORITY[config.level];

  return async (request, next) => {
    const requestId = generateRequestId();
    const startTime = performance.now();
    const url = new URL(request.url);

    // 添加请求 ID 到请求头
    const newHeaders = new Headers(request.headers);
    newHeaders.set("x-request-id", requestId);

    const newRequest = new Request(request.url, {
      method: request.method,
      headers: newHeaders,
      body: request.body,
    });

    try {
      const response = await next(newRequest);
      const duration = performance.now() - startTime;

      const logEntry: RequestLog = {
        timestamp: new Date().toISOString(),
        method: request.method,
        path: url.pathname,
        status: response.status,
        duration,
        ip: getClientIp(request),
        userAgent: request.headers.get("user-agent") ?? "unknown",
        requestId,
      };

      // 根据状态码确定日志级别
      let logLevel: LogLevel;
      if (response.status >= 500) logLevel = "error";
      else if (response.status >= 400) logLevel = "warn";
      else logLevel = "info";

      if (LOG_LEVEL_PRIORITY[logLevel] >= minPriority) {
        if (config.format === "json") {
          console.log(JSON.stringify(logEntry));
        } else {
          const statusColor = response.status >= 400 ? "\x1b[31m" : "\x1b[32m";
          console.log(
            `[${logEntry.timestamp}] ${logEntry.method} ${logEntry.path} ` +
              `${statusColor}${logEntry.status}\x1b[0m} ${formatDuration(logEntry.duration)} ` +
              `[${logEntry.ip}] [${logEntry.requestId}]`,
          );
        }
      }

      // 添加响应头
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set("x-request-id", requestId);
      responseHeaders.set("x-response-time", formatDuration(duration));

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`[${new Date().toISOString()}] ERROR ${request.method} ${url.pathname} ${formatDuration(duration)}:`, error);
      throw error;
    }
  };
}

// ============================================================================
// 身份验证中间件
// ============================================================================

/**
 * 创建 JWT 认证中间件
 */
export function createAuthMiddleware(secret: string, options: { required?: boolean } = {}): Middleware {
  const { required = true } = options;

  return async (request, next) => {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      if (required) {
        return errorResponse("Authorization header is required", 401);
      }
      return await next(request);
    }

    if (!authHeader.startsWith("Bearer ")) {
      return errorResponse("Invalid authorization format", 401);
    }

    const token = authHeader.slice(7);

    try {
      // 简化的 JWT 验证（生产环境请使用专业库）
      const parts = token.split(".");
      if (parts.length !== 3) {
        return errorResponse("Invalid token format", 401);
      }

      const payload = JSON.parse(atob(parts[1]!)) as JwtPayload;

      // 检查过期时间
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return errorResponse("Token has expired", 401);
      }

      // 将用户信息添加到请求头
      const newHeaders = new Headers(request.headers);
      newHeaders.set("x-user-id", payload.sub);
      newHeaders.set("x-user-role", payload.role);
      newHeaders.set("x-username", payload.username);

      const newRequest = new Request(request.url, {
        method: request.method,
        headers: newHeaders,
        body: request.body,
      });

      return await next(newRequest);
    } catch {
      return errorResponse("Invalid token", 401);
    }
  };
}

/**
 * 创建角色授权中间件
 */
export function createRoleMiddleware(allowedRoles: string[]): Middleware {
  return async (request, next) => {
    const userRole = request.headers.get("x-user-role");

    if (!userRole || !allowedRoles.includes(userRole)) {
      return errorResponse("Insufficient permissions", 403);
    }

    return await next(request);
  };
}

// ============================================================================
// 请求验证中间件
// ============================================================================

/**
 * 验证单个字段
 */
function validateField(value: unknown, rule: ValidationRule): ValidationError | null {
  // 检查必需字段
  if (rule.required && (value === undefined || value === null || value === "")) {
    return {
      field: rule.field,
      message: `${rule.field} is required`,
      value,
    };
  }

  // 如果字段不是必需的且为空，跳过其他验证
  if (!rule.required && (value === undefined || value === null)) {
    return null;
  }

  // 类型检查
  if (rule.type === "array") {
    if (!Array.isArray(value)) {
      return { field: rule.field, message: `${rule.field} must be an array`, value };
    }
  } else if (rule.type === "object") {
    if (typeof value !== "object" || Array.isArray(value)) {
      return { field: rule.field, message: `${rule.field} must be an object`, value };
    }
  } else if (typeof value !== rule.type) {
    return { field: rule.field, message: `${rule.field} must be of type ${rule.type}`, value };
  }

  // 字符串验证
  if (rule.type === "string" && typeof value === "string") {
    if (rule.minLength !== undefined && value.length < rule.minLength) {
      return { field: rule.field, message: `${rule.field} must be at least ${rule.minLength} characters`, value };
    }
    if (rule.maxLength !== undefined && value.length > rule.maxLength) {
      return { field: rule.field, message: `${rule.field} must be at most ${rule.maxLength} characters`, value };
    }
    if (rule.pattern && !rule.pattern.test(value)) {
      return { field: rule.field, message: `${rule.field} has invalid format`, value };
    }
  }

  // 数字验证
  if (rule.type === "number" && typeof value === "number") {
    if (rule.min !== undefined && value < rule.min) {
      return { field: rule.field, message: `${rule.field} must be at least ${rule.min}`, value };
    }
    if (rule.max !== undefined && value > rule.max) {
      return { field: rule.field, message: `${rule.field} must be at most ${rule.max}`, value };
    }
  }

  // 自定义验证
  if (rule.custom && !rule.custom(value)) {
    return { field: rule.field, message: `${rule.field} is invalid`, value };
  }

  return null;
}

/**
 * 创建请求体验证中间件
 *
 * TypeScript 优势：使用接口定义验证规则
 */
export function createValidationMiddleware(rules: ValidationRule[]): Middleware {
  return async (request, next) => {
    // 只验证 POST/PUT/PATCH 请求
    if (!["POST", "PUT", "PATCH"].includes(request.method)) {
      return await next(request);
    }

    try {
      const body = await request.json();
      const errors: ValidationError[] = [];

      for (const rule of rules) {
        const value = (body as Record<string, unknown>)[rule.field];
        const error = validateField(value, rule);
        if (error) {
          errors.push(error);
        }
      }

      if (errors.length > 0) {
        return jsonResponse(
          {
            success: false,
            error: "Validation failed",
            details: errors,
          },
          400,
        );
      }

      // 重新构造请求（因为 body 已被读取）
      const newRequest = new Request(request.url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(body),
      });

      return await next(newRequest);
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }
  };
}

// ============================================================================
// 缓存中间件
// ============================================================================

/**
 * 创建缓存中间件
 */
export function createCacheMiddleware(config: CacheConfig): Middleware {
  const cache = new Map<string, CacheEntry>();

  const defaultKeyGenerator = (request: Request): string => {
    const url = new URL(request.url);
    return `${request.method}:${url.pathname}${url.search}`;
  };

  const keyGenerator = config.keyGenerator ?? defaultKeyGenerator;

  return async (request, next) => {
    // 只缓存 GET 请求
    if (request.method !== "GET") {
      return await next(request);
    }

    const key = keyGenerator(request);
    const cached = cache.get(key);

    // 检查缓存是否有效
    if (cached && Date.now() - cached.timestamp < cached.maxAge * 1000) {
      const headers = new Headers(cached.response.headers);
      headers.set("x-cache", "HIT");
      headers.set("x-cache-age", String(Math.floor((Date.now() - cached.timestamp) / 1000)));

      return new Response(cached.response.body, {
        status: cached.response.status,
        statusText: cached.response.statusText,
        headers,
      });
    }

    const response = await next(request);

    // 只缓存成功的响应
    if (response.status >= 200 && response.status < 300) {
      // 克隆响应以存储到缓存
      const responseClone = response.clone();

      cache.set(key, {
        response: responseClone,
        timestamp: Date.now(),
        maxAge: config.maxAge,
      });
    }

    // 添加缓存头
    const headers = new Headers(response.headers);
    headers.set("x-cache", "MISS");
    headers.set("cache-control", `max-age=${config.maxAge}`);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}

/**
 * 清除缓存
 */
export function clearCache(cache: Map<string, CacheEntry>): void {
  cache.clear();
}

// ============================================================================
// 安全中间件
// ============================================================================

/**
 * 创建安全头中间件
 */
export function createSecurityMiddleware(config: SecurityConfig = {}): Middleware {
  const {
    contentSecurityPolicy = "default-src 'self'",
    xFrameOptions = "DENY",
    xContentTypeOptions = true,
    strictTransportSecurity = "max-age=31536000; includeSubDomains",
    referrerPolicy = "strict-origin-when-cross-origin",
  } = config;

  return async (request, next) => {
    const response = await next(request);
    const headers = new Headers(response.headers);

    if (contentSecurityPolicy) {
      headers.set("content-security-policy", contentSecurityPolicy);
    }

    if (xFrameOptions) {
      headers.set("x-frame-options", xFrameOptions);
    }

    if (xContentTypeOptions) {
      headers.set("x-content-type-options", "nosniff");
    }

    if (strictTransportSecurity) {
      headers.set("strict-transport-security", strictTransportSecurity);
    }

    if (referrerPolicy) {
      headers.set("referrer-policy", referrerPolicy);
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}

// ============================================================================
// 限流中间件
// ============================================================================

/**
 * 创建限流中间件
 *
 * TypeScript 优势：使用 Map 和接口确保类型安全
 */
export function createThrottleMiddleware(config: ThrottleConfig): Middleware {
  const records = new Map<string, ThrottleRecord>();

  const defaultKeyGenerator = (request: Request): string => {
    return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  };

  const keyGenerator = config.keyGenerator ?? defaultKeyGenerator;

  return async (request, next) => {
    const key = keyGenerator(request);
    const now = Date.now();

    let record = records.get(key);

    // 重置过期的记录
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + config.windowMs };
      records.set(key, record);
    }

    record.count++;

    // 检查是否超过限制
    if (record.count > config.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);

      return jsonResponse(
        {
          success: false,
          error: config.message ?? "Too many requests",
          retryAfter,
        },
        429,
        {
          "retry-after": String(retryAfter),
          "x-ratelimit-limit": String(config.maxRequests),
          "x-ratelimit-remaining": "0",
          "x-ratelimit-reset": String(Math.ceil(record.resetTime / 1000)),
        },
      );
    }

    const response = await next(request);

    // 添加限流头
    const headers = new Headers(response.headers);
    headers.set("x-ratelimit-limit", String(config.maxRequests));
    headers.set("x-ratelimit-remaining", String(config.maxRequests - record.count));
    headers.set("x-ratelimit-reset", String(Math.ceil(record.resetTime / 1000)));

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}

// ============================================================================
// 错误处理中间件
// ============================================================================

/**
 * 创建错误处理中间件
 */
export function createErrorHandlerMiddleware(options: {
  showStack?: boolean;
  logErrors?: boolean;
} = {}): Middleware {
  const { showStack = false, logErrors = true } = options;

  return async (request, next) => {
    try {
      return await next(request);
    } catch (error) {
      if (logErrors) {
        console.error(`[${new Date().toISOString()}] Error handling ${request.method} ${request.url}:`);
        console.error(error);
      }

      if (error instanceof Error) {
        const body: Record<string, unknown> = {
          success: false,
          error: error.message,
        };

        if (showStack && error.stack) {
          body.stack = error.stack.split("\n");
        }

        return jsonResponse(body, 500);
      }

      return errorResponse("Internal Server Error", 500);
    }
  };
}

// ============================================================================
// 响应压缩中间件（简化版）
// ============================================================================

/**
 * 创建响应压缩中间件
 *
 * 注意：这是一个简化的实现，生产环境请使用专业库
 */
export function createCompressionMiddleware(options: {
  threshold?: number;
  mimeTypes?: string[];
} = {}): Middleware {
  const { threshold = 1024, mimeTypes = ["text/html", "text/css", "application/javascript", "application/json"] } = options;

  return async (request, next) => {
    const acceptEncoding = request.headers.get("accept-encoding") ?? "";

    if (!acceptEncoding.includes("gzip")) {
      return await next(request);
    }

    const response = await next(request);
    const contentType = response.headers.get("content-type") ?? "";

    // 检查是否应该压缩
    const shouldCompress = mimeTypes.some((type) => contentType.includes(type));

    if (!shouldCompress) {
      return response;
    }

    // 读取响应体
    const text = await response.text();

    // 检查大小阈值
    if (text.length < threshold) {
      return new Response(text, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }

    // 使用 Deno 的 CompressionStream
    const encoder = new TextEncoder();
    const compressed = encoder.encode(text); // 简化：实际应该使用 gzip 压缩

    const headers = new Headers(response.headers);
    headers.set("content-encoding", "gzip");
    headers.set("content-length", String(compressed.length));

    return new Response(compressed, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}

// ============================================================================
// CORS 中间件
// ============================================================================

/**
 * 创建 CORS 中间件
 */
export function createCorsMiddleware(options: {
  origin?: string | string[] | ((origin: string) => boolean);
  methods?: HttpMethod[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
} = {}): Middleware {
  const {
    origin = "*",
    methods = ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders = ["Content-Type", "Authorization"],
    exposedHeaders = [],
    credentials = false,
    maxAge = 86400,
  } = options;

  return async (request, next) => {
    const requestOrigin = request.headers.get("origin") ?? "";

    // 确定允许的源
    let allowedOrigin: string;
    if (typeof origin === "function") {
      allowedOrigin = origin(requestOrigin) ? requestOrigin : "";
    } else if (Array.isArray(origin)) {
      allowedOrigin = origin.includes(requestOrigin) ? requestOrigin : "";
    } else {
      allowedOrigin = origin === "*" ? "*" : origin;
    }

    // 处理预检请求
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": allowedOrigin,
          "access-control-allow-methods": methods.join(", "),
          "access-control-allow-headers": allowedHeaders.join(", "),
          "access-control-max-age": String(maxAge),
          ...(credentials ? { "access-control-allow-credentials": "true" } : {}),
        },
      });
    }

    const response = await next(request);
    const headers = new Headers(response.headers);

    headers.set("access-control-allow-origin", allowedOrigin);

    if (exposedHeaders.length > 0) {
      headers.set("access-control-expose-headers", exposedHeaders.join(", "));
    }

    if (credentials) {
      headers.set("access-control-allow-credentials", "true");
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}

// ============================================================================
// 导出类型
// ============================================================================

export type {
  LogLevel,
  LogConfig,
  RequestLog,
  ValidationRule,
  ValidationError,
  CacheConfig,
  CacheEntry,
  SecurityConfig,
  ThrottleConfig,
  ThrottleRecord,
};
